$ErrorActionPreference = 'Stop'

Set-Location $PSScriptRoot

$promotionTests = 'AdminPromotionCreateEpIntegrationTest,AdminPromotionCreateBvaIntegrationTest'

Write-Host '== Compile and run 61 promotion tests with JaCoCo ==' -ForegroundColor Cyan
& .\mvnw.cmd clean test jacoco:report "-Dtest=$promotionTests"

Write-Host ''
Write-Host 'Focused JaCoCo report:' -ForegroundColor Green
Write-Host (Join-Path $PSScriptRoot 'target\site\jacoco\index.html')

Write-Host ''
Write-Host '== Optional: run the complete backend suite and regenerate JaCoCo ==' -ForegroundColor Cyan
Write-Host '.\mvnw.cmd clean verify'

Write-Host ''
Write-Host 'Useful report files:' -ForegroundColor Green
Write-Host (Join-Path $PSScriptRoot 'target\site\jacoco\index.html')
Write-Host (Join-Path $PSScriptRoot 'target\site\jacoco\jacoco.xml')
Write-Host (Join-Path $PSScriptRoot 'target\site\jacoco\jacoco.csv')

# Uncomment to open the focused HTML report automatically.
# Start-Process (Join-Path $PSScriptRoot 'target\site\jacoco\index.html')
