# Báo cáo kiểm thử QLPT-234

## Phạm vi và môi trường

- Backend: `http://localhost:8081`
- Thời điểm chạy: 2026-08-22 14:34 (UTC+7)
- Phạm vi: 20 endpoint Auth, User và Address
- Kết quả tự động: 44 request, 60 assertion; 53 đạt, 7 không đạt
- Collection: `GreenJuiceHub-QLPT-234-235.postman_collection.json`
- Environment: `GreenJuiceHub-Local.postman_environment.json`

## Sai lệch được ghi nhận

### 1. Đăng nhập bằng số điện thoại sai độ dài trả 404 thay vì 400

Các test case: `PHONE-LOGIN-001`, `PHONE-LOGIN-014`, `PHONE-LOGIN-015`, `PHONE-LOGIN-016`.

- Input: chuỗi số có độ dài lần lượt 1, 14, 15 và 16 ký tự.
- Mong đợi: `400 Bad Request` do dữ liệu không đúng định dạng/độ dài số điện thoại.
- Thực tế: `404 Not Found`, message `Tài khoản không tồn tại`.
- Nhận xét: endpoint login đang tra cứu tài khoản trước khi từ chối identifier dạng số không hợp lệ.

### 2. OTP dài 5 hoặc 7 ký tự không trả message validation độ dài

Các test case: `OTP-LEN-005`, `OTP-LEN-007`.

- Mong đợi: `400 Bad Request` và message nêu rõ OTP phải có 6 ký tự.
- Thực tế: status là `400`, nhưng message là `OTP không đúng, còn 2 lần thử`.
- Nhận xét: OTP sai độ dài vẫn đi vào bước so khớp OTP và làm giảm số lần thử, thay vì bị chặn ở validation đầu vào.

### 3. Refresh token vẫn dùng được sau logout

Test case: `AUTH-LOGOUT-003`.

- `AUTH-LOGOUT-001`: logout bằng access token trả `200 OK`.
- `AUTH-LOGOUT-002`: access token cũ bị chặn đúng với `401 Unauthorized`.
- Mong đợi tiếp theo: refresh token thuộc cùng phiên bị thu hồi và `/api/auth/refresh` trả `401 Unauthorized`.
- Thực tế: refresh token cũ vẫn trả `200 OK` và cấp một cặp token mới.
- Kết luận: blacklist access token hoạt động, nhưng logout chưa thu hồi refresh token của phiên.

## Các nhóm đã đạt

- Check account, login bằng password và refresh token hợp lệ.
- Boundary số điện thoại ở luồng check-account: độ dài 0, 1, 14, 15, 16.
- OTP sai 6 ký tự trả lỗi phù hợp.
- Sai mật khẩu liên tiếp: lần 1-4 trả 401, lần 5 yêu cầu CAPTCHA, lần sau bị chặn nếu thiếu CAPTCHA.
- Đọc/cập nhật profile và validation email/password.
- Address: list, create, detail, update, set default, xác minh chỉ một địa chỉ mặc định, delete và kiểm tra sau xóa.
- Chặn access token dùng như refresh token, refresh token dùng như access token, và refresh token sai định dạng.
- Access token cũ bị từ chối sau logout.

## Trường hợp cần chạy thủ công

Các request `MANUAL-*` được skip mặc định vì cần credential thật hoặc phải chờ theo thời gian:

- OTP hợp lệ ngay trước và ngay sau mốc hết hạn 5 phút.
- Login bằng OTP, set/reset password bằng temp token.
- Google login bằng ID token thật.
- Refresh token đã hết hạn.

Đây là các ca chưa được tính vào 60 assertion tự động ở trên.
