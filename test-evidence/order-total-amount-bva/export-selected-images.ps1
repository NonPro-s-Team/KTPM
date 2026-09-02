$ErrorActionPreference='Stop'
Add-Type -AssemblyName System.Drawing
$root=$PSScriptRoot
$dest=Join-Path $root 'images'
New-Item -ItemType Directory -Path $dest -Force | Out-Null
$cases=@(Get-Content (Join-Path $root 'test-results.json') -Raw | ConvertFrom-Json)
$events=@(Get-Content (Join-Path $root 'api-evidence.json') -Raw | ConvertFrom-Json)
$summary=Get-Content (Join-Path $root 'execution-summary.json') -Raw | ConvertFrom-Json
$manifest=[Collections.Generic.List[object]]::new()
function Export-Selected([string]$file,[string]$title,[string[]]$lines,[string]$source){
    $expanded=[Collections.Generic.List[string]]::new()
    foreach($line in $lines){if(!$line){$expanded.Add('');continue};for($i=0;$i -lt $line.Length;$i+=133){$expanded.Add($line.Substring($i,[Math]::Min(133,$line.Length-$i)))}}
    $height=240+$expanded.Count*25+80
    $bitmap=[Drawing.Bitmap]::new(1500,$height);$g=[Drawing.Graphics]::FromImage($bitmap)
    $font=[Drawing.Font]::new('Consolas',16,[Drawing.FontStyle]::Regular,[Drawing.GraphicsUnit]::Pixel)
    $heading=[Drawing.Font]::new('Segoe UI',28,[Drawing.FontStyle]::Bold,[Drawing.GraphicsUnit]::Pixel)
    $label=[Drawing.Font]::new('Segoe UI',18,[Drawing.FontStyle]::Regular,[Drawing.GraphicsUnit]::Pixel)
    try{
        $g.Clear([Drawing.Color]::White);$g.TextRenderingHint=[Drawing.Text.TextRenderingHint]::AntiAliasGridFit
        $g.FillRectangle([Drawing.Brushes]::AliceBlue,0,0,1500,178)
        $g.DrawString('QLPT-293 | BỘ MINH CHỨNG CHỌN LỌC',$label,[Drawing.Brushes]::RoyalBlue,40,20)
        $g.DrawString($title,$heading,[Drawing.Brushes]::MidnightBlue,40,55)
        $g.DrawString('Ảnh báo cáo từ evidence API đã lưu — không phải screenshot Postman.',$label,[Drawing.Brushes]::Firebrick,40,104)
        $g.DrawString('H2 MySQL mode • GHN stub • callback giả lập • chạy 31/08/2026 • không giao dịch thật',$label,[Drawing.Brushes]::SlateGray,40,139)
        for($i=0;$i -lt $expanded.Count;$i++){$g.DrawString($expanded[$i],$font,[Drawing.Brushes]::Black,40,(204+$i*25))}
        $g.DrawString("Nguồn: $source | Payload đầy đủ giữ trong JSON/Postman Examples.",$label,[Drawing.Brushes]::SlateGray,40,($height-45))
        $path=Join-Path $dest $file;$bitmap.Save($path,[Drawing.Imaging.ImageFormat]::Png)
        $manifest.Add([pscustomobject]@{file="images/$file";title=$title;source=$source;sha256=(Get-FileHash -LiteralPath $path -Algorithm SHA256).Hash})
    }finally{$font.Dispose();$heading.Dispose();$label.Dispose();$g.Dispose();$bitmap.Dispose()}
}

