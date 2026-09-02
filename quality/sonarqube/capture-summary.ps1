$ErrorActionPreference = 'Stop'
$repo = [IO.Path]::GetFullPath((Join-Path $PSScriptRoot '../..'))
$evidence = Join-Path $repo 'test-evidence/sonarqube-checkout'
$baseline = Get-Content (Join-Path $evidence 'baseline.json') -Raw | ConvertFrom-Json
$final = Get-Content (Join-Path $evidence 'final.json') -Raw | ConvertFrom-Json
$tests = @(Get-Content (Join-Path $evidence 'test-results.json') -Raw | ConvertFrom-Json)
function Metric($snapshot, $name) {
    return ($snapshot.measures | Where-Object metric -eq $name).value
}
$newCoverage = ($final.qualityGate.conditions | Where-Object metricKey -eq 'new_coverage').actualValue
$lines = @(
    'GREEN JUICE HUB | CHECKOUT SECURITY REVIEW',
    'Summary from actual SonarQube API exports and Surefire test results.',
    'This summary window is not the SonarQube dashboard.',
    '',
    "Server: SonarQube Community Build $($final.serverVersion)",
    "Project: $($final.projectKey)",
    "Analysis: $($final.analysis[0].date)",
    '',
    '                                BEFORE       AFTER',
    ('Blocker (legacy severity)       {0,-12} {1}' -f (Metric $baseline 'blocker_violations'), (Metric $final 'blocker_violations')),
    ('Critical (legacy severity)      {0,-12} {1}' -f (Metric $baseline 'critical_violations'), (Metric $final 'critical_violations')),
    ('Open issues                     {0,-12} {1}' -f $baseline.issueCount, $final.issueCount),
    ('Security hotspots               {0,-12} {1}' -f (Metric $baseline 'security_hotspots'), (Metric $final 'security_hotspots')),
    '',
    "Quality Gate: $($final.qualityGate.status) | New-code coverage: $newCoverage%",
    "Overall scoped coverage: $(Metric $final 'coverage')%",
    '',
    "TESTS: $($tests.Count) total | $(@($tests | Where-Object status -eq 'PASSED').Count) passed | $(@($tests | Where-Object status -eq 'SKIPPED').Count) pre-existing skipped",
    "Failures: $(@($tests | Where-Object status -eq 'FAILED').Count) | Errors: $(@($tests | Where-Object status -eq 'ERROR').Count)",
    '',
    'Scope: Order / Payment / Shipping / Webhook controllers and services.',
    'No rule suppression. Lower-severity issues remain. No live payment test.',
    'Evidence: baseline.json, final.json, test-run.txt, test-results.json.'
)
Add-Type 'using System.Runtime.InteropServices; public class SonarEvidenceDpi { [DllImport("user32.dll")] public static extern bool SetProcessDPIAware(); }'
[SonarEvidenceDpi]::SetProcessDPIAware() | Out-Null
Add-Type -AssemblyName System.Windows.Forms
Add-Type -AssemblyName System.Drawing
[System.Windows.Forms.Application]::EnableVisualStyles()
$form = New-Object System.Windows.Forms.Form
$form.Text = 'Checkout security review - actual API and test results'
$form.ClientSize = New-Object System.Drawing.Size(1180, 680)
$form.StartPosition = 'CenterScreen'
$form.TopMost = $true
$box = New-Object System.Windows.Forms.TextBox
$box.Multiline = $true
$box.ReadOnly = $true
$box.Dock = 'Fill'
$box.BackColor = [System.Drawing.Color]::FromArgb(20,30,47)
$box.ForeColor = [System.Drawing.Color]::FromArgb(222,240,230)
$box.Font = New-Object System.Drawing.Font('Consolas', 13)
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
        $bitmap.Save((Join-Path $evidence 'review-summary.png'),[System.Drawing.Imaging.ImageFormat]::Png)
    } finally { $graphics.Dispose(); $bitmap.Dispose() }
} finally { $form.Close(); $form.Dispose() }
