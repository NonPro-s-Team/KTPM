# QLPT-356 — Tổng hợp kết quả & báo cáo bug Order/Payment/Shipping

## Cấu trúc và chạy lại

Thư mục này gộp evidence của QLPT-355 và báo cáo tổng hợp QLPT-356 để tránh tạo nhiều thư mục theo task.

- `OrderAmountEpIT.java` tại `backend/src/test/java/com/greenjuicehub/backend/e2e/` là test HTTP EP cho Order/Payment/Shipping.
- `execution-summary.json` là kết quả lần chạy gốc.
- `bug-report.md` ghi F01, F02 và rủi ro R01.

Chạy lại từ `backend` bằng H2 cô lập:

```powershell
./mvnw.cmd '-Dtest=OrderAmountEpIT' '-Dep.output=../test-evidence/order-payment-ep/generated' test
```

Lần chạy mặc định lưu JSON vào `generated/`, vốn được Git ignore. Đặt `-Dep.failOnFindings=true` để Maven fail khi các phát hiện còn tồn tại.

## Nguồn và phạm vi

Kế thừa QLPT-355, commit `5a772713c6d051653b1361ddef7a0e40a830e784`, thời điểm bắt đầu `2026-09-13T01:33:00.385099300Z`. Task 356 tổng hợp evidence, không chạy lại. HTTP backend thật, H2 cô lập, GHN/blacklist mock; callback thanh toán có xác thực bằng khóa test.

## Thống kê theo nhóm

|Nhóm|Tổng|Pass|Fail|Blocked|
|---|---:|---:|---:|---:|
|Order + VNPay: tổng tiền, giảm giá, phí ship|16|12|4|0|
|Shipping: API địa giới (stub)|3|3|0|0|
|Order: COD, số lượng, validation, chống giả mạo|14|14|0|0|
|Payment: SePay BANK_TRANSFER / MOMO|6|4|2|0|
|Shipping: fault injection phí âm|2|2|0|0|
|Phạm vi chưa thực thi|3|0|0|3|

44 mục kết quả = 41 ca thực thi + 3 phạm vi chưa thực thi. 35 Pass, 6 Fail, 3 Blocked; 213 requests; 661 assertions (651 Pass, 10 Fail). Tỷ lệ Pass trên ca thực thi 85,37%; không tính Blocked là Pass. Hai Pass phí âm chỉ là characterization. Nhóm phân loại loại trừ nhau để không đếm trùng ca Order bao gồm Payment/Shipping.

## Đối chiếu SRS/SDD và code

|Căn cứ|Quy tắc|Coverage|Kết quả|
|---|---|---|---|
|SRS FR-ORD-02/03; DTO|Hai luồng; quantity @NotNull/@Min(1), cart không rỗng|EP01–08 BUY/CART; EP09/10; INPUT|Tổng tiền/validation đạt các ca đã chạy; 4 Fail ở callback|
|SRS FR-PROMO-02; OrderServiceImpl:566–572|FIXED clamp, PERCENT FLOOR từ source|EP03–07; INPUT-percent-over-100|Đúng phép tính; >100 bị chặn|
|SRS FR-ORD-01; ShippingFeePolicy|Fallback 30.000, GHN theo địa chỉ; free ship theo promo|EP01/02/06; SHIPPING; negative-GHN|Stub được kiểm tra; rủi ro âm; live Blocked|
|SDD orders/payment; schema.sql|DECIMAL(12,2) NOT NULL; total dẫn xuất|DB snapshots của ca Order|H2 đối chiếu được; không chứng minh MySQL|
|SRS FR-PAY-02; VnpayServiceImpl|URL, chữ ký, IPN xác nhận|Callbacks EP01–08|Tổng dương đạt; đơn 0 không nhất quán|
|SRS FR-PAY-04; SePayWebhookServiceImpl|SRS yêu cầu tiền khớp; code nhận >=|6 ca SePay|4 Pass / 2 Fail theo SRS|

## Danh sách bug và rủi ro

Xem [bug-report.md](bug-report.md): đầy đủ dữ liệu, tiền điều kiện, bước tái hiện, Expected/Actual, severity, ảnh hưởng và đề xuất. F01: 4 ca lỗi tích hợp đơn 0, đã được tài liệu cũ tham chiếu QLPT-341. F02: 2 ca khác biệt SRS/code về tiền dư, cần xác nhận nghiệp vụ. R01: 2 quan sát rủi ro ship âm, không phải lỗi luồng GHN thật đã chứng minh.

## Kết luận

Các phép tính và đối chiếu Order–Payment của 16 ca chính đạt; không thể kết luận toàn module đạt vì F01 và sai khác F02, đồng thời còn MySQL/GHN/VNPay thật chưa thực thi. Ưu tiên thống nhất đơn miễn phí, chính sách tiền dư, contract phí ship; retest sau khi sửa. Không thay đổi source hoặc Jira.

