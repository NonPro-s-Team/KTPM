param(
    [ValidateSet('baseline', 'final')]
    [string]$Label = 'final',
    [string]$ServerUrl = 'http://127.0.0.1:9000',
    [string]$ScanRoot,
    [string]$ScannerImage = 'sonarsource/sonar-scanner-cli:latest',
    [switch]$SkipBuild
)

$ErrorActionPreference = 'Stop'

if ([string]::IsNullOrWhiteSpace($env:SONAR_TOKEN)) {
    throw 'Set SONAR_TOKEN to a local SonarQube analysis token.'
}

$repo = [IO.Path]::GetFullPath((Join-Path $PSScriptRoot '../..'))
if ([string]::IsNullOrWhiteSpace($ScanRoot)) {
    $ScanRoot = $repo
}
$scanRootPath = [IO.Path]::GetFullPath($ScanRoot)
$propertiesPath = Join-Path $PSScriptRoot 'sonar-project.properties'
$scannerWork = Join-Path $PSScriptRoot '.scannerwork'
$metadataPath = Join-Path $scannerWork 'report-task.txt'

if (-not (Test-Path -LiteralPath (Join-Path $scanRootPath 'backend/pom.xml'))) {
    throw "The scan root does not contain backend/pom.xml: $scanRootPath"
}
if (-not (Test-Path -LiteralPath (Join-Path $scanRootPath 'frontend/package.json'))) {
    throw "The scan root does not contain frontend/package.json: $scanRootPath"
}

if (-not $SkipBuild) {
    Push-Location (Join-Path $scanRootPath 'backend')
    try {
        & ./mvnw.cmd -B clean verify
        if ($LASTEXITCODE -ne 0) { throw "Backend verification failed: $LASTEXITCODE" }

        & ./mvnw.cmd -B dependency:copy-dependencies `
            '-DincludeScope=test' `
            '-DoutputDirectory=target/sonar-libraries'
        if ($LASTEXITCODE -ne 0) { throw "Dependency collection failed: $LASTEXITCODE" }
    } finally {
        Pop-Location
    }

    Push-Location (Join-Path $scanRootPath 'frontend')
    try {
        & npm run build
        if ($LASTEXITCODE -ne 0) { throw "Frontend build failed: $LASTEXITCODE" }
    } finally {
        Pop-Location
    }
}

New-Item -ItemType Directory -Force $scannerWork | Out-Null
if (Test-Path -LiteralPath $metadataPath) {
    Remove-Item -LiteralPath $metadataPath -Force
}

$containerServerUrl = $ServerUrl
$serverUri = [Uri]$ServerUrl
if ($serverUri.Host -in @('127.0.0.1', 'localhost', '::1')) {
    $builder = [UriBuilder]$serverUri
    $builder.Host = 'host.docker.internal'
    $containerServerUrl = $builder.Uri.AbsoluteUri.TrimEnd('/')
}

$dockerArgs = @(
    'run', '--rm',
    '--add-host', 'host.docker.internal:host-gateway',
    '--env', "SONAR_HOST_URL=$containerServerUrl",
    '--env', 'SONAR_TOKEN',
    '--volume', "${scanRootPath}:/usr/src",
    '--volume', "${propertiesPath}:/usr/src/sonar-project.properties:ro",
    '--volume', "${scannerWork}:/usr/src/.scannerwork",
    $ScannerImage,
    '-Dsonar.working.directory=.scannerwork',
    "-Dsonar.projectVersion=$Label"
)

if ($scanRootPath -ne $repo) {
    # A detached worktree points its .git file outside the container mount.
    $dockerArgs += '-Dsonar.scm.disabled=true'
}

& docker @dockerArgs
if ($LASTEXITCODE -ne 0) {
    throw "SonarQube scan failed: $LASTEXITCODE"
}

& (Join-Path $PSScriptRoot 'snapshot.ps1') `
    -Label $Label `
    -ServerUrl $ServerUrl `
    -MetadataPath $metadataPath
