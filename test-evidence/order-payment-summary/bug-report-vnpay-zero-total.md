# QLPT-293 — Bug report

## BVA-293-01: Order VNPAY tổng 0 được cấp URL nhưng backend từ chối callback đúng tiền

Jira: [QLPT-341](https://hientm0978.atlassian.net/browse/QLPT-341), được tạo từ kết quả task QLPT-293; chưa sửa production code.

**Trạng thái:** Confirmed trên HTTP API + H2; đối chiếu source. Chưa chạy VNPay thật/MySQL thật. **Mức độ đề xuất:** Medium (đơn miễn phí mắc ở PENDING; không có evidence mất tiền).

**Phạm vi:** POST /api/orders và /api/orders/buy-now; POST /api/payment/vnpay/create-url; GET /api/payment/vnpay/ipn và /return.

**Tiền điều kiện:** CUSTOMER hợp lệ, variant giá 50.000, quantity=1, địa chỉ thuộc user, promotion FIXED=50.000, freeShipping=true, active và trong thời gian hiệu lực. Promotion này được tạo thành công qua POST /api/admin/promotions, không seed bypass validation. Payment method VNPAY.

**Bước tái hiện:**

1. Tạo promotion nêu trên. Với luồng CART, thêm variant vào cart trước rồi chọn cartItemId.
2. Gọi POST /api/orders/buy-now với variantId/quantity/addressId/paymentMethod/promoCode; lặp qua POST /api/orders với cartItemIds.
3. Đọc GET /api/orders/{id} và DB: subtotal=50000.00, discount_amount=50000.00, shipping_fee=0.00, total_amount=0.00; payments.amount=0.00, hai trạng thái thanh toán PENDING.
4. Gọi POST /api/payment/vnpay/create-url với orderId. HTTP 200, URL có vnp_Amount=0.
5. Gọi IPN giả lập, ký HMAC SHA512 đúng bằng test secret: vnp_TmnCode=BVA293, vnp_TxnRef=orderCode vừa tạo, vnp_Amount=0, vnp_ResponseCode=00, vnp_TransactionStatus=00, vnp_TransactionNo=<mã test>.
6. Gọi Return với cùng payload đã ký; đọc lại DB.

**Actual:** IPN HTTP 200 nhưng body `{"RspCode":"04","Message":"Confirm Fail"}`; Return success=false/confirmed=false; Order.payment_status và Payment.status vẫn PENDING. URL được cấp cho số tiền mà chính backend không xử lý được. Case total=0.01 là control dương: URL amount=1, IPN=00 và DB chuyển PAID/SUCCESS.

**Expected:** Order/Payment phải nhất quán về cách xử lý tổng 0. Nếu online không hỗ trợ thì từ chối trước khi tạo phiên thanh toán với thông báo phù hợp, hoặc xử lý đơn miễn phí qua luồng được nghiệp vụ xác nhận. Không cấp phiên thanh toán không thể hoàn tất bằng chính số tiền của đơn. **Không yêu cầu VNPay phải nhận thanh toán 0 và không khẳng định mọi đơn 0 là không hợp lệ.** Assertion “exact amount accepted after URL issued” chỉ đánh giá contract hiện tại sau khi backend đã cấp URL; không phải đề xuất bỏ validation số tiền dương ở IPN.

**Evidence:** `api-evidence.json` / Postman Examples các folder:

- BUY-lower-zero, CART-lower-zero.
- BUY-lower-minus-candidate-clamped, CART-lower-minus-candidate-clamped (fixed promo 50000.01 bị clamp về 50000).
- BUY-percent-100, CART-percent-100 (promo percent=100 và freeShipping).

Sáu case cùng **một root cause**, không báo thành sáu bug. IDs/order codes của lần chạy cuối nằm trong test-results.json và order-payment-reconciliation.json.

**Source liên quan:** OrderServiceImpl.java:105,248 không kiểm tra tổng 0 trước tạo order/payment; VnpayServiceImpl.java:70 tạo amount=0; VnpayServiceImpl.java:163–166 yêu cầu received.signum()>0. Không có sai lệch giá trị giữa orders.total_amount và payments.amount ở các case này; sai lệch nằm ở khả năng hoàn tất giao dịch.

**Hướng xử lý để đội nghiệp vụ quyết định:** thống nhất policy đơn miễn phí và điều kiện phương thức online. Sau sửa cần kiểm tra lại cả hai flow, các promo fixed/percent tạo zero, retry create-url, IPN/Return, trường hợp 0.01; không đơn giản cho phép số âm/0 tại webhook.

## OBS-293-02: Carrier fee bất thường có thể tạo tổng âm

**Phân loại:** Conditional robustness observation; chưa xác nhận bug trên dữ liệu GHN thật, không xác lập min nghiệp vụ.

Mock GhnService.calculateShippingFee trả -50001, variant price=50000.99, quantity=1, không promotion, địa chỉ HCM đủ mã GHN. Cả BUY/CART trả HTTP 200, shippingFee=-50001, total=-0.01; Order và Payment DB cùng -0.01. Source GhnService đọc fee dạng int, Order không kiểm tra sign.

Evidence: BUY-negative-GHN-fault-injection và CART-negative-GHN-fault-injection. Pass của các ca characterization là xác minh quan sát được ghi đúng, không kết luận hành vi âm đúng nghiệp vụ. Cần thống nhất cách xử lý dữ liệu hãng vận chuyển sai (fallback hoặc reject) và có fixture GHN lỗi hợp lệ trước khi nâng thành bug tích hợp thực tế.

## Không báo là bug

- Giảm FIXED vượt subtotal bị clamp về subtotal: implementation đã xác minh.
- PERCENT floor đến đồng: đúng implementation; chưa có requirement rounding khác.
- SePay nhận dư 0.01 và giữ Payment.amount bằng Order.total: đúng logic hiện tại; không suy ra bắt buộc amount nhận phải bằng tuyệt đối như VNPay.
- Biên DECIMAL trên chưa chạy qua API: Blocked, không tự tạo bug overflow nếu chưa thực thi.

## Xác nhận cho Test Summary QLPT-294

- **Bug ID:** QLPT-341 (BVA-293-01 là mã nội bộ cũ), không tạo bug trùng.
- **Module:** Payment; tác động tới Order. Shipping không có defect độc lập được xác nhận.
- **Environment:** Windows, JDK 21.0.12, Spring Boot 4.0.6, HTTP local + H2 MySQL mode; GHN mock, callback VNPay ký bằng test key. Không phải VNPay/MySQL thật.
- **Severity:** Medium đề xuất; **Priority:** Medium trên Jira.
- **Status:** Confirmed / Jira To Do; chưa sửa production.
- **Frequency:** 6/6 case FAIL tái hiện trong lần độc lập thứ hai; mỗi case 2/2 lần tính cả baseline. Hai case control total=0,01 PASS.
- **Test data:** price=50000, quantity=1, stockBefore=1000; promo FIXED=50000 hoặc 50000,01 (clamp), hoặc PERCENT=100; freeShipping=true; amount cuối=0. Promotion tạo HTTP 201 và active trong thời gian chạy.
- **Related cases:** BUY-lower-zero; CART-lower-zero; BUY-lower-minus-candidate-clamped; CART-lower-minus-candidate-clamped; BUY-percent-100; CART-percent-100.
- **Evidence mới:** [failure-reproduction.json](failure-reproduction.json) ghi phép tính lại và precondition từng case; [HTTP](retest/api-evidence.json); [DB before/after](retest/test-results.json); [Order/Payment](order-payment-reconciliation.json). Lọc case theo IDs trên.
- **Steps / Expected / Actual:** như phần mô tả trên; đã tái chạy với orderCode và promotionCode mới. Đúng total và paymentAmount đều 0 nhưng URL được cấp, IPN RspCode=04, Return không confirmed và DB PENDING. Không yêu cầu VNPay chấp nhận 0; yêu cầu thống nhất điều kiện tạo phiên thanh toán với luồng đơn miễn phí.

Baseline đã được push ở commit bdb1c13e19fdd68ba5476ac43b9ae9e9eb1d6ce3. Evidence mới của QLPT-294 nằm trong thư mục test-evidence/order-payment-summary của repository. Bug vẫn mở, task báo cáo có thể hoàn thành khi các blocked đã ghi rõ.
