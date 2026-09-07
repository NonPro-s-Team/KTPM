param(
    [ValidateSet('baseline', 'final')]
    [string]$Label = 'baseline',
    [string]$ServerUrl = 'http://127.0.0.1:9000',
    [string]$ProjectKey = 'green-juice-hub-admin-dashboard'
)

$ErrorActionPreference = 'Stop'
$allowedHosts = @('localhost', '127.0.0.1', '::1')
$serverUri = [Uri]$ServerUrl
if ($serverUri.Scheme -notin @('http', 'https') -or $serverUri.Host -notin $allowedHosts) {
    throw 'ServerUrl must point to a local SonarQube instance.'
}
if (-not $env:SONAR_TOKEN) {
    throw 'Set SONAR_TOKEN to a local SonarQube analysis token before running this script.'
}
$headers = @{ Authorization = 'Bearer ' + $env:SONAR_TOKEN }
$previousAnalysisKey = $null
try {
    $previousAnalysis = Invoke-RestMethod "$ServerUrl/api/project_analyses/search?project=$ProjectKey&ps=1" -Headers $headers
    $previousAnalysisKey = @($previousAnalysis.analyses)[0].key
} catch { }

$repo = [IO.Path]::GetFullPath((Join-Path $PSScriptRoot '../..'))
$evidence = Join-Path $repo 'test-evidence/sonarqube-admin-dashboard'
New-Item -ItemType Directory -Force $evidence | Out-Null

docker compose -f (Join-Path $PSScriptRoot 'compose.yml') up -d
if ($LASTEXITCODE -ne 0) { throw "Could not start local SonarQube: $LASTEXITCODE" }

$ready = $false
for ($attempt = 0; $attempt -lt 60; $attempt++) {
    try {
        $status = Invoke-RestMethod "$ServerUrl/api/system/status" -TimeoutSec 2
        if ($status.status -eq 'UP') { $ready = $true; break }
    } catch { }
    Start-Sleep -Seconds 2
}
if (-not $ready) { throw "SonarQube was not ready after 120 seconds: $ServerUrl" }

# Explicit QLPT-278 scope. No issue, rule or severity is suppressed.
$scope = @(
    'backend/src/main/java/**/controller/Admin*Controller.java',
    'backend/src/main/java/**/controller/DashboardController.java',
    'backend/src/main/java/**/service/**/*Admin*.java',
    'backend/src/main/java/**/service/dashboard/**/*.java',
    'backend/src/main/java/**/dto/admin*/**/*.java',
    'backend/src/main/java/**/dto/dashboard/**/*.java',
    'frontend/src/pages/admin/**/*.jsx',
    'frontend/src/api/admin*.js',
    'frontend/src/api/dashboardApi.js',
    'frontend/src/components/layout/Admin*.jsx'
) -join ','

$scanLog = Join-Path $evidence "$Label-scan.log"
Push-Location (Join-Path $repo 'backend')
try {
    & ./mvnw.cmd -B verify `
        '-Dtest=BackendApplicationTests,AdminControllersUnitTest,AdminDashboardMockMvcIntegrationTest' `
        2>&1 | Tee-Object -FilePath $scanLog
    if ($LASTEXITCODE -ne 0) { throw "Maven tests failed: $LASTEXITCODE" }
} finally {
    Pop-Location
}

