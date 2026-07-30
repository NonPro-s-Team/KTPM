[CmdletBinding()]
param(
    [string]$Environment = $env:ASPNETCORE_ENVIRONMENT,
    [string]$ConnectionString = $env:ConnectionStrings__DefaultConnection
)

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

function Invoke-DotNet {
    param([Parameter(Mandatory)][string[]]$Arguments)

    & dotnet @Arguments
    if ($LASTEXITCODE -ne 0) {
        throw "dotnet command failed with exit code $LASTEXITCODE."
    }
}

if ([string]::IsNullOrWhiteSpace($Environment)) {
    throw "ASPNETCORE_ENVIRONMENT is required. Use Development or Test."
}

if ($Environment -eq "Production") {
    throw "This local database script refuses to run in Production."
}

if ($Environment -notin @("Development", "Test")) {
    throw "Environment must be Development or Test."
}

if ([string]::IsNullOrWhiteSpace($ConnectionString)) {
    throw "ConnectionStrings__DefaultConnection is required. Set it to an explicit local or test database."
}

$repositoryRoot = Split-Path -Parent $PSScriptRoot
$infrastructureProject = "backend/src/RMS.Infrastructure"
$startupProject = "backend/src/RMS.API"

$env:ASPNETCORE_ENVIRONMENT = $Environment
$env:ConnectionStrings__DefaultConnection = $ConnectionString

Push-Location $repositoryRoot
try {
    Invoke-DotNet -Arguments @("tool", "restore")
    Invoke-DotNet -Arguments @(
        "ef",
        "migrations",
        "list",
        "--project",
        $infrastructureProject,
        "--startup-project",
        $startupProject
    )
    Invoke-DotNet -Arguments @(
        "ef",
        "database",
        "update",
        "--project",
        $infrastructureProject,
        "--startup-project",
        $startupProject
    )
    Invoke-DotNet -Arguments @(
        "ef",
        "migrations",
        "has-pending-model-changes",
        "--project",
        $infrastructureProject,
        "--startup-project",
        $startupProject
    )
}
finally {
    Pop-Location
}