Export-Selected '01-tong-hop-ket-qua.png' '01 — Tổng hợp kết quả và phạm vi' @(
"KẾT QUẢ: $($summary.cases) cases = $($summary.outcomes.Pass) Pass + $($summary.outcomes.Fail) Fail + $($summary.outcomes.Blocked) Blocked",
"EVIDENCE: $($events.Count) HTTP requests; $($summary.checks) checks; 12 failed checks cùng một lỗi.",'',
'Hai luồng: POST /api/orders (CART) và POST /api/orders/buy-now (BUY).',
'subtotal = SUM(unitPrice x quantity); total = subtotal - discount + shipping.',
'Fixed discount = MIN(promo value, subtotal). Percent discount = FLOOR(subtotal x percent / 100).',
'freeShipping=true -> ship=0. Thiếu mã GHN -> fallback 30000. GHN stub -> 19000.','',
'Biên tiền đã thử: 0.01; 0; fixed discount vượt subtotal 0.01 bị clamp về total=0.',
'Delta đã xác minh ở backend: 0.01. Không tự đặt min/max nghiệp vụ.',
'Biên lưu trữ DECIMAL(12,2) khác biên nghiệp vụ; chưa xác minh MySQL thật.','',
'BUG QLPT-341: đơn VNPAY 0đ được cấp URL nhưng callback đúng tiền bị từ chối.',
'6 ca Fail là cùng một root cause, không phải 6 bug khác nhau.',
'Order và Payment lưu tiền khớp nhau trong 26 ca chính; lỗi nằm ở xử lý online total=0.','',
'14 ca Blocked được công khai: 6 biên trên API, 6 kiểm tra MySQL, 2 tích hợp thật.',
'39 Pass bao gồm characterization; không có nghĩa tổng âm từ GHN stub là đúng nghiệp vụ.','',
'Bộ bàn giao gọn: 5 ảnh này + test cases + Postman Examples + JSON/log + bug report.',
'Ảnh là bản tóm lược minh chứng, không cần nộp ảnh của từng request.'
) 'execution-summary.json + source review'

$lines=[Collections.Generic.List[string]]::new()
$lines.Add('Cố định quantity=1. BUY/CART có dữ liệu tương đương; tên case rút gọn bỏ tiền tố flow.')
$lines.Add('Các số tiền dưới đây đọc từ DB H2 sau tạo đơn. Fail là trạng thái của cả hành trình online.')
$lines.Add('')
$lines.Add(('{0,-4} {1,-40} {2,10} {3,10} {4,8} {5,10} {6,-5}' -f 'Flow','Case','Subtotal','Discount','Ship','Total','Case'))
$lines.Add('-'*103)
foreach($c in ($cases | Where-Object dbAfterCreate)){$d=$c.dbAfterCreate;$flow=($c.id -split '-',2)[0];$name=($c.id -split '-',2)[1];$lines.Add(('{0,-4} {1,-40} {2,10} {3,10} {4,8} {5,10} {6,-5}' -f $flow,$name,$d.subtotal,$d.discount_amount,$d.shipping_fee,$d.total_amount,$c.status))}
$lines.Add('');$lines.Add('Promo fixed=50000.01 bị clamp discount=50000: không tạo total=-0.01 bằng promo hợp lệ.')
$lines.Add('PERCENT=10: tại S=50009.99 / 50010 / 50010.01, discount=5000 / 5001 / 5001 (FLOOR).')
Export-Selected '02-bva-hai-luong-tao-don.png' '02 — BVA tổng tiền trên cả BUY và CART' $lines.ToArray() 'test-results.json'

$lines=[Collections.Generic.List[string]]::new()
$lines.Add('Đọc lại Order/Payment từ DB riêng; vnp_Amount là số tiền trong URL thanh toán đã trả về.')
$lines.Add('')
$lines.Add(('{0,-46} {1,10} {2,10} {3,12} {4,-9}' -f 'Case','Order','Payment','vnp_Amount','Sau IPN'))
$lines.Add('-'*95)
foreach($c in ($cases | Where-Object dbAfterCreate)){
    $urlEvent=$events | Where-Object { $_.case -eq $c.id -and $_.path -eq '/api/payment/vnpay/create-url' } | Select-Object -First 1
    $match=[regex]::Match($urlEvent.responseBody.paymentUrl,'[?&]vnp_Amount=([^&]+)')
    $lines.Add(('{0,-46} {1,10} {2,10} {3,12} {4,-9}' -f $c.id,$c.dbAfterCreate.total_amount,$c.dbAfterCreate.amount,$match.Groups[1].Value,$c.dbAfterCallback.payment_status))
}
$lines.Add('');$lines.Add('Tiền khớp nhau không đồng nghĩa thanh toán hoàn tất: 6 đơn total=0 vẫn PENDING.')
$lines.Add('Ca dương: IPN lệch -0.01 / +0.01 -> 04; sai chữ ký -> 97; đúng tiền -> 00.')
$lines.Add('Return trước IPN chỉ hiển thị; không tự chuyển trạng thái thanh toán.')
Export-Selected '03-doi-chieu-order-payment.png' '03 — Order ↔ Payment ↔ số tiền VNPay' $lines.ToArray() 'test-results.json + API evidence'

