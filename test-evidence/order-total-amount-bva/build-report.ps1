$ErrorActionPreference = 'Stop'
$taskRoot = (Resolve-Path (Join-Path $PSScriptRoot '../..')).Path
$cases = @(Get-Content (Join-Path $PSScriptRoot 'test-results.json') -Raw | ConvertFrom-Json)
$http = @(Get-Content (Join-Path $PSScriptRoot 'api-evidence.json') -Raw | ConvertFrom-Json)
$checks = @(Get-Content (Join-Path $PSScriptRoot 'assertion-results.json') -Raw | ConvertFrom-Json)
$environment = Get-Content (Join-Path $PSScriptRoot 'test-environment.json') -Raw | ConvertFrom-Json
$counts = [ordered]@{ Pass=0; Fail=0; Blocked=0 }
foreach ($case in $cases) { $counts[$case.status]++ }
$summary = [ordered]@{ generatedAt=(Get-Date).ToString('o'); database=$environment.database; cases=$cases.Count; outcomes=$counts; httpRequests=$http.Count; checks=$checks.Count; failedChecks=@($checks | Where-Object status -eq Fail).Count; sourceCommit=(& git -C $taskRoot rev-parse HEAD) }
$summary | ConvertTo-Json -Depth 10 | Set-Content (Join-Path $PSScriptRoot 'execution-summary.json') -Encoding utf8

$lines = [System.Collections.Generic.List[string]]::new()
$lines.Add('# QLPT-293 — Test cases và kết quả thực thi')
$lines.Add('')
$lines.Add("Môi trường: $($environment.database). $($cases.Count) cases: $($counts.Pass) Pass, $($counts.Fail) Fail, $($counts.Blocked) Blocked. $($http.Count) HTTP requests.")
$lines.Add('')
$lines.Add('Pass của ca characterization chỉ có nghĩa hành vi được quan sát đúng; không xác lập requirement mới. Các ca đầu vào/SePay bổ sung được phân loại riêng với BVA tổng tiền. Mỗi nhóm HTTP giữ nguyên request/response ở api-evidence.json và trong Postman Examples.')
$lines.Add('')
$lines.Add('| ID | Layer | Status | Expected | Actual |')
$lines.Add('|---|---|---|---|---|')
function Compact($value) {
    if ($null -eq $value) { return '—' }
    if ($value -is [string]) { return $value.Replace('|','/').Replace("`n",' ') }
    return ($value | ConvertTo-Json -Compress -Depth 25).Replace('|','/')
}
foreach ($case in $cases) {
    $actual = if ($case.dbAfterCreate) { Compact $case.dbAfterCreate } elseif ($case.db) { Compact $case.db } else { Compact $case.actual }
    $lines.Add("| $($case.id) | $($case.layer) | **$($case.status)** | $(Compact $case.expected) | $actual |")
}
$lines.Add('')
$lines.Add('## Chi tiết dữ liệu, bước chạy và evidence')
foreach ($case in $cases) {
    $lines.Add(''); $lines.Add("### $($case.id) — $($case.status)"); $lines.Add('')
    if ($case.price) { $lines.Add("Unit price: $($case.price); quantity: $($case.quantity). Cố định product, weight=500g, customer và địa chỉ tương ứng. Mỗi case dùng variant riêng để không làm đổi dữ liệu các case trước.") }
    $lines.Add('```json'); $lines.Add(($case | ConvertTo-Json -Depth 35)); $lines.Add('```')
    $events = @($http | Where-Object case -eq $case.id)
    if ($events.Count) {
        $lines.Add(''); $lines.Add('Các bước HTTP đã thực thi theo thứ tự:'); $lines.Add('')
        $number = 1
        foreach ($event in $events) { $lines.Add("$number. $($event.method) $($event.path) → HTTP $($event.httpStatus)"); $number++ }
    }
}
$lines | Set-Content (Join-Path $PSScriptRoot 'test-cases.md') -Encoding utf8

$comparison = @($cases | Where-Object dbAfterCreate | ForEach-Object {
    [ordered]@{ case=$_.id; orderId=$_.dbAfterCreate.orderId; subtotal=$_.dbAfterCreate.subtotal; discount=$_.dbAfterCreate.discount_amount; shipping=$_.dbAfterCreate.shipping_fee; orderTotal=$_.dbAfterCreate.total_amount; paymentAmount=$_.dbAfterCreate.amount; afterCallback=$_.dbAfterCallback; outcome=$_.status }
})
$comparison | ConvertTo-Json -Depth 15 | Set-Content (Join-Path $PSScriptRoot 'order-payment-reconciliation.json') -Encoding utf8
$cases | Where-Object price | ForEach-Object { [ordered]@{case=$_.id;price=$_.price;quantity=$_.quantity;request=$_.input;expected=$_.expected} } | ConvertTo-Json -Depth 15 | Set-Content (Join-Path $PSScriptRoot 'test-data.json') -Encoding utf8
$cases | Where-Object id -in 'BUY-lower-zero','CART-lower-zero','BUY-lower-plus-cent','CART-lower-plus-cent' | ForEach-Object { [ordered]@{case=$_.id;request=$_.input;response=$_.actual;db=$_.dbAfterCreate;afterCallback=$_.dbAfterCallback} } | ConvertTo-Json -Depth 20 | Set-Content (Join-Path $PSScriptRoot 'zero-boundary-evidence.json') -Encoding utf8

