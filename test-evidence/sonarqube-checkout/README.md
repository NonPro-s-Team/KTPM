# Kết quả rà soát checkout

Ngày thực hiện: 31/08/2026. Phạm vi Order/Payment/Shipping/Webhook, đáp ứng
tiêu chí 0 Blocker/Critical của QLPT-268. Không tự cập nhật trạng thái Jira.

## Kết quả SonarQube thực tế

| Chỉ số | Trước sửa | Sau sửa |
|---|---:|---:|
| Blocker (legacy severity) | 0 | **0** |
| Critical (legacy severity) | 9 | **0** |
| Open issues | 41 | 20 |
| Bugs (legacy type) | 0 | 0 |
| Vulnerabilities (legacy type) | 0 | 0 |
| Security Hotspots | 0 | 0 |
| Coverage toàn bộ mã trong phạm vi | 43,8% | 49,8% |
| Quality Gate | OK, chưa có điều kiện new code | **OK / Passed** |

Lượt cuối: new coverage **83,1%** (yêu cầu ≥80%), new duplication **0%**
(≤3%), new issues **0**. Profile Java Sonar way có **571 active rules**;
profile/rule update timestamp giống baseline. Không tắt rule, giảm severity,
đánh dấu accepted/false positive hay thu hẹp phạm vi sau baseline.

9 Critical đã sửa bằng code: 4 trường hợp generic wildcard return type
(S1452), 1 hàm đặt hàng có độ phức tạp cao (S3776), 4 trường hợp lặp string
literal (S1192). Danh tính, file, dòng và rule ban đầu có trong `baseline.json`.
20 cảnh báo còn lại: 11 Major, 5 Minor, 4 Info; không thuộc mục tiêu
Blocker/Critical. Danh sách đầy đủ nằm trong `final.json`.

Giao diện MQR hiển thị impact Blocker/High thay cho phân loại truyền thống.
Ảnh `issue-severities.png` hiển thị Blocker 0, High 0, Medium 11, Low 5,
Info 4. Chỉ tiêu Critical được kiểm tra riêng bằng API trong `final.json`.
Một issue có thể ảnh hưởng nhiều software qualities: 4 Reliability trên UI
là cảnh báo Info timezone, không phải 4 legacy Bugs.

## Rà soát thủ công và regression test

Những vấn đề dưới đây phát hiện qua đọc code và test, **không phải** các
Security Hotspot/Bug mà SonarQube đã báo:

| Rủi ro | Xử lý | Kiểm thử tiêu biểu |
|---|---|---|
| API key SePay không cấu hình hoặc khác hoa/thường vẫn được chấp nhận; log chứa Authorization | Fail closed, so sánh key chính xác bằng MessageDigest.isEqual, log lỗi xác thực không chứa header | missingServerKeyFailsClosed, apiKeyIsCaseSensitive |
| VNPay browser return tự cập nhật PAID và đọc đơn khi chữ ký sai | Return chỉ đọc; chữ ký sai không truy vấn DB; trả confirmed riêng | browserReturnCannotMarkOrderPaid, forgedReturnDoesNotExposeOrderIdOrQueryDatabase |
| Callback sai tiền, sai phương thức, sai merchant hoặc đơn hủy | Xác minh chữ ký/merchant/số tiền/trạng thái/phương thức trước ghi dữ liệu; kiểm tra cả TransactionStatus | malformedSignedAmountIsRejectedWithoutException, signedCallbackCannotPayCodOrder, cancelledOrderCannotBecomePaid, wrongMerchantCannotTouchDatabaseEvenWithValidHash |
| Callback lặp hoặc đến đồng thời | Giữ kiểm tra trạng thái, khóa pessimistic đơn trong transaction IPN/SePay | paidReplayStillRejectsWrongAmount, các test callback lặp; chưa thử race trên MySQL thật |
| SePay thiếu số tiền hoặc đơn đã hủy | Bean Validation và kiểm tra ở service trước cập nhật | missingAmountIsBadRequest, malformedAmountIsIgnoredBeforeDatabaseAccess, cancelledOrderCannotBeMarkedPaidByWebhook |
| Dùng addressId của người khác để tính phí ship | Kiểm tra chủ sở hữu trước cả phí fallback | foreignAddressIsRejectedEvenBeforeLegacyFeeFallback |
| Payload tạo URL/phí ship thiếu hoặc âm | DTO validation trước đọc DB | missingOrderIdIsBadRequest, negativeQuantityIsRejectedBeforeReadingAddress |
| Request tạo vận đơn ghi toàn bộ thông tin người nhận vào log | Bỏ log request/response body của createShippingOrder | Rà soát code; không tuyên bố đã kiểm tra mọi đường log lỗi GHN |

Test trước sửa: subset 21 tests, 9 failures + 1 error, thể hiện lỗi tái hiện
được. Sau sửa và bổ sung: **123 tests, 120 passed, 0 failures, 0 errors,
3 skipped**. Ba skipped có sẵn thuộc cart/product/promotion, không thêm skip
để tránh lỗi. 20 test được bổ sung so với bộ 103 test trước đợt này.

## Các tệp để nộp minh chứng

- `quality-gate.png`: ảnh trực tiếp SonarQube với Quality Gate Passed.
- `new-code-metrics.png`: ảnh trực tiếp chỉ số new code/coverage/hotspot.
- `issue-severities.png`: ảnh trực tiếp danh sách issue và mức độ.
- `review-summary.png`: ảnh cửa sổ tổng hợp từ API JSON + kết quả Surefire;
  đây **không phải** ảnh giao diện SonarQube.
- `baseline.json`, `final.json`: snapshot API, có analysis ID, thời điểm,
  profile và toàn bộ open issues.
- `test-run.txt`: trích dòng tổng kết từ log Maven thực tế, bỏ application
  log và dữ liệu nhạy cảm.
- `test-results.json`: tên/trạng thái từng testcase từ Surefire XML.
- `regression-before.txt`: tổng kết lượt tái hiện lỗi trước sửa.
- `source-manifest.json`: SHA-256 các file Java mới/sửa tại thời điểm quét.

## Giới hạn và lưu ý triển khai

Scan chạy trên working tree chưa commit, dựa trên HEAD `58e80a6`. Do đó
analysis revision vẫn là commit cũ; `source-manifest.json` nhận diện bản sửa
đã kiểm thử. Cảnh báo “Missing blame information for 15 files” phản ánh các
file chưa commit, không phải lỗi phân tích. Sau commit có thể quét lại để
cập nhật SCM blame và revision.

Chỉ quét scope khai báo trong `quality/sonarqube/scan.ps1`, không phải cả
repository. Community Build giới hạn phân tích injection; 0 hotspot/bug
không chứng minh không còn lỗ hổng. Chưa chạy thanh toán thật, sandbox IPN
từ nhà cung cấp, GHN thật hoặc kiểm thử đồng thời trên MySQL.

**VNPay Return URL không còn tự ghi PAID: phải cấu hình IPN hợp lệ, truy cập
được từ VNPay.** Frontend có thể dùng trường `confirmed` để hiển thị chờ
xác nhận. Callback cho đơn bị hủy cần đối soát/hoàn tiền riêng, không tự
khôi phục đơn hoặc hoàn tiền trong bản sửa này.

Hướng dẫn chạy lại và nguồn tài liệu: `quality/sonarqube/README.md`.
Không có JIRA-COMMENT.md, ZIP hoặc thông tin đăng nhập trong bộ minh chứng.
