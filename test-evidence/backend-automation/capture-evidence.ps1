$ErrorActionPreference = 'Stop'
Add-Type 'using System.Runtime.InteropServices; public class EvidenceDpi { [DllImport("user32.dll")] public static extern bool SetProcessDPIAware(); }'
[EvidenceDpi]::SetProcessDPIAware() | Out-Null
Add-Type -AssemblyName System.Windows.Forms
Add-Type -AssemblyName System.Drawing
[System.Windows.Forms.Application]::EnableVisualStyles()
$suites = Get-Content (Join-Path $PSScriptRoot 'results.json') -Raw | ConvertFrom-Json
$summary = Get-Content (Join-Path $PSScriptRoot 'maven-summary.txt') -Raw
$taskTests = ($suites | Measure-Object tests -Sum).Sum
$taskFailures = ($suites | Measure-Object failures -Sum).Sum
$taskErrors = ($suites | Measure-Object errors -Sum).Sum
$taskSkipped = ($suites | Measure-Object skipped -Sum).Sum
$taskPassed = $taskTests - $taskFailures - $taskErrors - $taskSkipped
$backendResult = [regex]::Matches($summary, 'Tests run: (\d+), Failures: (\d+), Errors: (\d+), Skipped: (\d+)') | Select-Object -Last 1
$backendTests = [int]$backendResult.Groups[1].Value
$backendFailures = [int]$backendResult.Groups[2].Value
$backendErrors = [int]$backendResult.Groups[3].Value
$backendSkipped = [int]$backendResult.Groups[4].Value
$backendPassed = $backendTests - $backendFailures - $backendErrors - $backendSkipped

function Capture-TextWindow([string]$text, [string]$filename) {
    $form = New-Object System.Windows.Forms.Form
    $form.Text = 'QLPT-266 - Actual JUnit / Maven results'
    $form.ClientSize = New-Object System.Drawing.Size(1180, 900)
    $form.StartPosition = 'CenterScreen'
    $form.TopMost = $true
    $box = New-Object System.Windows.Forms.TextBox
    $box.Multiline = $true
    $box.ReadOnly = $true
    $box.Dock = 'Fill'
    $box.BackColor = [System.Drawing.Color]::FromArgb(20, 30, 47)
    $box.ForeColor = [System.Drawing.Color]::FromArgb(222, 240, 230)
    $box.Font = New-Object System.Drawing.Font('Consolas', 10)
    $box.Text = $text.Replace("`n", "`r`n").Replace("`r`r`n", "`r`n")
    $box.Select(0, 0)
    $form.Controls.Add($box)
    try {
        $form.Show()
        $form.Activate()
        [System.Windows.Forms.Application]::DoEvents()
        Start-Sleep -Milliseconds 700
        $bitmap = New-Object System.Drawing.Bitmap($form.ClientSize.Width, $form.ClientSize.Height)
        $graphics = [System.Drawing.Graphics]::FromImage($bitmap)
        try {
            $origin = $form.PointToScreen([System.Drawing.Point]::Empty)
            $graphics.CopyFromScreen($origin, [System.Drawing.Point]::Empty, $form.ClientSize)
            $bitmap.Save((Join-Path $PSScriptRoot $filename), [System.Drawing.Imaging.ImageFormat]::Png)
        } finally { $graphics.Dispose(); $bitmap.Dispose() }
    } finally { $form.Close(); $form.Dispose() }
}

$rows = ($suites | ForEach-Object {
    ' {0,-47} {1,5} {2,7} {3,7} {4,7}' -f $_.name, $_.tests, $_.failures, $_.errors, $_.skipped
}) -join "`n"
$tail = ($summary -split "`n" | Select-Object -Last 5) -join "`n"
$text = @"

 QLPT-266 | GREEN JUICE HUB | HUY
 Automation testing: Order / Payment / Shipping / Webhook
 Spring Boot Test + JUnit 5 + Mockito + MockMvc | Java 21

 Source: actual Maven Surefire XML (results.json), not simulated results.

 Suite                                           Tests    Fail   Error    Skip
 -----------------------------------------------------------------------------------
$rows
 -----------------------------------------------------------------------------------
 TASK TOTAL: $taskPassed tests passed | $taskFailures failures | $taskErrors errors | $taskSkipped skipped

 FULL BACKEND: $backendTests tests | $backendPassed passed | $backendFailures failures | $backendErrors errors | $backendSkipped skipped
 Existing skipped tests are in Cart / Product / Promotion, outside QLPT-266.

 Maven output:
$tail

 Reproduce from backend:
 mvnw.cmd -B -Dmaven.repo.local=E:/KCPM/KTPM/.m2/repository clean verify

 Scope: service unit tests + controller MVC slice integration tests.
 Repositories / external services are mocked in the task suites.
 Test security configuration is used; not a live payment or database E2E run.
 JaCoCo report: backend/target/site/jacoco/index.html
"@
Capture-TextWindow $text '01-test-summary.png'
foreach ($group in @('service','controller')) {
    $selected = $suites | Where-Object { ($_.name -like '*Controller*') -eq ($group -eq 'controller') }
    $cases = ($selected | ForEach-Object {
        "`n $($_.name) ($($_.tests) tests)`n" + (($_.cases | ForEach-Object { "   [$($_.result)] $($_.name)" }) -join "`n")
    }) -join "`n"
    Capture-TextWindow " QLPT-266 | Actual JUnit test cases | $group`n$cases" "02-$group-cases.png"
}
