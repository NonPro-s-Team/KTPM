# QLPT-279 - Admin CodeceptJS

Bộ test này chỉ chạy trên localhost và không tạo, sửa hoặc xoá dữ liệu nghiệp vụ.

## Phạm vi

- Đăng nhập bằng tài khoản ADMIN local.
- Mở lần lượt Dashboard, Sản phẩm, Đơn hàng và Người dùng.
- Đăng nhập bằng CUSTOMER local, gọi `GET /api/admin/tags` và xác nhận HTTP 403.

## Chuẩn bị một lần

```powershell
cd frontend
npm.cmd ci
cd ..\e2e
npm.cmd ci
npm.cmd run browsers:install
```

## Chạy

Khởi động database, Redis và backend ở cổng 8081 trước. Từ thư mục `e2e`:

```powershell
npm.cmd run test:admin
```

Runner tự khởi động frontend tại `http://localhost:5173` nếu cổng này chưa có
frontend chạy. Origin này khớp cấu hình CORS hiện tại của backend.

Để quan sát trình duyệt khi báo cáo:

```powershell
npm.cmd run test:admin:headed
```

Mặc định suite dùng fixture local `seed.admin@greenjuicehub.local` và
`seed.user041@greenjuicehub.local` với mật khẩu seed chung `password`. Có thể ghi
đè bằng `E2E_ADMIN_IDENTIFIER`, `E2E_ADMIN_PASSWORD`,
`E2E_CUSTOMER_IDENTIFIER`, `E2E_CUSTOMER_PASSWORD`.

Kết quả JUnit, log frontend và ảnh khi test lỗi nằm tại
`test-evidence/codeceptjs-admin/`. Không chạy suite này trên môi trường production.