# Archive the actual HTTP calls as Postman Examples. This is evidence, not a portable fixture runner.
# Old cart IDs are consumed and callback signatures bind to old order codes: replay is deliberately disabled.
$folders = @()
foreach ($group in ($http | Group-Object case)) {
    $items = @(); $n=0
    foreach ($event in $group.Group) {
        $n++
        $request = [ordered]@{ method=$event.method; header=@(@{key='Content-Type'; value='application/json'}); url=('{{base_url}}'+$event.path); description='Recorded API execution. Auth omitted. For a fresh run use OrderAmountBvaIT; fixtures and signatures are generated per run.' }
        if ($null -ne $event.requestBody) { $request.body=@{mode='raw';raw=($event.requestBody | ConvertTo-Json -Depth 30);options=@{raw=@{language='json'}}} }
        $response = [ordered]@{ name="Actual HTTP $($event.httpStatus)"; originalRequest=$request; code=[int]$event.httpStatus; status=[string]$event.httpStatus; header=@(@{key='Content-Type';value='application/json'}); body=($event.responseBody | ConvertTo-Json -Depth 35) }
        $items += [ordered]@{name=('{0:D2} {1} {2}' -f $n,$event.method,($event.path -split '\?')[0]);request=$request;response=@($response)}
    }
    $folders += @{name=$group.Name; item=$items}
}
$collection = [ordered]@{
    info=@{name='QLPT-293 - BVA actual HTTP evidence (read Examples)';schema='https://schema.getpostman.com/json/collection/v2.1.0/collection.json';description="Evidence archive generated from actual Java HttpClient calls, not a Newman/Postman execution claim. Database: $($environment.database). Both order flows, promotion, shipping, payment, IPN/Return and SePay. Open saved Examples to review request/status/response. Replay disabled because IDs/callbacks are run-specific. Reproduce with backend OrderAmountBvaIT; see test-evidence/order-total-amount-bva/README.md. Replaces the old quantity-focused collection and its unverified total>0 assumption."}
    variable=@(@{key='base_url';value='http://127.0.0.1:8081';type='string'})
    event=@(@{listen='prerequest';script=@{type='text/javascript';exec=@("pm.execution.skipRequest();", "console.warn('Evidence archive: read saved Examples. Use OrderAmountBvaIT for a fresh fixture-backed run.');")}})
    item=$folders
}
$collection | ConvertTo-Json -Depth 60 | Set-Content (Join-Path $taskRoot 'postman/Order-Total-Amount-BVA-Evidence.postman_collection.json') -Encoding utf8

$rows = ($cases | ForEach-Object { '<tr><td>'+[System.Net.WebUtility]::HtmlEncode($_.id)+'</td><td class="'+$_.status+'">'+$_.status+'</td><td>'+[System.Net.WebUtility]::HtmlEncode((Compact $_.expected))+'</td></tr>' }) -join "`n"
$html = @"
<!doctype html><html lang="vi"><meta charset="utf-8"><title>QLPT-293 BVA report</title><style>body{font:16px system-ui;max-width:1250px;margin:40px auto;padding:0 24px;color:#182c3d}h1{font-size:30px}table{border-collapse:collapse;width:100%}td,th{border-bottom:1px solid #d7dfe8;text-align:left;padding:10px}.Pass{color:#177143}.Fail{color:#be2437}.Blocked{color:#9a6000}.note{background:#fff3d4;padding:16px;border-radius:8px}a{color:#165bb7}</style><h1>QLPT-293 · BVA tổng tiền đơn hàng</h1><p>$($counts.Pass) Pass · $($counts.Fail) Fail · $($counts.Blocked) Blocked · $($http.Count) HTTP requests</p><p class="note">$([System.Net.WebUtility]::HtmlEncode($environment.database)). GHN stub, callback thanh toán giả lập có chữ ký. Không có giao dịch thật. Pass/Fail của ca kiểm thử nằm trong test-results.json, không suy từ BUILD SUCCESS.</p><p><a href="test-cases.md">Test cases</a> · <a href="api-evidence.json">HTTP evidence</a> · <a href="order-payment-reconciliation.json">Order–Payment</a> · <a href="bug-report.md">Bug report</a></p><table><thead><tr><th>Case</th><th>Result</th><th>Expected</th></tr></thead><tbody>$rows</tbody></table></html>
"@
$html | Set-Content (Join-Path $PSScriptRoot 'execution-report.html') -Encoding utf8
$sourceFiles = @(Get-ChildItem (Join-Path $taskRoot 'backend/src/main/java/com/greenjuicehub/backend') -Recurse -Filter '*.java') + @(Get-Item (Join-Path $taskRoot 'database/schema.sql')) + @(Get-Item (Join-Path $taskRoot 'backend/src/test/java/com/greenjuicehub/backend/e2e/OrderAmountBvaIT.java')) + @(Get-Item (Join-Path $taskRoot 'postman/Order-Total-Amount-BVA-Evidence.postman_collection.json'))
$manifest = @($sourceFiles | ForEach-Object { [ordered]@{path=[System.IO.Path]::GetRelativePath($taskRoot,$_.FullName);sha256=(Get-FileHash -Algorithm SHA256 -LiteralPath $_.FullName).Hash} })
$manifest | ConvertTo-Json -Depth 5 | Set-Content (Join-Path $PSScriptRoot 'source-hashes.json') -Encoding utf8
$summary | ConvertTo-Json -Depth 10
