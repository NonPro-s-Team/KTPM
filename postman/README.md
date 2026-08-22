# Postman — QLPT-234 & QLPT-235

## Collection đang dùng trực tiếp trong Postman

Collection `Green Juice Hub API` trong workspace RMS đã được bổ sung trực tiếp hai folder:

- `QLPT-234 - Automated Auth, User, Address`
- `QLPT-234 - Manual credential and expiry cases`

Collection này dùng environment `GreenJuiceHub` đang có sẵn với các biến `base_url`, `identifier`, `password`, `access_token` và `refresh_token`. File `GreenJuiceHub-existing.postman_collection.json` là bản sao trước khi bổ sung QLPT-234; file `GreenJuiceHub-QLPT-234-merged.postman_collection.json` là bản đã ghép và được nhập vào Postman.

## Import và chạy

1. Import `GreenJuiceHub-QLPT-234-235.postman_collection.json`.
2. Import và chọn environment `GreenJuiceHub-Local.postman_environment.json`.
3. Đảm bảo backend đang chạy tại `http://localhost:8081` và dữ liệu `database/seed.sql` đã được nạp.
4. Chạy folder `QLPT-234 - Automated Auth, User, Address` trước, sau đó chạy `QLPT-235 - Automated risk probes` trong cùng lượt chạy để giữ các token đã sinh.

Tài khoản mặc định là tài khoản seed và mật khẩu chung đã được ghi trong `database/seed.sql`. Folder kiểm tra đăng nhập sai dùng một tài khoản seed riêng; trạng thái captcha của tài khoản này tự hết hạn sau 15 phút. Nếu chạy lại ngay, đổi biến `lockTestIdentifier` sang một tài khoản seed chưa dùng.

## Phạm vi

- Auth: check account, send/verify OTP, password login, refresh, logout, change password và các endpoint cần credential chạy thủ công.
- User: xem/cập nhật profile, kiểm tra validation đổi mật khẩu.
- Address: list, create, detail, update, set default, delete và kiểm tra sau xóa.
- Boundary: phone 0/1/14/15/16 ký tự; OTP 5/6/7 ký tự; sai mật khẩu liên tiếp.
- Token lifecycle: sai loại token, token lỗi, access token sau logout, refresh token sau logout.
- Risk probes QLPT-235: phân quyền AdminTag và danh sách tỉnh GHN.

Các request `MANUAL-*` được bỏ qua mặc định vì cần OTP/token thật hoặc phải chờ qua mốc hết hạn. Không nên coi request bị skip là test đã pass. Rủi ro JWT lưu trong `localStorage` là kiểm tra tĩnh ở frontend, không thể kiểm chứng đúng bản chất bằng Postman.

## Chạy bằng Newman

Chạy riêng phạm vi QLPT-234:

```powershell
npx --yes newman run postman/GreenJuiceHub-QLPT-234-235.postman_collection.json `
  -e postman/GreenJuiceHub-Local.postman_environment.json `
  --folder "QLPT-234 - Automated Auth, User, Address" `
  --env-var "lockTestIdentifier=seed.user075@greenjuicehub.local" `
  --reporters cli,json `
  --reporter-json-export postman/results/qlpt-234-newman.json
```

Đổi `lockTestIdentifier` sang một tài khoản seed chưa dùng nếu chạy lại trong vòng 15 phút.

Chạy đồng thời QLPT-234 và các risk probe QLPT-235:

```powershell
npx --yes newman run postman/GreenJuiceHub-QLPT-234-235.postman_collection.json `
  -e postman/GreenJuiceHub-Local.postman_environment.json `
  --folder "QLPT-234 - Automated Auth, User, Address" `
  --folder "QLPT-235 - Automated risk probes" `
  --reporters cli,json `
  --reporter-json-export postman/results/qlpt-234-235-newman.json
```

Các request có header `X-Test-Case` và mã tương ứng trong tên để đối chiếu trực tiếp với báo cáo và Bug Jira.

## Kết quả QLPT-234 gần nhất

- Chạy trên `http://localhost:8081` ngày 2026-08-22.
- 20 endpoint, 44 request tự động và 60 assertion.
- 53 assertion đạt, 7 assertion phát hiện sai lệch API.
- Báo cáo đã tổng hợp tại `QLPT-234-test-report.md`.

File JSON do Newman sinh ra trong `postman/results/` có thể chứa access/refresh token ngắn hạn, vì vậy thư mục này được loại khỏi Git (trừ `.gitkeep`).