$scannerUrl = "{0}://host.docker.internal:{1}" -f $serverUri.Scheme, $serverUri.Port
$scannerArgs = @(
    'run', '--rm',
    '--env', 'SONAR_TOKEN',
    '--env', "SONAR_HOST_URL=$scannerUrl",
    '--volume', "${repo}:/usr/src:ro",
    'sonarsource/sonar-scanner-cli:latest',
    '-Dsonar.projectBaseDir=/usr/src',
    '-Dsonar.working.directory=/tmp/sonar-work',
    "-Dsonar.projectKey=$ProjectKey",
    '-Dsonar.projectName=Green Juice Hub - Admin Dashboard',
    '-Dsonar.sources=backend/src/main/java,frontend/src',
    '-Dsonar.tests=backend/src/test/java',
    "-Dsonar.inclusions=$scope",
    '-Dsonar.test.inclusions=backend/src/test/java/**/*Admin*Test.java,backend/src/test/java/**/BackendApplicationTests.java',
    '-Dsonar.java.binaries=backend/target/classes',
    '-Dsonar.java.test.binaries=backend/target/test-classes',
    '-Dsonar.coverage.jacoco.xmlReportPaths=backend/target/site/jacoco/jacoco.xml',
    '-Dsonar.exclusions=frontend/node_modules/**,frontend/dist/**,e2e/node_modules/**,e2e/output/**',
    '-Dsonar.scanner.skipJreProvisioning=true'
)
& docker @scannerArgs 2>&1 | Tee-Object -FilePath $scanLog -Append
if ($LASTEXITCODE -ne 0) { throw "Sonar scan failed: $LASTEXITCODE" }

$analysis = $null
$analysisReady = $false
for ($attempt = 0; $attempt -lt 60; $attempt++) {
    try {
        $analysis = Invoke-RestMethod "$ServerUrl/api/project_analyses/search?project=$ProjectKey&ps=1" -Headers $headers
        $latestAnalysisKey = @($analysis.analyses)[0].key
        if ($latestAnalysisKey -and $latestAnalysisKey -ne $previousAnalysisKey) {
            $analysisReady = $true
            break
        }
    } catch { }
    Start-Sleep -Seconds 1
}
if (-not $analysisReady) { throw 'SonarQube did not publish the new analysis within 60 seconds.' }

$issues = @()
for ($page = 1; ; $page++) {
    $result = Invoke-RestMethod "$ServerUrl/api/issues/search?componentKeys=$ProjectKey&resolved=false&ps=500&p=$page" -Headers $headers
    $issues += @($result.issues | Select-Object key, rule, severity, type, component, line, message, impacts)
    if ($page * 500 -ge $result.paging.total) { break }
}
$hotspotResult = Invoke-RestMethod "$ServerUrl/api/hotspots/search?projectKey=$ProjectKey&ps=500" -Headers $headers
$measures = Invoke-RestMethod "$ServerUrl/api/measures/component?component=$ProjectKey&metricKeys=blocker_violations,critical_violations,bugs,vulnerabilities,security_hotspots,coverage,ncloc" -Headers $headers
$gate = Invoke-RestMethod "$ServerUrl/api/qualitygates/project_status?projectKey=$ProjectKey" -Headers $headers
$hotspots = @($hotspotResult.hotspots | Select-Object key, component, line, message, status, resolution, securityCategory, vulnerabilityProbability)
$tagFindings = @($issues + $hotspots | Where-Object { $_.component -like '*AdminTagController.java' })

$snapshot = [ordered]@{
    exportedAt = (Get-Date).ToString('o')
    serverVersion = (Invoke-RestMethod "$ServerUrl/api/server/version")
    projectKey = $ProjectKey
    scope = $scope -split ','
    analysis = @($analysis.analyses | Select-Object key, date, revision)
    measures = $measures.component.measures
    qualityGate = $gate.projectStatus
    issueCount = $issues.Count
    issues = $issues
    hotspotCount = $hotspots.Count
    hotspots = $hotspots
    adminTagControllerFindingCount = $tagFindings.Count
    adminTagControllerFindings = $tagFindings
}
$snapshot | ConvertTo-Json -Depth 20 | Set-Content (Join-Path $evidence "$Label.json") -Encoding utf8

$critical = @($issues | Where-Object { $_.severity -in @('BLOCKER', 'CRITICAL') })
Write-Output "$Label snapshot: $($issues.Count) open issues; $($critical.Count) Blocker/Critical; $($hotspots.Count) hotspots."
Write-Output "AdminTagController findings: $($tagFindings.Count)."
$critical | Format-Table severity, rule, component, line, message -AutoSize
