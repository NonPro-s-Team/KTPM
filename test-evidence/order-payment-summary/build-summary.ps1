$ErrorActionPreference = 'Stop'
$root = (Resolve-Path "$PSScriptRoot/../..").Path
$baseline = Get-Content "$PSScriptRoot/../order-total-amount-bva/test-results.json" -Raw | ConvertFrom-Json
$latest = Get-Content "$PSScriptRoot/retest/test-results.json" -Raw | ConvertFrom-Json
$http = @(Get-Content "$PSScriptRoot/retest/api-evidence.json" -Raw | ConvertFrom-Json)
$checks = @(Get-Content "$PSScriptRoot/retest/assertion-results.json" -Raw | ConvertFrom-Json)
$envInfo = Get-Content "$PSScriptRoot/retest/test-environment.json" -Raw | ConvertFrom-Json
function Json($v) { ConvertTo-Json -InputObject $v -Depth 70 -Compress }
function SaveJson($name,$v) { ConvertTo-Json -InputObject $v -Depth 70 | Set-Content "$PSScriptRoot/$name" -Encoding utf8 }
$formal = @(); $repro = @(); $money = @()
$doc = [System.Collections.Generic.List[string]]::new()
$doc.Add('# Bộ test case và kết quả Order/Payment')
$doc.Add('')
$doc.Add('Nguồn: lần chạy độc lập trong retest/. Mỗi số HTTP bên dưới là vị trí 1-based trong api-evidence.json. Expected tiền được đặt trước trong Scenario của test runner; các assertion bổ sung ghi trong assertion-results.json. Không suy ra business min/max từ DECIMAL. Các case characterization chỉ xác nhận hành vi hiện tại, không chứng nhận hành vi đó an toàn.')
foreach ($c in $latest) {
  $old = @($baseline | Where-Object id -eq $c.id)
  if ($old.Count -ne 1 -or $old[0].status -ne $c.status) { throw "Result changed: $($c.id)" }
  $events = @($http | Where-Object case -eq $c.id)
  $indices = @(for($i=0;$i -lt $http.Count;$i++){ if($http[$i].case -eq $c.id){$i+1} })
  $blocked = $c.status -eq 'Blocked'
  $pre = 'Fixture cô lập: CUSTOMER active, JWT test, địa chỉ thuộc customer, product/variant active và tồn kho 1000 trước tạo đơn; giá originalPrice=salePrice, quantity=1 trừ case input không hợp lệ. CART có cart item của customer. GHN và blacklist mock. Promotion qua admin API, active, thời gian hiệu lực bao phủ lần chạy.'
  if($blocked) { $pre = 'Cần fixture catalog/stock hợp lý cho biên API; quyền truy cập MySQL đối với storage probe; cấu hình/môi trường dịch vụ thật đối với LIVE case. Điều kiện tương ứng chưa đáp ứng.' }
  if($c.id -like 'SHIPPING-*'){ $pre = 'GHN geography mock trả đúng một province/district/ward; không dùng dữ liệu GHN thật.' }
  $steps = @($events | ForEach-Object { "$($_.method) $($_.path.Split('?')[0]) — body và query ở HTTP evidence" })
  if($blocked){$steps=@('Xác nhận điều kiện môi trường tương ứng.','Khi được mở chặn: gọi API hoặc MySQL probe với giá trị trong ID/input; đọc lại Order/Payment hoặc giá trị lưu DB và so với expected. Hiện chưa thực thi.')}
  $promo = @($events | Where-Object path -eq '/api/admin/promotions')
  $data = [ordered]@{input=$c.input;price=$c.price;quantity=$c.quantity;promotion=@($promo | ForEach-Object requestBody);before=$c.before;layerNote=$c.layerNote;httpRecords=$indices}
  $expected = $c.expected
  if($c.status -eq 'Fail'){$expected=[ordered]@{money=$c.expected;contract='Không cấp phiên thanh toán 0đ mà backend không thể hoàn tất. Cần từ chối sớm hoặc luồng đơn miễn phí được nghiệp vụ thống nhất; không yêu cầu bỏ validation IPN số tiền dương.'}}
  $actual = [ordered]@{response=$c.actual;dbAfterCreate=$c.dbAfterCreate;dbAfterCallback=$c.dbAfterCallback;db=$c.db;failedChecks=@($c.checks | Where-Object status -eq 'Fail')}
  $evidence = @(('retest/test-results.json: id='+$c.id),('retest/assertion-results.json: case='+$c.id))
  if($blocked){$evidence=@(('retest/test-results.json: id='+$c.id),'retest/test-environment.json','../order-total-amount-bva/mysql-access-blocked.log')}else{$evidence+=('retest/api-evidence.json: records '+($indices -join ', '))}
  $entry = [ordered]@{id=$c.id;description=($c.id -replace '-',' ');precondition=$pre;steps=$steps;testData=$data;expectedResult=$expected;actualResult=$actual;status=$c.status.ToUpper();evidence=$evidence;relatedBug=$(if($c.status -eq 'Fail'){'QLPT-341'}else{'None'});blockedReason=$(if($blocked){$c.actual}else{'N/A'})}
  $formal += $entry
  $doc.Add("`n## $($c.id) — $($entry.status)`n")
  $doc.Add("**Description:** $($entry.description)`n`n**Pre-condition:** $pre`n`n**Steps:**")
  for($i=0;$i -lt $steps.Count;$i++){$doc.Add("$($i+1). $($steps[$i])")}
  $doc.Add("`n**Test data:** ``$(Json $data)```n`n**Expected:** ``$(Json $expected)```n`n**Actual:** ``$(Json $actual)```n`n**Evidence:** $($evidence -join '; ')`n`n**Bug:** $($entry.relatedBug)")
  foreach($phase in @('dbAfterCreate','dbAfterCallback','db')) {
    $d=$c.$phase
    if($d){
      $equal=[decimal]$d.total_amount -eq [decimal]$d.amount
      if(!$equal){throw "Order/Payment mismatch $($c.id)"}
      $money += [ordered]@{case=$c.id;phase=$phase;orderId=$d.orderId;subtotal=$d.subtotal;itemsSubtotal=$d.items_subtotal;discount=$d.discount_amount;shipping=$d.shipping_fee;orderTotal=$d.total_amount;paymentAmount=$d.amount;equal=$equal;orderPaymentStatus=$d.payment_status;paymentStatus=$d.payment_record_status;evidence='retest/test-results.json'}
    }
  }
  if($c.status -eq 'Fail'){
    $p=$promo[0].requestBody
    $discount=if($p.type -eq 'FIXED'){[math]::Min([decimal]$p.value,[decimal]$c.price)}else{[math]::Floor([decimal]$c.price*[decimal]$p.value/100)}
    $recalculated=[decimal]$c.price*[decimal]$c.quantity-$discount
    $eventTime=[datetime]$promo[0].time
    $valid=($promo[0].httpStatus -eq 201 -and $p.isActive -and [datetime]$p.startsAt -lt $eventTime.ToLocalTime() -and [datetime]$p.endsAt -gt $eventTime.ToLocalTime() -and $p.freeShipping -and $c.before.stock -ge $c.quantity -and $recalculated -eq 0 -and [decimal]$c.dbAfterCreate.amount -eq 0)
    if(!$valid){throw "Invalid failing-case precondition $($c.id)"}
    $repro += [ordered]@{case=$c.id;baselineStatus=$old[0].status;retestStatus=$c.status;preconditionsVerified=$valid;price=$c.price;quantity=$c.quantity;stockBefore=$c.before.stock;promotion=$p;promotionCreateStatus=$promo[0].httpStatus;recalculatedDiscount=$discount;shippingAfterFreePromotion=0;recalculatedTotal=$recalculated;db=$c.dbAfterCreate;afterCallback=$c.dbAfterCallback;failedChecks=$actual.failedChecks;frequency='2/2 independent runs for this case';bug='QLPT-341';httpRecords=$indices}
  }
}
if($formal.Count -ne 59 -or $repro.Count -ne 6 -or @($checks | Where-Object status -eq Fail).Count -ne 12){throw 'Unexpected coverage'}
foreach($f in $formal){foreach($key in @('id','description','precondition','steps','testData','expectedResult','actualResult','status','evidence')){if(!$f[$key]){throw "Missing $key on $($f.id)"}}}
SaveJson 'formal-test-cases.json' $formal
$doc | Set-Content "$PSScriptRoot/test-execution-results.md" -Encoding utf8
SaveJson 'failure-reproduction.json' $repro
SaveJson 'order-payment-reconciliation.json' $money
$counts=[ordered]@{PASS=@($formal | Where-Object status -eq PASS).Count;FAIL=@($formal | Where-Object status -eq FAIL).Count;BLOCKED=@($formal | Where-Object status -eq BLOCKED).Count;'NOT RUN'=0}
$summary=[ordered]@{task='QLPT-294';environment=$envInfo;total=$formal.Count;counts=$counts;passRateExecuted=39/45*100;passRateAllPlanned=39/59*100;executionCoverage=45/59*100;httpRequests=$http.Count;assertions=$checks.Count;failedAssertions=12;reproducedFailCases=$repro.Count;bugs=@{total=1;primaryOrder=0;primaryPayment=1;primaryShipping=0;crossImpactOrder=1;severity='Medium (proposed)';priority='Medium';id='QLPT-341'};paymentSnapshots=$money.Count;uniqueReconciledOrders=@($money | ForEach-Object { $_.orderId } | Select-Object -Unique).Count;allMoneyMatched=$true;baselineCommit='bdb1c13e19fdd68ba5476ac43b9ae9e9eb1d6ce3';definitionOfDone='59 complete formal records; 6 failures reproduced, linked to confirmed bug; 14 explicit blocked reasons; all observed payment records reconciled; summary and evidence retained'}
SaveJson 'execution-summary.json' $summary
$table=@('| Test Case ID | Baseline | Retest / cuối cùng | Bug |','|---|---|---|---|')
$table+=@($formal | ForEach-Object { "| $($_.id) | $($_.status) | $($_.status) | $($_.relatedBug) |" })
$table | Set-Content "$PSScriptRoot/result-table.md" -Encoding utf8
$summary | ConvertTo-Json -Depth 5
