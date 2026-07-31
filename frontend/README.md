# RMS Frontend

Giao diện React + TypeScript của TroConnect, kết nối trực tiếp với RMS Backend API bằng Axios và quản lý phiên JWT bằng Zustand.

## Yêu cầu

- Node.js 22.22 trở lên
- npm 10 trở lên
- RMS Backend đang chạy và đã cho phép CORS từ origin frontend

## Khởi chạy cục bộ

```bash
npm ci
copy .env.example .env
npm run dev
```

`.env.example` sử dụng:

```env
VITE_API_BASE_URL=http://localhost:5000/api
```

Repository đã cấu hình `npm run dev` qua `.env.development` để gọi API đã host:

```env
VITE_API_BASE_URL=https://api.troconnect.site/api
```

Nếu cần chạy backend cục bộ, tạo `.env.local` từ `.env.example`; giá trị trong `.env.local` sẽ ghi đè cấu hình development mặc định.

Production build mặc định đọc `.env.production` với:

```env
VITE_API_BASE_URL=https://api.troconnect.site/api
```

Nền tảng deploy vẫn có thể ghi đè `VITE_API_BASE_URL` khi build. Không đưa token, mật khẩu hoặc secret vào biến môi trường frontend.

## Kiểm tra

```bash
npm run typecheck
npm run lint
npm run test
npm run build
```

## Tuyến chính

- `/login`: đăng nhập bằng tên đăng nhập và mật khẩu.
- `/dashboard`: chỉ Admin/Staff.
- `/rooms`, `/contracts`, `/invoices`, `/payments`, `/maintenance`: được bảo vệ và giới hạn thao tác theo vai trò.
- `/tenants`: danh sách cho Admin/Staff; hồ sơ hiện tại cho Tenant.
- `/account`: thông tin phiên và đổi mật khẩu.
- `/settings`: tùy chọn theme lưu trong trình duyệt.
- `/properties`: thông báo rõ API chưa được hỗ trợ.

Tài liệu chi tiết nằm tại `docs/frontend-backend-integration.md`.