$lines=[Collections.Generic.List[string]]::new()
$lines.Add('BUG QLPT-341 — Order và Payment không thống nhất xử lý total=0.')
$lines.Add('Tiền điều kiện: giá=50000, qty=1, FIXED promo=50000, freeShipping=true, method=VNPAY.')
foreach($id in @('BUY-lower-zero','CART-lower-zero')){
    $c=$cases | Where-Object id -eq $id
    $create=$events | Where-Object { $_.case -eq $id -and $_.path -in '/api/orders','/api/orders/buy-now' } | Select-Object -First 1
    $ipn=$events | Where-Object { $_.case -eq $id -and $_.path -match '/vnpay/ipn\?' } | Select-Object -First 1
    $ret=$events | Where-Object { $_.case -eq $id -and $_.path -match '/vnpay/return\?' } | Select-Object -First 1
    $lines.Add('');$lines.Add("CASE $id | orderId=$($c.actual.id) | orderCode=$($c.actual.orderCode)")
    $lines.Add("REQUEST: POST $($create.path)");$lines.Add(($create.requestBody | ConvertTo-Json -Compress -Depth 8))
    $lines.Add("ACTUAL: HTTP $($create.httpStatus); S=50000; D=50000; ship=0; Order.total=0; Payment.amount=0.")
    $lines.Add('CREATE URL: HTTP 200, vnp_Amount=0.')
    $lines.Add('IPN input: vnp_Amount=0, ResponseCode=00, TransactionStatus=00, chữ ký test hợp lệ.')
    $lines.Add("IPN ACTUAL: HTTP $($ipn.httpStatus) " + ($ipn.responseBody | ConvertTo-Json -Compress))
    $lines.Add("RETURN ACTUAL: HTTP $($ret.httpStatus), success=$($ret.responseBody.success), confirmed=$($ret.responseBody.confirmed)")
    $lines.Add("DB sau callback: Order=$($c.dbAfterCallback.payment_status); Payment=$($c.dbAfterCallback.payment_record_status)")
}
$lines.Add('');$lines.Add('EXPECTED: không cấp phiên thanh toán cho số tiền mà chính backend không xử lý được.')
$lines.Add('Cần policy nhất quán: chặn online 0đ trước phiên thanh toán hoặc có luồng đơn miễn phí.')
$lines.Add('Không yêu cầu VNPay nhận thanh toán 0 và không mặc định mọi đơn 0 là không hợp lệ.')
$lines.Add('CONTROL: BUY/CART total=0.01 -> Payment=0.01 -> vnp_Amount=1 -> IPN=00 -> PAID.')
Export-Selected '04-bug-vnpay-don-khong-dong.png' '04 — Evidence lỗi đơn VNPay 0đ (hai flow)' $lines.ToArray() 'API request/response + DB snapshots; QLPT-341'

