param([string]$ServerUrl = 'http://127.0.0.1:9000')
$ErrorActionPreference = 'Stop'
if (-not $env:SONAR_TOKEN) { throw 'Set SONAR_TOKEN to your local SonarQube analysis token.' }
$repo = [IO.Path]::GetFullPath((Join-Path $PSScriptRoot '../..'))
# Explicit scope of this checkout security review; no rule/severity suppression.
$scope = @(
    '**/controller/OrderController.java', '**/controller/PaymentController.java',
    '**/controller/ShippingController.java', '**/controller/ShippingFeeController.java',
    '**/controller/WebhookController.java', '**/service/order/IOrderService.java',
    '**/service/order/impl/OrderServiceImpl.java',
    '**/service/payment/**', '**/service/sepay/**', '**/service/shipping/**',
    '**/dto/order/**', '**/dto/sepay/**', '**/dto/payment/**'
) -join ','
Push-Location (Join-Path $repo 'backend')
try {
    & ./mvnw.cmd -B "-Dmaven.repo.local=$repo/.m2/repository" verify `
        org.sonarsource.scanner.maven:sonar-maven-plugin:5.7.0.6970:sonar `
        "-Dsonar.host.url=$ServerUrl" '-Dsonar.projectKey=green-juice-hub-checkout' `
        '-Dsonar.projectName=Green Juice Hub - Checkout Security' `
        '-Dsonar.sources=src/main/java' "-Dsonar.inclusions=$scope" `
        '-Dsonar.coverage.jacoco.xmlReportPaths=target/site/jacoco/jacoco.xml' `
        '-Dsonar.scanner.skipJreProvisioning=true'
    if ($LASTEXITCODE -ne 0) { throw "Maven/Sonar scan failed: $LASTEXITCODE" }
} finally { Pop-Location }