## Danh sách ca truy vết

|Case ID|Nhóm|Kết quả|
|---|---|---|
|BUY-EP01-positive-no-promo|Order + VNPay: tổng tiền, giảm giá, phí ship|Pass|
|BUY-EP02-carrier-fee|Order + VNPay: tổng tiền, giảm giá, phí ship|Pass|
|BUY-EP03-fixed-partial|Order + VNPay: tổng tiền, giảm giá, phí ship|Pass|
|BUY-EP04-fixed-exceeds-subtotal|Order + VNPay: tổng tiền, giảm giá, phí ship|Pass|
|BUY-EP05-zero-total|Order + VNPay: tổng tiền, giảm giá, phí ship|Fail|
|BUY-EP06-percent-fraction|Order + VNPay: tổng tiền, giảm giá, phí ship|Pass|
|BUY-EP07-percent-full|Order + VNPay: tổng tiền, giảm giá, phí ship|Fail|
|BUY-EP08-positive-decimal|Order + VNPay: tổng tiền, giảm giá, phí ship|Pass|
|CART-EP01-positive-no-promo|Order + VNPay: tổng tiền, giảm giá, phí ship|Pass|
|CART-EP02-carrier-fee|Order + VNPay: tổng tiền, giảm giá, phí ship|Pass|
|CART-EP03-fixed-partial|Order + VNPay: tổng tiền, giảm giá, phí ship|Pass|
|CART-EP04-fixed-exceeds-subtotal|Order + VNPay: tổng tiền, giảm giá, phí ship|Pass|
|CART-EP05-zero-total|Order + VNPay: tổng tiền, giảm giá, phí ship|Fail|
|CART-EP06-percent-fraction|Order + VNPay: tổng tiền, giảm giá, phí ship|Pass|
|CART-EP07-percent-full|Order + VNPay: tổng tiền, giảm giá, phí ship|Fail|
|CART-EP08-positive-decimal|Order + VNPay: tổng tiền, giảm giá, phí ship|Pass|
|SHIPPING-provinces|Shipping: API địa giới (stub)|Pass|
|SHIPPING-districts?provinceId=202|Shipping: API địa giới (stub)|Pass|
|SHIPPING-wards?districtId=1454|Shipping: API địa giới (stub)|Pass|
|BUY-zero-COD|Order: COD, số lượng, validation, chống giả mạo|Pass|
|CART-zero-COD|Order: COD, số lượng, validation, chống giả mạo|Pass|
|INPUT-quantity--7|Order: COD, số lượng, validation, chống giả mạo|Pass|
|INPUT-quantity-0|Order: COD, số lượng, validation, chống giả mạo|Pass|
|INPUT-empty-cart|Order: COD, số lượng, validation, chống giả mạo|Pass|
|INPUT-percent-over-100|Order: COD, số lượng, validation, chống giả mạo|Pass|
|BUY-client-money-tampering|Order: COD, số lượng, validation, chống giả mạo|Pass|
|CART-client-money-tampering|Order: COD, số lượng, validation, chống giả mạo|Pass|
|SEPAY-BANK_TRANSFER-delta--5000|Payment: SePay BANK_TRANSFER / MOMO|Pass|
|SEPAY-BANK_TRANSFER-delta-0|Payment: SePay BANK_TRANSFER / MOMO|Pass|
|SEPAY-BANK_TRANSFER-delta-5000|Payment: SePay BANK_TRANSFER / MOMO|Fail|
|SEPAY-MOMO-delta--5000|Payment: SePay BANK_TRANSFER / MOMO|Pass|
|SEPAY-MOMO-delta-0|Payment: SePay BANK_TRANSFER / MOMO|Pass|
|SEPAY-MOMO-delta-5000|Payment: SePay BANK_TRANSFER / MOMO|Fail|
|BUY-negative-GHN-fault-injection|Shipping: fault injection phí âm|Pass|
|CART-negative-GHN-fault-injection|Shipping: fault injection phí âm|Pass|
|EP10-valid-quantity-BUY|Order: COD, số lượng, validation, chống giả mạo|Pass|
|EP10-valid-quantity-CART|Order: COD, số lượng, validation, chống giả mạo|Pass|
|EP09-quantity-missing|Order: COD, số lượng, validation, chống giả mạo|Pass|
|EP09-quantity-fraction|Order: COD, số lượng, validation, chống giả mạo|Pass|
|EP09-quantity-text|Order: COD, số lượng, validation, chống giả mạo|Pass|
|EP09-quantity-over-stock|Order: COD, số lượng, validation, chống giả mạo|Pass|
|MYSQL-STORAGE|Phạm vi chưa thực thi|Blocked|
|LIVE-GHN|Phạm vi chưa thực thi|Blocked|
|LIVE-VNPAY|Phạm vi chưa thực thi|Blocked|
