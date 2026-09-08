# Security review Auth/User/Address

- Ngày review: 2026-09-08
- Nhánh: `SonarQube/AuthController`
- Project SonarQube: `green-juice-hub-auth-user-address`

## Quyết định và thay đổi chính

| Khu vực | Kết quả review |
|---|---|
| Secret cấu hình | Bỏ credential hard-code khỏi `application-local.yml`, thay bằng biến môi trường. Issue Blocker `java:S6437` đã đóng. |
| JWT phát hành | Bắt buộc secret tối thiểu 32 ký tự, TTL dương, dùng UTF-8 và thêm `jti` ngẫu nhiên để token phát hành cùng giây không bị trùng. |
| Bearer token | Refresh/logout kiểm tra header đầy đủ trước khi tách; filter chỉ nhận access token đúng loại và trả 401 với token malformed/blacklisted. |
| Refresh/logout | Refresh token được rotate và consume atomically bằng Redis `SET NX + TTL`, chặn replay đồng thời. Logout verify refresh token, đối chiếu user của access token và blacklist theo thời gian sống còn lại. |
| Token trong Redis | Redis key chỉ chứa SHA-256 fingerprint, không lưu raw JWT hoặc raw temporary token trong key. Temporary token có purpose và được consume bằng `getAndDelete`. |
| OTP | Dùng `SecureRandom`, mã không còn xuất hiện trong response/stdout, verify được consume bằng conditional update để chống replay. Input phone/OTP được giới hạn đúng định dạng. |
| Mật khẩu | Backend và frontend dùng chung policy tối thiểu 8 ký tự, tối đa 72 byte UTF-8 theo giới hạn BCrypt. DTO password không dùng `@Data` để tránh sinh `toString`; change/reset từ chối reuse và có rate limit cho mật khẩu cũ sai. |
| Google/Captcha | Chỉ nhận Google identity có email verified; secret reCAPTCHA được gửi trong form body thay vì query string. |
| Address ownership | Read/update/delete/set-default đều tra theo `addressId + userId`; test âm xác nhận user không sửa/xóa/đặt mặc định address của user khác. |
| Frontend auth | Sửa endpoint refresh, đồng bộ refresh-token rotation, gom request 401 đồng thời, chỉ cold-retry method idempotent, chờ auth bootstrap ở route guard và xóa temp token khỏi browser history sau điều hướng. |
| Browser hardening | Thêm CSP, Referrer-Policy, X-Content-Type-Options và Permissions-Policy trên Vercel. |

## Review CSRF `java:S4502`

Issue `46d81c97-aa40-415c-9630-181b79832871` được chuyển sang `ACCEPTED`, không
phải `false positive` và không bị ẩn bằng `NOSONAR`.

Threat model hiện tại:

- API dùng `SessionCreationPolicy.STATELESS`.
- Xác thực chỉ đi qua header `Authorization: Bearer ...`; không có auth cookie
  được trình duyệt tự gửi.
- CORS frontend dùng allowlist origin và `allowCredentials(false)`.
- Vì cross-site request không thể tự mang Bearer token, tắt CSRF là quyết định
  phù hợp với kiến trúc hiện tại.

Phải mở lại quyết định này và bật CSRF trước khi thêm session/cookie xác thực,
refresh cookie HttpOnly hoặc credentialed CORS.

## Rủi ro và việc vận hành còn lại

1. **Xử lý ngay:** credential từng tồn tại trong file tracked phải được
   rotate/revoke ở từng nhà cung cấp và xóa khỏi lịch sử Git. Thay file hiện
   tại bằng biến môi trường không làm secret cũ trong history mất hiệu lực.
2. **OTP delivery:** repository chưa có SMS provider. Việc ngừng trả/log OTP
   đóng lỗ hổng bypass nhưng production phải tích hợp kênh gửi out-of-band
   trước khi bật login/register/reset bằng OTP.
3. **Web Storage:** access và refresh token vẫn nằm trong `localStorage`, nên
   XSS trên cùng origin có thể đọc token. Hướng khắc phục đầy đủ là refresh
   cookie `HttpOnly; Secure; SameSite` cùng thiết kế lại CORS/CSRF/refresh/logout.
4. **Thu hồi toàn phiên:** đổi/reset mật khẩu, khóa user hoặc đổi role chưa
   revoke mọi JWT đã phát hành; access token cũ có thể sống đến hết TTL. Cần
   token/session version hoặc `revoked-before` theo user trong một task kiến
   trúc riêng.
5. **OTP send rate race:** cooldown và daily quota hiện dùng check-then-save;
   request gửi đồng thời có thể vượt quota khi SMS provider được tích hợp. Cần
   counter/lock atomic trước khi phát hành thật.
6. **Coverage/lint nền:** frontend chưa có LCOV; full frontend lint vẫn hỏng từ
   baseline ở nhiều module ngoài Auth/User/Address. Các giới hạn này được báo
   cáo, không bị che bằng việc hạ rule hoặc quality threshold.
