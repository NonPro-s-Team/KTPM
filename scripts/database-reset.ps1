[CmdletBinding()]
param(
    [string]$Environment = $env:ASPNETCORE_ENVIRONMENT,
    [string]$ConnectionString = $env:ConnectionStrings__DefaultConnection,
    [switch]$Seed,
    [switch]$Force
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
    throw "Database reset is permanently disabled in Production."
}

if ($Environment -notin @("Development", "Test")) {
    throw "Environment must be Development or Test."
}

if ([string]::IsNullOrWhiteSpace($ConnectionString)) {
    throw "ConnectionStrings__DefaultConnection is required. Set it to an explicit local or test database."
}

if ($Seed -and $Environment -ne "Development") {
    throw "Development seed data cannot run in the Test environment."
}

if (-not $Force) {
    Write-Warning "This permanently drops the configured $Environment database and recreates it from reviewed migrations."
    $confirmation = Read-Host "Type RESET to continue"
    if ($confirmation -cne "RESET") {
        throw "Database reset cancelled."
    }
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
        "database",
        "drop",
        "--force",
        "--project",
        $infrastructureProject,
        "--startup-project",
        $startupProject
    )

    & (Join-Path $PSScriptRoot "database-update.ps1") `
        -Environment $Environment `
        -ConnectionString $ConnectionString

    if ($Seed) {
        $requiredPasswords = @(
            "SeedData__AdminPassword",
            "SeedData__StaffPassword",
            "SeedData__TenantPassword",
            "SeedData__Tenant2Password"
        )
        $missingPasswords = @(
            $requiredPasswords |
                Where-Object {
                    [string]::IsNullOrWhiteSpace(
                        [Environment]::GetEnvironmentVariable($_)
                    )
                }
        )
        if ($missingPasswords.Count -gt 0) {
            $missingList = $missingPasswords -join ", "
            throw "Seed passwords are missing: $missingList."
        }

        $env:SeedData__Enabled = "true"
        Invoke-DotNet -Arguments @(
            "run",
            "--project",
            $startupProject,
            "--configuration",
            "Release",
            "--no-launch-profile",
            "--",
            "--seed-development-data"
        )
    }
}
finally {
    Pop-Location
}
