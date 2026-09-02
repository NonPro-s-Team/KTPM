$ErrorActionPreference = 'Stop'
Add-Type 'using System.Runtime.InteropServices; public class CodeceptEvidenceDpi { [DllImport("user32.dll")] public static extern bool SetProcessDPIAware(); }'
[CodeceptEvidenceDpi]::SetProcessDPIAware() | Out-Null
Add-Type -AssemblyName System.Windows.Forms
Add-Type -AssemblyName System.Drawing
[System.Windows.Forms.Application]::EnableVisualStyles()
$console = Get-Content (Join-Path $PSScriptRoot 'test-run.txt') -Raw
$form = New-Object System.Windows.Forms.Form
$form.Text = 'CodeceptJS + Playwright - actual test output'
$form.ClientSize = New-Object System.Drawing.Size(1180, 650)
$form.StartPosition = 'CenterScreen'
$form.TopMost = $true
$box = New-Object System.Windows.Forms.TextBox
$box.Multiline = $true
$box.ReadOnly = $true
$box.Dock = 'Fill'
$box.BackColor = [System.Drawing.Color]::FromArgb(20,30,47)
$box.ForeColor = [System.Drawing.Color]::FromArgb(222,240,230)
$box.Font = New-Object System.Drawing.Font('Consolas', 11)
$box.Text = "CODECEPTJS + PLAYWRIGHT | GREEN JUICE HUB`r`n`r`nActual console output from npm test:`r`n$console`r`nFrontend UI smoke only. No live payment or authenticated checkout run.`r`nJUnit and browser screenshots are supplied alongside this capture."
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
        $bitmap.Save((Join-Path $PSScriptRoot 'test-summary.png'),[System.Drawing.Imaging.ImageFormat]::Png)
    } finally { $graphics.Dispose(); $bitmap.Dispose() }
} finally { $form.Close(); $form.Dispose() }
