$ErrorActionPreference = 'Stop'
$projectRoot = [IO.Path]::GetFullPath((Join-Path $PSScriptRoot '../..'))
$reportPath = Join-Path $projectRoot 'backend/target/surefire-reports'
$scope = @('OrderServiceImplTest','VnpayServiceImplTest','GhnServiceTest','SePayWebhookServiceImplTest',
    'OrderControllerMockMvcIntegrationTest','PaymentControllerMockMvcIntegrationTest',
    'ShippingControllerMockMvcIntegrationTest','WebhookControllerMockMvcIntegrationTest')
$suites = @(Get-ChildItem $reportPath -Filter 'TEST-*.xml' | ForEach-Object {
    [xml]$xml = Get-Content $_.FullName -Raw
    $s = $xml.testsuite
    [pscustomobject]@{
        name = $s.name.Split('.')[-1]; tests = [int]$s.tests; failures = [int]$s.failures
        errors = [int]$s.errors; skipped = [int]$s.skipped; seconds = $s.time
        timestamp = $s.timestamp
        cases = @($s.testcase | ForEach-Object { [pscustomobject]@{
            name = $_.name; seconds = $_.time
            result = if ($_.failure -or $_.error) { 'FAIL' } elseif ($_.skipped) { 'SKIP' } else { 'PASS' }
        } })
    }
})
$selected = @($suites | Where-Object { $_.name -in $scope } | Sort-Object name)
if ($selected.Count -ne $scope.Count) { throw 'Missing QLPT-266 test suites' }
$log = Get-Content (Join-Path $PSScriptRoot 'maven-verify.log') -Raw
$success = $log.Contains('[INFO] BUILD SUCCESS')
function Sum($rows, $field) { ($rows | Measure-Object -Property $field -Sum).Sum }
function Escape($value) { [System.Net.WebUtility]::HtmlEncode([string]$value) }
$rows = ($selected | ForEach-Object {
    "<tr><td>$(Escape $_.name)</td><td>$($_.tests)</td><td>$($_.failures)</td><td>$($_.errors)</td><td>$($_.skipped)</td><td>$($_.seconds)s</td></tr>"
}) -join "`n"
$detail = ($selected | ForEach-Object {
    $suite = $_
    $cases = ($suite.cases | ForEach-Object { "<li><b>$($_.result)</b> $(Escape $_.name)</li>" }) -join "`n"
    "<section><h2>$(Escape $suite.name)</h2><ul>$cases</ul></section>"
}) -join "`n"
$tail = (($log -split "`n" | Where-Object { $_ -match 'Tests run:|BUILD SUCCESS|BUILD FAILURE|Total time:|Finished at:' }) | Select-Object -Last 7) -join "`n"
$state = if ($success) { 'BUILD SUCCESS' } else { 'BUILD NOT SUCCESSFUL' }
$html = @"
<!doctype html><html lang="en"><meta charset="utf-8"><title>QLPT-266 | JUnit test evidence</title>
<style>
body{font:16px Segoe UI,Arial,sans-serif;background:#eff3f8;color:#17263c;margin:0;padding:32px}
main{max-width:1200px;margin:auto}h1{font-size:30px;margin:6px 0 12px}h2{font-size:20px}
.tag{color:#4c6382;font-weight:600}.success{color:#08784e}section,.card{background:white;border:1px solid #dbe3ed;border-radius:12px;padding:22px;margin:16px 0}
.stats{display:flex;gap:18px}.stats div{flex:1;background:white;padding:16px;border-radius:10px;border:1px solid #dbe3ed}.stats strong{display:block;font-size:30px}
table{width:100%;border-collapse:collapse}td,th{text-align:left;padding:10px 8px;border-bottom:1px solid #e1e7ef}th{color:#51647c}
pre{background:#17263c;color:#e3efff;padding:18px;border-radius:8px;font-size:14px;white-space:pre-wrap}p{line-height:1.5;margin:8px 0}.note{font-size:14px;color:#51647c}li{padding:6px}li b{color:#08784e;margin-right:12px}
</style><main><div class="tag">GREEN JUICE HUB · QLPT-266 · HUY</div>
<h1>Order / Payment / Shipping / Webhook</h1><p>Spring Boot Test · JUnit 5 · Mockito · MockMvc</p>
<div class="stats"><div><strong>$(Sum $selected 'tests')</strong>Task test cases</div><div><strong>$(Sum $selected 'failures')</strong>Failures</div><div><strong>$(Sum $selected 'errors')</strong>Errors</div><div><strong>$(Sum $selected 'skipped')</strong>Skipped</div></div>
<section><h2 class="success">$state</h2><p>Full backend suite: <b>$(Sum $suites 'tests') tests</b>; failures: $(Sum $suites 'failures'); errors: $(Sum $suites 'errors'); skipped: $(Sum $suites 'skipped').</p>
<p class="note">Generated from actual Maven Surefire XML. Controller tests are MVC slice integrations with mocked services and a test security configuration; this is not a database or live payment end-to-end run.</p>
<table><thead><tr><th>QLPT-266 suite</th><th>Tests</th><th>Fail</th><th>Error</th><th>Skip</th><th>Time</th></tr></thead><tbody>$rows</tbody></table></section>
<section><h2>Maven execution output</h2><pre>$(Escape $tail)</pre><p class="note">Java 21 · Command: mvnw.cmd -B -Dmaven.repo.local=E:/KCPM/KTPM/.m2/repository clean verify</p></section>
</main></html>
"@
$html | Set-Content (Join-Path $PSScriptRoot 'summary.html') -Encoding utf8
$html.Replace('</main>', "<h1>Executed test cases</h1>$detail</main>") | Set-Content (Join-Path $PSScriptRoot 'details.html') -Encoding utf8
$selected | ConvertTo-Json -Depth 6 | Set-Content (Join-Path $PSScriptRoot 'results.json') -Encoding utf8
Write-Output "Task: $(Sum $selected 'tests') tests. Backend: $(Sum $suites 'tests') tests. $state"
