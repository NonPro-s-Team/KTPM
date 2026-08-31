$ErrorActionPreference = 'Stop'
$repo = [IO.Path]::GetFullPath((Join-Path $PSScriptRoot '../..'))
$evidence = Join-Path $repo 'test-evidence/checkout-payment'
[xml]$junit = Get-Content (Join-Path $evidence 'junit.xml') -Raw
$lines = @(
    'GREEN JUICE HUB | CHECKOUT / PAYMENT / ORDER TRACKING',
    'Actual CodeceptJS + Playwright results. Real Spring Boot API + isolated H2.',
    'Providers simulated locally. No real payment, OTP or carrier delivery.',
    '',
    "Tests: $($junit.testsuites.tests) | Failures: $($junit.testsuites.failures)",
    ''
)
foreach ($suite in $junit.testsuites.testsuite) {
    foreach ($case in $suite.testcase) {
        $status = if ($case.failure) { 'FAIL' } elseif ($case.skipped) { 'SKIP' } else { 'PASS' }
        $label = $case.name -replace '^.*simulated providers: ', ''
        $lines += "$status | $label"
    }
}
$lines += @('', 'Persisted order evidence from real API:')
foreach ($key in @('cod','vnpay','momo','bank_transfer','vnpay_declined','hcm')) {
    $events = Get-Content (Join-Path $evidence "$key-events.json") -Raw | ConvertFrom-Json
    $placed = $events | Where-Object event -eq 'placed'
    $last = @($events | Where-Object event -eq 'order-visible')[-1]
    $lines += ('{0,-16} fee={1,-7} total={2,-7} {3,-10} {4}' -f $key.ToUpper(), $placed.shippingFee, $placed.total, $last.status, $last.paymentStatus)
}
$lines += @('', 'VNPay return before IPN: waiting confirmation; does not mark order paid.',
    'Outside HCM: 30,000 VND even with GHN IDs. HCM control: 19,000 VND.',
    'Sources: junit.xml, *-events.json, test-run.txt, browser screenshots.')
Add-Type 'using System.Runtime.InteropServices; public class CheckoutEvidenceDpi { [DllImport("user32.dll")] public static extern bool SetProcessDPIAware(); }'
[CheckoutEvidenceDpi]::SetProcessDPIAware() | Out-Null
Add-Type -AssemblyName System.Windows.Forms
Add-Type -AssemblyName System.Drawing
[System.Windows.Forms.Application]::EnableVisualStyles()
$form = New-Object System.Windows.Forms.Form
$form.Text = 'Checkout test results - provider simulations'
$form.ClientSize = New-Object System.Drawing.Size(1220, 640)
$form.StartPosition = 'CenterScreen'
$form.TopMost = $true
$box = New-Object System.Windows.Forms.TextBox
$box.Multiline = $true
$box.ReadOnly = $true
$box.Dock = 'Fill'
$box.BackColor = [System.Drawing.Color]::FromArgb(20,30,47)
$box.ForeColor = [System.Drawing.Color]::FromArgb(222,240,230)
$box.Font = New-Object System.Drawing.Font('Consolas', 11)
$box.Text = $lines -join "`r`n"
$box.Select(0,0)
$form.Controls.Add($box)
try {
    $form.Show()
    $form.Activate()
    [System.Windows.Forms.Application]::DoEvents()
    Start-Sleep -Milliseconds 700
    $bitmap = New-Object System.Drawing.Bitmap($form.ClientSize.Width,$form.ClientSize.Height)
    $graphics = [System.Drawing.Graphics]::FromImage($bitmap)
    try {
        $graphics.CopyFromScreen($form.PointToScreen([System.Drawing.Point]::Empty),[System.Drawing.Point]::Empty,$form.ClientSize)
        $bitmap.Save((Join-Path $evidence 'test-summary.png'),[System.Drawing.Imaging.ImageFormat]::Png)
    } finally { $graphics.Dispose(); $bitmap.Dispose() }
} finally { $form.Close(); $form.Dispose() }
