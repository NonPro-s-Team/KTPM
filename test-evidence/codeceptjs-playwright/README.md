# CodeceptJS + Playwright evidence

Minh chứng QLPT-267, chạy local ngày 31/08/2026 (Asia/Saigon).

- Cài lại dependency bằng `npm ci` thành công, có package-lock.json.
- `npm test`: **4 PASS, 0 FAIL, 0 SKIP**, exit code 0; thời gian suite khoảng 6.4 giây.
- CodeceptJS 3.7.5, Playwright 1.55.0, Chromium 140.0.7339.16, Node 24.19.0, Windows.
- Runner tự mở/dừng Vite; không còn listener ở port 4173 sau khi kết thúc.
- Đã kiểm tra runner từ chối URL ngoài localhost và từ chối checkout thiếu token với exit code khác 0.

## Các file

- `test-run.txt`: console thật của lần chạy npm test, không viết lại kết quả.
- `junit.xml`: report trực tiếp từ mocha-junit-reporter.
- `login-form.png`: form đăng nhập.
- `login-validation.png`: validation khi không nhập số điện thoại.
- `checkout-login-required.png`: khách chưa đăng nhập được chuyển về login.
- `not-found.png`: trang 404 của ứng dụng.
- `test-summary.png`: ảnh chụp cửa sổ hiển thị console kết quả thật.

Ảnh giao diện do CodeceptJS/Playwright chụp sau assertion. Suite chạy frontend thật, **không cần backend, không đăng nhập, không thực hiện thanh toán**. Các scenario checkout có tài khoản chỉ được cấu hình và hướng dẫn, chưa kiểm chứng với dữ liệu/tài khoản trong lần chạy này. Workflow CI đã được thêm nhưng chưa có kết quả chạy GitHub Actions.

Hướng dẫn cho cả nhóm: `../../e2e/README.md`. Không commit node_modules, token, log đầy đủ hay ZIP.
