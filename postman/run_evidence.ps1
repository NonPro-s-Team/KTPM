$ErrorActionPreference = 'Stop'
$base = 'http://localhost:8081'
$evidence = [ordered]@{ generatedAt = (Get-Date).ToString('yyyy-MM-dd HH:mm:ss zzz'); tasks = @() }

function Call-Api($name, $method, $path, $token=$null, $body=$null, $headers=@{}) {
  $h = @{} + $headers
  if ($token) { $h.Authorization = "Bearer $token" }
  $params = @{ Uri="$base$path"; Method=$method; Headers=$h; UseBasicParsing=$true; SkipHttpErrorCheck=$true }
  if ($null -ne $body) { $params.ContentType='application/json'; $params.Body=($body | ConvertTo-Json -Depth 10) }
  $r = Invoke-WebRequest @params
  $parsed = try { $r.Content | ConvertFrom-Json } catch { $r.Content }
  [pscustomobject]@{ name=$name; method=$method; path=$path; requestBody=$body; status=[int]$r.StatusCode; response=$parsed }
}

$customerLogin = Call-Api 'Login customer' POST '/api/auth/login' $null @{identifier='seed.user001@greenjuicehub.local';password='password'}
$adminLogin = Call-Api 'Login admin' POST '/api/auth/login' $null @{identifier='seed.admin@greenjuicehub.local';password='password'}
$ct = $customerLogin.response.accessToken; $at = $adminLogin.response.accessToken
$addresses = Call-Api 'Load address' GET '/api/users/me/addresses' $ct
$addressId = @($addresses.response)[0].id
$products = Call-Api 'Load product' GET '/api/products?page=0&size=20'
$p = @($products.response.content)[0]
$detail = Call-Api 'Load product detail' GET "/api/products/$($p.slug)"
$variant = @($detail.response.variants | Where-Object { $_.isActive -ne $false -and [int]$_.stockQty -gt 5 })[0]
if (-not $variant) { $variant = @($detail.response.variants)[0] }

$taskOrder = [ordered]@{ key='QLPT-239'; title='Test Postman API Order'; cases=@() }
$orderBody = @{variantId=$variant.id;quantity=1;addressId=$addressId;paymentMethod='COD';promoCode=$null;note='Evidence QLPT-239'}
$created = Call-Api 'ORD-02 Buy now creates PENDING order' POST '/api/orders/buy-now' $ct $orderBody
$oid = $created.response.id
$taskOrder.cases += $created
$taskOrder.cases += Call-Api 'ORD-04 Get order detail' GET "/api/orders/$oid" $ct
$taskOrder.cases += Call-Api 'ORD-07 Reject PENDING -> DELIVERED' PATCH "/api/orders/$oid/confirm-delivered" $ct
$taskOrder.cases += Call-Api 'ORD-08 Cancel PENDING order' PATCH "/api/orders/$oid/cancel" $ct @{reason='Evidence cancellation'}
$taskOrder.cases += Call-Api 'ORD-09 Reject duplicate cancellation' PATCH "/api/orders/$oid/cancel" $ct @{reason='Duplicate cancellation'}
$flow = Call-Api 'Create order for valid state flow' POST '/api/orders/buy-now' $ct $orderBody
$flowId=$flow.response.id
$taskOrder.cases += Call-Api 'Admin PENDING -> CONFIRMED' PATCH "/api/admin/orders/$flowId/status" $at @{status='CONFIRMED';cancelReason=$null}
$taskOrder.cases += Call-Api 'Admin CONFIRMED -> SHIPPING' PATCH "/api/admin/orders/$flowId/status" $at @{status='SHIPPING';cancelReason=$null}
$taskOrder.cases += Call-Api 'Reject SHIPPING -> PENDING' PATCH "/api/admin/orders/$flowId/status" $at @{status='PENDING';cancelReason=$null}
$taskOrder.cases += Call-Api 'Customer SHIPPING -> DELIVERED' PATCH "/api/orders/$flowId/confirm-delivered" $ct
$evidence.tasks += $taskOrder

