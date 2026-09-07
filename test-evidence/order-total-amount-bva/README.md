# QLPT-293 — Kiểm thử BVA orders.total_amount

Ngày thực thi: 31/08/2026. Source baseline: `6fbc4c8005c4a2e0d6e17fbfc41e8815d4da57b4`.

Kết quả lần chạy cuối: **59 cases — 39 Pass, 6 Fail, 14 Blocked; 327 HTTP requests**. Bug xác nhận: [QLPT-341](https://hientm0978.atlassian.net/browse/QLPT-341).

## Tên tệp và bộ ảnh minh chứng

Thư mục `order-total-amount-bva` mô tả nội dung kiểm thử; tên tệp ngắn gọn theo chức năng như `test-cases.md`, `api-evidence.json`, `bug-report.md`. Không dùng mã Jira làm tiền tố tên tệp bàn giao. Mã QLPT-293 chỉ giữ trong nội dung để truy vết task. `README.md` là trang hướng dẫn; `file-name-map.json` ánh xạ tên cũ → tên mới. Tên class Java `OrderAmountBvaIT` giữ nguyên.

- [Mục lục ảnh](images/index.html) và [hướng dẫn bộ ảnh](images/README.md).
- Xem trực tiếp 5 ảnh PNG trong thư mục `images/`; không đóng gói ZIP.
- `image-index.json`: 5 ảnh chọn lọc, nội dung, nguồn dữ liệu và SHA256.
- `image-coverage.json`: phạm vi minh chứng của bộ ảnh gọn.

**Bộ bàn giao chỉ cần 5 ảnh:** tổng hợp kết quả; BVA hai luồng; đối chiếu Order–Payment; bug VNPay 0đ; Blocked/giới hạn. Đây là ảnh báo cáo xuất từ JSON/log đã lưu, không phải ảnh chụp trực tiếp Postman/browser/DB client. Ảnh không tạo ra lần thực thi mới và không biến các case Blocked thành đã kiểm thử. Mỗi ảnh đều ghi môi trường H2, GHN stub, callback giả lập. Payload đầy đủ giữ trong JSON và Postman Examples, không cần một ảnh cho mỗi request.

Tái tạo bằng `./export-selected-images.ps1`; script chỉ xuất 5 PNG và mục lục, không tạo file nén. Các file ZIP cũ đã được xóa, kể cả trong lưu trữ local. Bộ 554 ảnh cũ nằm tại `.local-archive/full-554-images/`, bị loại khỏi Git và không thuộc bộ nộp. JSON/log nguyên bản được giữ nguyên. Khi bàn giao, dùng 5 ảnh chọn lọc cùng test cases, collection/evidence và bug report.

Đã thiết kế và thực thi kiểm thử HTTP API trên backend Spring Boot thật với DB H2 cô lập. **Không phải kết quả chạy trên MySQL production, không phải thanh toán hoặc GHN thật.** Xem số lượng và trạng thái chính xác trong `execution-summary.json`; từng case có Expected / Actual / Pass / Fail / Blocked trong `test-cases.md` và `test-results.json`.

## Kết quả chính

- Cả hai luồng tạo Order lưu tổng tiền khớp Payment trong các case đã chạy, bao gồm tổng `0.01`, `0`, miễn ship, fallback 30.000 và giảm giá làm tròn.
- **Một lỗi tích hợp được xác nhận, tái hiện ở 6 case:** Order VNPAY tổng 0 được chấp nhận, Payment amount=0, create-url cấp URL `vnp_Amount=0`, nhưng IPN đúng chữ ký và đúng tiền trả `04`; Return không xác nhận, đơn vẫn PENDING. Lỗi là hai thành phần không thống nhất xử lý đơn 0, không phải tự đặt requirement “mọi đơn 0 đều không hợp lệ”.
- Với tổng dương, VNPay encode đúng `total × 100`, callback lệch ±0.01 bị từ chối, callback đúng tiền được xử lý, Return không tự thay đổi trạng thái trước IPN.
- Fault injection GHN fee=-50001 với giá=50000.99 cho tổng=-0.01 được lưu. Đây là **quan sát rủi ro có điều kiện** với stub bất thường, không phải chứng minh GHN thực trả số âm hay bug nghiệp vụ đã được đặc tả.
- MySQL bị chặn bởi credential local không hợp lệ. Biên trên System/API không khả thi với catalog bình thường; không tạo sản phẩm/đơn hàng hàng tỷ đồng. Các case này được ghi Blocked, không cộng vào Pass.

## Xác minh implementation trước khi chọn biên

| Nội dung | Source tại baseline | Kết luận |
|---|---|---|
| Order từ giỏ | `OrderServiceImpl.java:79–105` | Cộng unitPrice × quantity của selected cart items; total=subtotal−discount+shipping |
| Buy Now | `OrderServiceImpl.java:226–248` | Unit price lấy salePrice nếu khác null, nếu không lấy originalPrice; công thức total giống giỏ |
| Payment record | `OrderServiceImpl.java:172,300` | Dùng chính biến totalAmount vừa tính |
| Fixed discount | `OrderServiceImpl.java:569` | `min(promotion.value, subtotal)`; giảm quá tiền hàng bị chặn ở subtotal |
| Percent discount | `OrderServiceImpl.java:563–566` | `floor(subtotal × percent / 100)` đến **đồng nguyên**, không phải làm tròn HALF_UP |
| Giới hạn percent ở admin | `AdminPromotionServiceImpl.java:149–151` | Reject percent>100; request value tối thiểu 0.01 |
| Free shipping | `OrderServiceImpl.java:573–585` | freeShipping=true → shipping=0 trước khi xét địa chỉ/GHN |
| Shipping policy | `ShippingFeePolicy.java` | 30.000 nếu không phải HCM hoặc thiếu province/districtId/wardCode; nếu đủ điều kiện gọi GHN |
| GHN fee parsing | `GhnService.java:113–124` | Đọc `data.total` dạng int; trả fallback 30.000 khi lỗi |
| Tiền gửi VNPay | `VnpayServiceImpl.java:70` | `movePointRight(2).longValueExact()` |
| Tiền nhận qua IPN/Return | `VnpayServiceImpl.java:163–166` | Chỉ nhận amount dạng số nguyên dương sau scale /100 và bằng Order total |
| SePay | `SePayWebhookServiceImpl.java` | Chỉ tiền vào dương; nhận đủ hoặc dư tiền, không đổi Payment.amount thành số tiền dư |
| Lưu trữ | `database/schema.sql`, entities Order/Payment/OrderItem | DECIMAL(12,2); không có check tổng tiền >=0 trong source đã kiểm tra |

Đường dẫn Java tương đối với `backend/src/main/java/com/greenjuicehub/backend`; các service ở thư mục `service/.../impl/`. Báo cáo này không sửa production code và không coi Description/ảnh chụp là chỉ dẫn thao tác ngoài phạm vi người dùng yêu cầu.

## Miền và kỹ thuật chọn biên

**Không tìm thấy min/max nghiệp vụ riêng cho orders.total_amount.** Với fixture giá không âm, quantity=1, promotion hợp lệ và ship không âm, tổng 0 có thể đạt được. Tuy nhiên không suy ra 0 hợp lệ cho tất cả phương thức thanh toán: VNPay đang không nhất quán tại điểm này.

Độ chia nhỏ nhất đã xác minh xuyên suốt Order → DB H2 → Payment → encoding và callback backend là **δ=0.01**. Đây là độ chia lưu trữ và đường xử lý backend đã kiểm chứng, không phải tuyên bố rằng cổng VNPay thật cho phép thanh toán 0.01 VND. Không có test chấp nhận của nhà cung cấp.

Giữ S=50.000, quantity=1, miễn ship; thay fixed promo:

| Promo value | Tổng chưa clamp | Discount thực tế | Total thực tế | Phân loại |
|---|---:|---:|---:|---|
| 49.999,99 | 0,01 | 49.999,99 | 0,01 | Ngay trên candidate 0 |
| 50.000,00 | 0 | 50.000,00 | 0 | Candidate 0 |
| 50.000,01 | -0,01 | 50.000,00 | 0 | Robustness ngay dưới; không giả mạo total=-0.01 |

Lặp cả BUY và CART. Lặp promo sát/bằng/vượt subtotal với ship 30.000 để kiểm chứng tổng 30.000,01 / 30.000 / 30.000. Với PERCENT=10%, thử subtotal 50.009,99 / 50.010,00 / 50.010,01 quanh điểm FLOOR nhảy từ discount 5.000 lên 5.001. PERCENT=100% và miễn ship tạo total=0; PERCENT=100.01 bị admin API chặn.

DECIMAL(12,2) có 10 chữ số nguyên: giới hạn dương **9.999.999.999,99**, ba giá trị kỹ thuật **9.999.999.999,98 / 9.999.999.999,99 / 10.000.000.000,00**. Kiểu signed còn có miền âm; đây không phải miền nghiệp vụ. Không gửi totalAmount này từ client rồi coi đó là BVA lưu trữ, vì DTO không nhận trường tổng tiền.

## Phạm vi và giới hạn evidence

- HTTP thật qua embedded server random port trên 127.0.0.1; controller, DTO validation, Spring Security JWT filter, service, repository và transaction thật.
- Account CUSTOMER/ADMIN test được seed; JWT phát bởi JwtUtil. Không kiểm thử login/OTP/Redis; TokenBlacklistService được mock. Token không ghi vào evidence.
- Product variant/stock/address được seed riêng trong test DB; promotion được tạo **qua admin HTTP API**, nên case percent>100 không bypass validation. Mỗi case dùng variant riêng với 1.000 tồn kho; không thay giá variant của case khác.
- `before` ghi count orders/payments và stock; `dbAfterCreate` và `dbAfterCallback` ghi các trường tiền và trạng thái đọc lại từ DB. `items_subtotal` là SUM từ bảng order_items, không phải copy response.
- H2 dùng schema Hibernate generate; chỉ đổi cột shipping_address từ JSON thành varchar trong fixture vì mapping JSON của H2 khác MySQL. Không đổi bất kỳ cột tiền nào. Việc này **không kiểm chứng JSON/schema MySQL**.
- GHN stub=19.000 với HCM có mã địa chỉ. Fallback thiếu mã địa chỉ và freeShipping chạy logic thật, không mock OrderService. Các endpoint ShippingController được kiểm tra forwarding với geography stub; live integration Blocked.
- VNPay dùng test key riêng và URL loopback không mở. HMAC SHA512 được tạo độc lập trong test; không gọi VNPay hoặc tạo giao dịch tiền thật. SePay cũng chỉ gọi webhook backend bằng test key.
- Ca robustness ship âm là characterization; Pass nghĩa thu được hành vi dự kiến để đánh giá rủi ro, **không nghĩa tổng âm là đúng nghiệp vụ**.
- Các ca quantity=-1/0, cart rỗng, client tampering, SePay ±0.01 là bổ sung; không dùng chúng thay thế BVA total_amount.

## Deliverables

| File | Nội dung |
|---|---|
| `test-cases.md` | Test cases, dữ liệu từng biên, các bước HTTP, expected/actual/status và DB evidence |
| `test-results.json` | Kết quả máy đọc được, bao gồm các case Blocked |
| `test-data.json` | Dữ liệu và expected values cho 26 ca chính trên hai flow |
| `zero-boundary-evidence.json` | Request/response và DB trước/sau callback của các ca 0/0.01 |
| `api-evidence.json` | Request body/path, thời gian, HTTP status, response body của từng lệnh |
| `assertion-results.json` | Từng assertion, expected/actual, Pass/Fail |
| `order-payment-reconciliation.json` | Đối chiếu Order.total_amount và Payment.amount của 26 ca chính |
| `test-environment.json` | Môi trường thực chạy; không chứa credential thật |
| `mysql-access-blocked.log` | Lỗi MySQL access denied quan sát khi khởi tạo test |
| `test-run.log` | Maven run cuối; strict mode fail vì phát hiện lỗi sản phẩm, không phải lỗi khởi động |
| `bug-report.md` | Lỗi xác nhận và quan sát có điều kiện, cách tái hiện |
| `execution-report.html` | Bảng tổng hợp dễ đọc |
| `source-hashes.json` | SHA256 source và artifacts để truy vết |
| `../../postman/Order-Total-Amount-BVA-Evidence.postman_collection.json` | Lưu **Examples thực tế** từ HTTP evidence, không tuyên bố đã chạy Postman/Newman |
| `../../backend/src/test/java/com/greenjuicehub/backend/e2e/OrderAmountBvaIT.java` | Bộ chạy tái lập độc lập, tạo fixture mới |

Collection Postman cũ đã được thay vì chủ yếu thử quantity và tự giả định total>0. Collection mới là **evidence archive**: import, mở folder từng case và xem saved Examples. Replay được skip có chủ ý: cart IDs đã tiêu thụ và chữ ký callback gắn với order code từng lần chạy. Dùng bộ chạy Java để tái lập, không bật replay trên production.

## Tái lập

Từ `E:\KCPM\KTPM\backend`, Java 21:

```powershell
$env:JAVA_HOME='C:\Program Files\Java\jdk-21.0.12'
.\mvnw.cmd '-Dmaven.repo.local=E:\KCPM\KTPM\.m2\repository' '-Dtest=OrderAmountBvaIT' '-Dbva.database=h2' '-Dbva.failOnFindings=true' test
```

Strict mode cố ý trả Maven failure nếu checks có lỗi sau khi đã lưu toàn bộ evidence. Không bật `bva.failOnFindings` thì Maven chỉ phản ánh việc bộ chạy hoàn tất, **không đồng nghĩa mọi case Pass**. File authoritative là test-results.json/assertion-results.json.

Chạy lại trên MySQL khi đã cấu hình đúng credential local trong backend/.env (hoặc datasource password trong application-local.yml): bỏ `-Dbva.database=h2`. Bộ chạy chỉ cho phép host localhost/127.0.0.1:3306, tạo schema tên `qlpt293_bva_<random>` mới, import repository schema bỏ CREATE DATABASE/USE gốc. Không sửa schema green_juice_hub. Schema test được giữ lại để kiểm tra, không tự drop. Tài khoản cần quyền tạo schema. Chế độ MySQL chưa được thực thi thành công trong báo cáo hiện tại.

Sau mỗi lần chạy:

```powershell
Set-Location E:\KCPM\KTPM
.\test-evidence\order-total-amount-bva\build-report.ps1
```

## Điều kiện chưa kiểm chứng

1. 6 ca biên trên System/API (3 giá trị × 2 flow): không dựng giá/tồn kho phi thực tế.
2. 6 ca kỹ thuật MySQL: credentials của dự án bị từ chối, nên chưa xác minh SQL mode/truncation/overflow hay round-trip trên MySQL. Không dùng H2 thay bằng chứng này.
3. GHN thật và VNPay thật: 2 integration cases Blocked; cần môi trường sandbox/credential/địa chỉ được phép kiểm thử.

Kết thúc công việc thiết kế/thực thi và ghi nhận kết quả không phải xác nhận bản phát hành đạt chất lượng hoặc mọi case đã Pass. Lỗi sản phẩm vẫn mở để sửa; không sửa nghiệp vụ ngoài task kiểm thử. Task cha QLPT-283 và task tổng hợp QLPT-294 không được tự động đóng.
