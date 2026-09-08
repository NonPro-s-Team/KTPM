# SonarQube cho Auth, User và Address

Bộ cấu hình này quét riêng luồng Auth/User/Address trên cả backend và
frontend. Nó không thay đổi scope Checkout tại `quality/sonarqube`.

## Chạy phân tích

Yêu cầu Docker Desktop, JDK 21, Node.js và một analysis token local trong
biến môi trường `SONAR_TOKEN`. Script dùng image SonarScanner CLI chính thức;
không cần cài scanner toàn máy.

```powershell
docker compose -p greenjuice-quality -f quality/sonarqube/compose.yml up -d
./quality/sonarqube-auth/scan.ps1 -Label baseline
./quality/sonarqube-auth/scan.ps1 -Label final
```

Script build/test backend, thu thập classpath Maven cho Java analyzer, build
frontend, quét BE+FE từ repository root, đợi Compute Engine xử lý xong rồi xuất snapshot API vào
`test-evidence/sonarqube-auth-user-address`. Token không được ghi vào source
hoặc ảnh minh chứng.

## Phạm vi và tiêu chí

- Ba controller chỉ là entry point; scope còn gồm JWT filter/util, Security,
  CORS, Redis, auth/user/address service, DTO/entity/repository/mapper liên
  quan và cấu hình runtime.
- Frontend gồm API/interceptor/store, trang Auth, route guard, profile và UI
  địa chỉ.
- Không khai báo LCOV vì frontend hiện chưa có test runner sinh coverage.
- Không hạ severity, tắt rule, dùng `NOSONAR` hoặc đánh dấu false positive để
  làm đẹp kết quả.
- Mục tiêu: 0 Blocker/Critical còn mở và review đầy đủ Security Hotspot theo
  ngữ cảnh kiến trúc.

CSRF bị tắt là một điểm security-sensitive cần review (bản SonarQube hiện tại
phân loại `java:S4502` là vulnerability thay vì Hotspot), không tự động là lỗi:
API hiện stateless và nhận bearer token qua header, không xác thực bằng cookie.
Quyết định `ACCEPTED` và threat model được lưu trong snapshot/báo cáo, không
đánh dấu false positive.
Việc giữ token trong Web Storage vẫn là rủi ro XSS đã biết; chuyển refresh
token sang cookie HttpOnly/Secure/SameSite cần một thay đổi kiến trúc riêng
bao gồm CORS, CSRF, HTTPS, refresh và logout.
