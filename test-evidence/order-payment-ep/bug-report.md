# QLPT-356 — Báo cáo bug và rủi ro

Nguồn: lần thực thi QLPT-355 ngày 13/09/2026, commit 5a772713c6d051653b1361ddef7a0e40a830e784. Không chạy lại hoặc thay đổi kết quả.


## F01 — VNPay cấp URL cho đơn 0đ nhưng IPN không thể xác nhận

**Phân loại:** Lỗi tích hợp tái hiện

**Mức ảnh hưởng / ưu tiên:** Major; ưu tiên đề xuất High

**Trạng thái:** Tái hiện theo evidence; chưa sửa. Repository đã ghi QLPT-341, cần liên kết lỗi cũ khi nộp. Chưa kiểm tra trạng thái Jira hiện tại.

**Dữ liệu test:** Giá 75.000; quantity=1; FIXED=75.000 hoặc PERCENT=100; freeShipping=true; VNPAY. Cả BUY và CART.

### Bước tái hiện
1. Seed customer, địa chỉ và variant active/stock=1000 trong H2; tạo promo hợp lệ qua POST /api/admin/promotions.
2. POST /api/orders/buy-now hoặc /api/orders với fixture trên; kiểm tra Order.totalAmount=Payment.amount=0.
3. POST /api/payment/vnpay/create-url với orderId trả về.
4. Gửi GET /api/payment/vnpay/ipn có vnp_TxnRef=orderCode, vnp_Amount=0, ResponseCode=00, TransactionStatus=00 và HMAC-SHA512 hợp lệ bằng khóa test.
5. Gọi Return rồi truy vấn lại trạng thái Order/Payment.

**Expected Result:** Xử lý nhất quán đơn 0 trước khi cấp URL: có luồng hoàn tất đơn miễn phí hoặc chặn/rẽ luồng phù hợp. Sau khi đã cấp URL, không để callback chính xác luôn bị từ chối. Đây là oracle nhất quán liên thành phần, không có requirement riêng khẳng định cổng thật nhận 0đ.

**Actual Result:** create-url HTTP 200 với vnp_Amount=0; IPN HTTP 200 nhưng RspCode=04; Return confirmed=false; DB PENDING. Tái hiện 4 ca.

**Ảnh hưởng:** Người dùng không hoàn tất được đơn VNPAY đã được tạo; trạng thái giao dịch không tiến triển và có thể chịu quy trình hủy quá hạn. Chưa quan sát job hủy trong lần này.

**Căn cứ SRS/SDD/source:** SRS FR-PAY-02; OrderServiceImpl:105,248,172,300; VnpayServiceImpl:70,97,163–166. received.signum()>0 loại 0.

**Đề xuất xử lý:** Thống nhất xử lý đơn miễn phí tại Order/Payment; thêm regression BUY/CART cho FIXED toàn phần và PERCENT 100%. Không suy ra cần cho cổng thật thanh toán 0đ.

**Evidence IDs:** BUY-EP05-zero-total, BUY-EP07-percent-full, CART-EP05-zero-total, CART-EP07-percent-full

## F02 — SePay nhận dư tiền vẫn PAID, khác SRS FR-PAY-04

**Phân loại:** Sai khác đặc tả / implementation, cần xác nhận nghiệp vụ

**Mức ảnh hưởng / ưu tiên:** Medium tạm thời; ưu tiên đề xuất Medium

**Trạng thái:** 2 ca Fail theo oracle SRS; chưa khẳng định là bug nghiệp vụ nếu chủ đích cho nhận dư.

**Dữ liệu test:** Đơn 80.000 = giá 50.000 + ship 30.000; BANK_TRANSFER và MOMO; transferAmount=85.000, transferType=in, đúng orderCode.

### Bước tái hiện
1. Tạo đơn 80.000, phương thức BANK_TRANSFER; lặp lại với MOMO.
2. POST /api/webhooks/sepay với header Apikey test hợp lệ và body transferType=in, transferAmount=85000, content=orderCode, referenceCode duy nhất.
3. Truy vấn orders.payment_status, payments.status và payments.amount.

**Expected Result:** Theo SRS FR-PAY-04: số tiền chuyển khoản khớp tổng đơn trước khi PAID. Với 85.000 khác 80.000, chưa đánh dấu PAID theo oracle này. HTTP 200 không phải tiêu chí xác nhận thanh toán.

**Actual Result:** Webhook HTTP 200; orders.payment_status=PAID, payments.status=SUCCESS, payments.amount vẫn 80.000. Ca thiếu 75.000 còn PENDING; đúng 80.000 PAID.

**Ảnh hưởng:** Khác biệt quy tắc đối soát có thể làm khó xử lý phần tiền dư. Không có bằng chứng mất tiền hay sai phép tính Payment.amount.

**Căn cứ SRS/SDD/source:** SRS FR-PAY-04 câu “xác minh số tiền chuyển khoản khớp với tổng tiền đơn hàng”; SePayWebhookServiceImpl:61 chỉ chặn transferAmount < totalAmount. SDD payments.amount: DECIMAL(12,2).

**Đề xuất xử lý:** Xác nhận chính sách thiếu/đủ/dư. Nếu nhận dư có chủ đích, cập nhật SRS và test oracle, quy định cách xử lý tiền dư; nếu yêu cầu khớp tuyệt đối, sửa điều kiện xác nhận và regression cả MOMO/BANK_TRANSFER.

**Evidence IDs:** SEPAY-BANK_TRANSFER-delta-5000, SEPAY-MOMO-delta-5000

## R01 — Phí GHN âm có thể tạo tổng Order/Payment âm

**Phân loại:** Rủi ro phòng vệ có điều kiện, không tính là bug đã xác nhận ở luồng thật

**Mức ảnh hưởng / ưu tiên:** Ảnh hưởng tiềm năng High nếu đầu vào bất thường xảy ra; ưu tiên đánh giá Medium

**Trạng thái:** 2 ca characterization Pass, không đưa vào 6 Fail.

**Dữ liệu test:** Giá 50.000,99; quantity=1; COD; địa chỉ đủ điều kiện GHN; stub phí −50.001.

### Bước tái hiện
1. Seed fixture cô lập như bộ test; địa chỉ HCM có districtId và wardCode.
2. Đặt GHN mock calculateShippingFee trả −50.001.
3. POST buy-now / orders rồi truy vấn các trường tiền trong DB.

**Expected Result:** Chưa tìm thấy min tổng tiền nghiệp vụ trong SRS/SDD. Kiểm tra robustness để quan sát; khuyến nghị phòng vệ là không lưu phí/tổng âm bất thường. Không dùng khuyến nghị này làm requirement đã tồn tại.

**Actual Result:** Cả BUY/CART HTTP 200; Order.totalAmount và Payment.amount=−0,01.

**Ảnh hưởng:** Nếu nguồn phí bất thường lọt vào hệ thống, có thể lưu tiền âm và ảnh hưởng đối soát. Chưa chứng minh GHN thật trả phí âm.

**Căn cứ SRS/SDD/source:** SRS FR-ORD-01; SDD orders.total_amount DECIMAL(12,2) NOT NULL; schema.sql:239–242 không có CHECK >=0; OrderServiceImpl:576–586 nhận phí và :105/:248 cộng thẳng.

**Đề xuất xử lý:** Xác định contract phí không âm; cân nhắc validate/fallback phí bất thường và guard tổng tiền sau khi thống nhất nghiệp vụ. Kiểm thử GHN thật riêng.

**Evidence IDs:** BUY-negative-GHN-fault-injection, CART-negative-GHN-fault-injection