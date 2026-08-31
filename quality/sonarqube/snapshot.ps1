param([ValidateSet('baseline','final')][string]$Label = 'final', [string]$ServerUrl = 'http://127.0.0.1:9000')
$ErrorActionPreference = 'Stop'
if (-not $env:SONAR_TOKEN) { throw 'Set SONAR_TOKEN before exporting the review.' }
$repo = [IO.Path]::GetFullPath((Join-Path $PSScriptRoot '../..'))
$destination = Join-Path $repo 'test-evidence/sonarqube-checkout'
New-Item -ItemType Directory -Force $destination | Out-Null
$headers = @{ Authorization = 'Bearer ' + $env:SONAR_TOKEN }
$projectKey = 'green-juice-hub-checkout'
$issues = @()
for ($page = 1; ; $page++) {
    $result = Invoke-RestMethod "$ServerUrl/api/issues/search?componentKeys=$projectKey&resolved=false&ps=500&p=$page" -Headers $headers
    $issues += @($result.issues | Select-Object key,rule,severity,type,component,line,message,impacts)
    if ($page * 500 -ge $result.paging.total) { break }
}
$hotspots = Invoke-RestMethod "$ServerUrl/api/hotspots/search?projectKey=$projectKey&ps=500" -Headers $headers
$measures = Invoke-RestMethod "$ServerUrl/api/measures/component?component=$projectKey&metricKeys=blocker_violations,critical_violations,bugs,vulnerabilities,security_hotspots,coverage,ncloc" -Headers $headers
$gate = Invoke-RestMethod "$ServerUrl/api/qualitygates/project_status?projectKey=$projectKey" -Headers $headers
$analysis = Invoke-RestMethod "$ServerUrl/api/project_analyses/search?project=$projectKey&ps=1" -Headers $headers
$profiles = Invoke-RestMethod "$ServerUrl/api/qualityprofiles/search?project=$projectKey" -Headers $headers
$snapshot = [ordered]@{
    exportedAt = (Get-Date).ToString('o'); serverVersion = (Invoke-RestMethod "$ServerUrl/api/server/version")
    projectKey = $projectKey; analysis = @($analysis.analyses | Select-Object key,date,revision)
    profiles = @($profiles.profiles | Select-Object key,name,language,activeRuleCount,rulesUpdatedAt)
    measures = $measures.component.measures; qualityGate = $gate.projectStatus
    issueCount = $issues.Count; issues = $issues
    hotspots = @($hotspots.hotspots | Select-Object key,component,line,message,status,resolution,securityCategory,vulnerabilityProbability)
}
$snapshot | ConvertTo-Json -Depth 20 | Set-Content (Join-Path $destination "$Label.json") -Encoding utf8
$critical = @($issues | Where-Object { $_.severity -in @('BLOCKER','CRITICAL') })
Write-Output "$Label snapshot: $($issues.Count) open issues; $($critical.Count) Blocker/Critical; $($snapshot.hotspots.Count) hotspots."
$critical | Format-Table severity,rule,line,message -AutoSize