Export-Selected '05-blocked-va-gioi-han.png' '05 — Blocked, biên kỹ thuật và giới hạn kết luận' @(
'14 CASES BLOCKED — Không tính vào Pass, không tạo evidence thực thi giả.','',
'1. Biên trên System/API: 6 ca (3 giá trị x 2 flow BUY/CART)',
'   U-0.01 = 9999999999.98; U = 9999999999.99; U+0.01 = 10000000000.00.',
'   Không tạo đơn/variant/tồn kho phi thực tế để ép tổng tiền đạt hàng tỷ đồng.','',
'2. Kiểm tra MySQL storage: 6 ca',
'   -0.01 / 0 / 0.01 và ba giá trị quanh U ở trên.',
"   Actual khi kết nối: Access denied for user 'root'@'localhost' (using password: NO).",
'   Chưa xác minh SQL mode, overflow, rounding hay round-trip MySQL.',
'   H2 MySQL mode KHÔNG thay thế bằng chứng trên MySQL thật.','',
'3. Live integration: 2 ca',
'   GHN thật: chưa gọi hãng; phí 19000 là stub để giữ đầu vào ổn định.',
'   VNPay thật: chưa thanh toán; IPN/Return được ký bằng test key và gửi local.','',
'OBSERVATION CÓ ĐIỀU KIỆN — không nâng thành bug nghiệp vụ:',
'   Inject GHN fee=-50001, price=50000.99, qty=1 -> total=-0.01 được lưu.',
'   Đây không phải bằng chứng GHN thật trả phí âm; không tự đặt min nghiệp vụ.',
'   Cần thống nhất reject/fallback khi hãng gửi dữ liệu bất thường.','',
'Không có screenshot ứng dụng Postman/DB client trong bộ này.',
'5 ảnh chỉ tóm tắt dữ liệu đã lưu; payload và log nguyên bản là evidence chi tiết.',
'Done của task kiểm thử không có nghĩa bản phát hành đạt hoặc mọi ca đều Pass.'
) 'test-results.json + mysql-access-blocked.log'

$manifest | ConvertTo-Json -Depth 6 | Set-Content (Join-Path $root 'image-index.json') -Encoding utf8
[ordered]@{images=5;type='selected report images, not application screenshots';covers='summary; two order flows; Order-Payment; confirmed bug; blockers';rawEvidence=@{cases=$cases.Count;httpRequests=$events.Count};applicationScreenshots=$false} | ConvertTo-Json -Depth 5 | Set-Content (Join-Path $root 'image-coverage.json') -Encoding utf8
$readme=@'
# QLPT-293 — Chỉ dùng bộ 5 ảnh này để bàn giao

1. 01-tong-hop-ket-qua.png — số lượng, phạm vi, kỹ thuật và kết luận.
2. 02-bva-hai-luong-tao-don.png — dữ liệu biên/discount/shipping trên BUY và CART.
3. 03-doi-chieu-order-payment.png — tiền Order, Payment, vnp_Amount và trạng thái.
4. 04-bug-vnpay-don-khong-dong.png — request/response và DB chứng minh QLPT-341.
5. 05-blocked-va-gioi-han.png — các ca Blocked và giới hạn môi trường.

Đây là ảnh báo cáo xuất từ evidence đã lưu, không phải screenshot Postman hoặc lần chạy mới. Nộp kèm test cases, JSON/Postman Examples và bug report. Không cần nộp ảnh cho từng request. Bộ 554 ảnh cũ được cất trong thư mục .local-archive và bị loại khỏi Git.
'@
$readme | Set-Content (Join-Path $dest 'README.md') -Encoding utf8
$html='<html lang="vi"><meta charset="utf-8"><title>QLPT-293 - 5 ảnh minh chứng</title><style>body{font:18px system-ui;max-width:1100px;margin:30px auto}img{max-width:100%}</style><h1>QLPT-293 — Bộ 5 ảnh chọn lọc</h1><p>Ảnh báo cáo từ evidence đã lưu, không phải screenshot Postman. Xem JSON/log để đối chiếu.</p>'
foreach($m in $manifest){$name=Split-Path $m.file -Leaf;$html+="<h2>$($m.title)</h2><a href='$name'><img src='$name'></a>"}
$html+='</html>';$html | Set-Content (Join-Path $dest 'index.html') -Encoding utf8
Get-Content (Join-Path $root 'image-coverage.json')