$taskPayment = [ordered]@{ key='QLPT-240'; title='Test Postman API Payment & Webhook'; cases=@() }
$payBody = @{variantId=$variant.id;quantity=1;addressId=$addressId;paymentMethod='BANK_TRANSFER';promoCode=$null;note='Evidence QLPT-240'}
$payOrder = Call-Api 'Create BANK_TRANSFER order' POST '/api/orders/buy-now' $ct $payBody
$payId=$payOrder.response.id; $payCode=$payOrder.response.orderCode; $payTotal=$payOrder.response.totalAmount
$taskPayment.cases += $payOrder
$vnpBody = $payBody.Clone(); $vnpBody.paymentMethod='VNPAY'; $vnpBody.note='Evidence QLPT-240 VNPay'
$vnpOrder = Call-Api 'Create VNPAY order' POST '/api/orders/buy-now' $ct $vnpBody
$taskPayment.cases += $vnpOrder
$vnp = Call-Api 'Create VNPay payment URL' POST '/api/payment/vnpay/create-url' $ct @{orderId=$vnpOrder.response.id}
if ($vnp.response.paymentUrl) { $vnp.response.paymentUrl = '[generated VNPay sandbox URL - signature redacted]' }
$taskPayment.cases += $vnp
$sepayKey = ((Get-Content 'backend/src/main/resources/application-local.yml' | Select-String '^\s+api-key:\s+(.+)$').Matches.Groups[1].Value).Trim()
$webhook = @{id=[DateTimeOffset]::Now.ToUnixTimeSeconds();gateway='Vietcombank';transactionDate=(Get-Date).ToString('yyyy-MM-dd HH:mm:ss');accountNumber='1234567890';transferType='in';transferAmount=$payTotal;accumulated=$payTotal;content="Thanh toan $payCode";referenceCode="EVIDENCE-$([DateTimeOffset]::Now.ToUnixTimeSeconds())";description='QLPT-240 valid webhook'}
$taskPayment.cases += Call-Api 'Valid SePay webhook' POST '/api/webhooks/sepay' $null $webhook @{Authorization="apikey $sepayKey"}
$paid = Call-Api 'Verify order paymentStatus=PAID' GET "/api/orders/$payId" $ct
$taskPayment.cases += $paid
$taskPayment.cases += Call-Api 'Replay same webhook (idempotency)' POST '/api/webhooks/sepay' $null $webhook @{Authorization="apikey $sepayKey"}
$taskPayment.cases += Call-Api 'Verify still PAID after replay' GET "/api/orders/$payId" $ct
$taskPayment.cases += Call-Api 'Reject webhook without API key' POST '/api/webhooks/sepay' $null $webhook
$evidence.tasks += $taskPayment

$taskShipping = [ordered]@{ key='QLPT-241'; title='Test Postman API Shipping'; cases=@() }
$provinces = Call-Api 'List provinces' GET '/api/shipping/provinces'
$province = @($provinces.response)[0]; $provinceId = if($province.ProvinceID){$province.ProvinceID}else{$province.province_id}
$provinces.response = [pscustomobject]@{count=@($provinces.response).Count;sample=$province}
$taskShipping.cases += $provinces
$districts = Call-Api 'List districts by province' GET "/api/shipping/districts?provinceId=$provinceId"
$district=@($districts.response)[0]; $districtId=if($district.DistrictID){$district.DistrictID}else{$district.district_id}
$districts.response=[pscustomobject]@{count=@($districts.response).Count;sample=$district}
$taskShipping.cases += $districts
$wards=Call-Api 'List wards by district' GET "/api/shipping/wards?districtId=$districtId"
$wards.response=[pscustomobject]@{count=@($wards.response).Count;sample=@($wards.response)[0]}
$taskShipping.cases += $wards
$taskShipping.cases += Call-Api 'Calculate shipping fee' POST '/api/orders/shipping-fee' $ct @{addressId=$addressId;variantId=$variant.id;quantity=1}
$taskShipping.cases += Call-Api 'Reject missing address' POST '/api/orders/shipping-fee' $ct @{addressId=999999999;variantId=$variant.id;quantity=1}
$taskShipping.cases += Call-Api 'Require authentication for shipping fee' POST '/api/orders/shipping-fee' $null @{addressId=$addressId;variantId=$variant.id;quantity=1}
$evidence.tasks += $taskShipping

$evidence | ConvertTo-Json -Depth 20
