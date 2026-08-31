# Test Summary — Order & Payment

Task: [QLPT-294](https://hientm0978.atlassian.net/browse/QLPT-294). Tổng hợp và tái kiểm thử từ QLPT-293, ngày 31/08/2026. Hoàn thành hồ sơ kiểm thử, **không có nghĩa sản phẩm hết lỗi hoặc đã kiểm thử gateway thật**.

| Chỉ số | Kết quả |
|---|---:|
| Tổng case | 59 |
| PASS | 39 |
| FAIL | 6 |
| BLOCKED | 14 |
| NOT RUN | 0 |
| Pass Rate trên case đã chạy | 39/45 = 86,67% |
| PASS trên toàn bộ kế hoạch | 39/59 = 66,10% |
| Execution Coverage | 45/59 = 76,27% |
| HTTP requests / assertions lần chạy lại | 327 / 1.035 |
| Assertions thất bại | 12, thuộc 6 case |
| Bug xác nhận | 1: QLPT-341 |
| Bug phân loại chính Order / Payment / Shipping | 0 / 1 / 0 |
| Bug Payment có ảnh hưởng Order | 1, không cộng trùng vào tổng bug |
| Severity / Priority | Medium đề xuất / Medium trên Jira |

## Hồ sơ bàn giao

- [Bảng kết quả 59 case](result-table.md).
- [Formal Test Cases: tiền điều kiện, steps, data, expected, actual, status, evidence](test-execution-results.md); [bản JSON](formal-test-cases.json).
- [Xác minh và tái tạo từng FAIL](failure-reproduction.json).
- [Bug report duy nhất: VNPay đơn 0đ](bug-report-vnpay-zero-total.md).
- [Đối chiếu Order/Payment](order-payment-reconciliation.json): 38 order, 64 snapshot trước/sau callback; tất cả khớp tiền. Có cả COD và các case robustness, không chỉ online.
- [HTTP requests/responses thật của lần chạy lại](retest/api-evidence.json), [kết quả và DB snapshots](retest/test-results.json), [assertions](retest/assertion-results.json), [môi trường](retest/test-environment.json), [kết quả runner](retest/runner-result.txt).
- [5 ảnh chọn lọc có sẵn](../order-total-amount-bva/images/index.html). Đây là ảnh báo cáo từ evidence lần QLPT-293, không phải screenshot lần chạy mới hay Postman. Không tạo thêm ảnh/ZIP.

## Phương pháp và phạm vi xác nhận

Spring Boot 4.0.6, JDK 21.0.12, Windows; HTTP thật qua Java HttpClient đến server local cổng ngẫu nhiên. DB H2 MySQL mode cô lập, schema JPA; riêng shipping_address đổi sang varchar để tương thích H2, không thay cột tiền. GHN/blacklist mock; IPN/Return và SePay giả lập với test key. Không thực hiện thanh toán hay giao vận thật. Collection Postman của QLPT-293 lưu request/response examples, không được trình bày là một lần chạy Postman/Newman.

Source production không sửa. Baseline evidence đã push tại commit `bdb1c13e19fdd68ba5476ac43b9ae9e9eb1d6ce3`. Test runner chỉ bổ sung bva.output để tách evidence và sửa câu mô tả blocked. Hash source và artifact hiện tại trong [manifest](evidence-manifest.json).

Source xác nhận: subtotal là tổng giá salePrice (nếu có, nếu không originalPrice) nhân quantity; total = subtotal − discount + shipping. FIXED bị giới hạn bằng subtotal; PERCENT làm tròn xuống đơn vị nguyên. Free shipping đặt phí bằng 0; phí fallback 30.000 và phí GHN stub 19.000 được phản ánh đúng ở các case đã chạy. δ=0,01 đã được quan sát ở backend/H2 và URL encoding, chưa chứng minh gateway thật chấp nhận phần lẻ VND. Không đặt business min/max mới.

## Phân tích FAIL và rủi ro

Sáu case FAIL đã chạy lại trên DB in-memory mới: hai flow BUY/CART × FIXED bằng subtotal, FIXED vượt subtotal rồi bị clamp, PERCENT 100. Kiểm tra stock, quantity, giá, promotion được tạo HTTP 201, thời gian hiệu lực và freeShipping; tính độc lập lại tổng bằng 0. Mỗi case tái hiện 2/2 lần tính cả baseline; lần tái kiểm thử 6/6. Đối chứng 0,01 vẫn PASS trên cả hai flow. Một defect QLPT-341, không tạo sáu bug trùng nhau.

Expected của lỗi là nhất quán contract Order/Payment: không cấp phiên thanh toán mà backend không thể hoàn tất với chính số tiền đã cấp. Nghiệp vụ cần quyết định từ chối online 0đ sớm hay xử lý đơn miễn phí. Không đề nghị bỏ validation số tiền dương tại callback.

Case GHN fault injection -50.001 với giá 50.000,99 tạo total -0,01 là PASS characterization: đã quan sát lưu giá trị âm khi giả lập carrier bất thường. Đây là rủi ro có điều kiện, chưa tính thành defect nghiệp vụ vì chưa có policy min hoặc evidence GHN thật trả phí âm.

## Các giới hạn còn BLOCKED

| Nhóm | Số case | Lý do / điều kiện mở chặn |
|---|---:|---|
| Biên trên System/API | 6 | Chưa có catalog/stock hợp lý tạo tổng 9.999.999.999,98; 9.999.999.999,99; 10.000.000.000,00 cho BUY/CART. Cần fixture được phép trên môi trường riêng. |
| MySQL DECIMAL | 6 | Thiếu credential hợp lệ; lần QLPT-293 đã ghi Access denied. Cần quyền DB test; H2 không thay thế probe MySQL. |
| LIVE-GHN | 1 | Cần cấu hình và địa chỉ GHN hợp lệ để xác nhận carrier thật. |
| LIVE-VNPAY | 1 | Cần sandbox gateway và callback end-to-end; hiện chỉ callback local ký đúng. |

Câu “Separate MySQL DECIMAL probes executed” trong raw baseline của upper cases là lỗi mô tả evidence; probe MySQL thực tế BLOCKED. Báo cáo này và runner đã sửa nghĩa, không chỉnh sửa raw baseline. Câu MySQL login rejected trong environment lần retest dẫn lại trở ngại đã ghi ở baseline, không phải lần thử đăng nhập MySQL mới.

## Definition of Done

59/59 case có formal fields và trạng thái; 14 BLOCKED có lý do. 6/6 FAIL tái tạo, phân tích và liên kết QLPT-341. Bug có báo cáo riêng, evidence và frequency. Đã có bảng tổng hợp, đối chiếu toàn bộ order/payment quan sát được và chỉ rõ giới hạn. Defect vẫn mở để nhóm sửa; không sửa production code trong task báo cáo này.

Tái chạy từ backend với Java 21:

```powershell
.\mvnw.cmd '-Dmaven.repo.local=E:\KCPM\KTPM\.m2\repository' '-Dtest=OrderAmountBvaIT' '-Dbva.database=h2' '-Dbva.output=../test-evidence/order-payment-summary/retest' '-Dbva.failOnFindings=true' test
```

Runner trả exit 1 do strict assertion ghi nhận 12 failed checks của defect đã biết; không gọi đây là build PASS. 1 JUnit experiment bao gồm 59 case, không phải 59 JUnit methods. Khi cần giữ lịch sử, đổi bva.output sang thư mục mới. Chạy `build-summary.ps1` để kiểm tra và dựng lại báo cáo; script dừng nếu kết quả khác baseline, phải rà soát lại thay vì tự động coi thay đổi là thành công.
