# Minh chứng SonarQube Auth/User/Address

Phạm vi gồm ba controller làm đầu mối cùng toàn bộ luồng JWT, mật khẩu, OTP,
Redis, ownership User/Address và phần frontend liên quan. Phân tích chạy bằng
SonarQube Community Build `26.8.0.126808` và SonarScanner CLI `8.0.1.6346`.

## Kết quả baseline và final

| Chỉ số | Baseline `develop` | Final `SonarQube/AuthController` |
|---|---:|---:|
| Issue còn mở | 88 | 69 |
| Blocker còn mở | 1 | 0 |
| Critical còn mở | 4 | 0 |
| Security Hotspot | 0 | 0 |
| Coverage trong scope | 25,7% | 31,2% |
| Violation mới còn mở | Không áp dụng | 0 |

Năm issue Blocker/Critical của baseline gồm `java:S6437`, `java:S4502`,
`java:S2119`, `java:S1192` và `javascript:S3776`. Bốn issue đã được sửa trong
code. `java:S4502` được giữ lại để review, ghi comment threat model trên
SonarQube và chuyển sang `ACCEPTED`; snapshot final vẫn xuất issue này trong
`acceptedIssues` để có thể kiểm toán.

Lượt quét sau thay đổi đầu tiên phát hiện thêm 6 violation mới mức Major/Minor;
tất cả đã được sửa trước snapshot final.

Quality Gate final vẫn là `ERROR` chỉ vì coverage code mới là `38,3%`, thấp
hơn ngưỡng `80%`. Hai điều kiện còn lại đều đạt: duplicated lines mới
`0,76923%` và violation mới `0`. Frontend hiện chưa có test runner sinh LCOV,
vì vậy không hạ Quality Gate và không khai báo coverage giả.

## Xác minh build và test

- Backend `clean verify`: 279 test, 0 failure, 0 error, 3 skipped; JAR và báo
  cáo JaCoCo được sinh thành công.
- Frontend production build: PASS.
- ESLint cho 11 file logic auth/token/password/location cốt lõi: PASS.
- `npm run lint` toàn frontend vẫn có 150 vấn đề tồn tại trên nhiều module
  ngoài scope (baseline `develop` đã có 155); không tuyên bố full-repo lint
  đã sạch.
- SonarScanner và Compute Engine: SUCCESS; token phân tích tạm thời đã bị thu
  hồi sau mỗi lượt chạy.

## Tệp minh chứng

- `baseline.json`: snapshot từ detached worktree đúng commit `develop` trước
  khi sửa.
- `final.json`: snapshot cuối sau khi build/test và Sonar background task hoàn
  tất; chứa cả issue còn mở lẫn issue đã `ACCEPTED`.
- `security-review.md`: quyết định xử lý, threat model và rủi ro còn lại.

Không tệp nào trong thư mục này lưu Sonar token, credential ứng dụng hoặc
Authorization header.
