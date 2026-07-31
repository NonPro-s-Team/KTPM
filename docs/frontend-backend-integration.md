# Frontend – Backend Integration

## Kiến trúc

Frontend dùng một Axios instance tại `frontend/src/api/httpClient.ts`. `baseURL` lấy từ `VITE_API_BASE_URL`, timeout là 15 giây và mọi request chấp nhận JSON. Request interceptor đọc phiên đã lưu và thêm `Authorization: Bearer <token>`. Response interceptor chuẩn hóa `application/problem+json`; lỗi 401 ngoài login sẽ xóa phiên và chuyển về `/login`.

Các record JSON camelCase của backend được định nghĩa tại `frontend/src/types/api.ts`. Mỗi nhóm endpoint có module riêng trong `frontend/src/api`. React page gọi module API thông qua hook tải dữ liệu có hủy request khi unmount; component không tự tạo ID hoặc trạng thái nghiệp vụ.

## Auth flow và token storage

1. `/login` gửi `{ username, password }` tới `POST /api/auth/login`.
2. Frontend dùng trực tiếp `role`, `userId`, `username`, `expiresAt` và `accessToken` trong `LoginResponse`; không suy luận role bằng cách decode JWT.
3. Bật “Ghi nhớ đăng nhập”: phiên nằm trong `localStorage`. Tắt: phiên nằm trong `sessionStorage`. Chỉ một nơi lưu tồn tại tại một thời điểm.
4. Khi hydrate, phiên thiếu/sai cấu trúc hoặc đã hết hạn bị xóa. Một timer xóa phiên khi `expiresAt` đến hạn. Backend chưa có refresh token nên frontend không tạo refresh flow.
5. Logout gọi `POST /api/auth/logout` và luôn xóa phiên cục bộ, kể cả request logout thất bại.

`ProtectedRoute` yêu cầu phiên hợp lệ. `RoleGuard` bảo vệ route theo role và chuyển tới `/403` khi không đủ quyền. Việc ẩn nút chỉ là lớp UI bổ sung, không thay thế route/backend authorization.

## Environment

Local frontend:

```env
VITE_API_BASE_URL=http://localhost:5000/api
```

Mặc định `npm run dev` đọc `frontend/.env.development` và gọi `https://api.troconnect.site/api`. Để chuyển về backend cục bộ, tạo `frontend/.env.local` với URL localhost ở trên; Vite ưu tiên `.env.local` hơn `.env.development`.

Production frontend:

```env
VITE_API_BASE_URL=https://api.troconnect.site/api
```

Giá trị production công khai này được khai báo trong `frontend/.env.production`, vì vậy `npm run build` sẽ gọi đúng API đã host ngay cả khi nền tảng deploy không inject biến riêng. Biến môi trường của pipeline vẫn có thể ghi đè giá trị đó khi cần.

Không commit `.env`, `.env.local`, credential, JWT hoặc API secret.

## Endpoint-to-page mapping

| Page | Endpoint |
| --- | --- |
| Login / Account | `POST /auth/login`, `POST /auth/logout`, `POST /auth/change-password` |
| Dashboard | `GET /dashboard/summary` |
| Rooms | `GET/POST /rooms`, `PUT /rooms/{id}`, `PATCH /rooms/{id}/status` |
| Tenants | `GET/POST /tenants`, `PUT /tenants/{id}`, `GET /tenants/me` |
| Contracts | `GET/POST /contracts`, `PUT /contracts/{id}`, activate/terminate/cancel actions |
| Invoices | `GET/POST /invoices`, `PUT /invoices/{id}`, issue và register-payment actions |
| Payments | `GET/POST /invoices/{invoiceId}/payments` sau khi người dùng chọn hóa đơn |
| Maintenance | `GET/POST /maintenance-requests` và start/progress-notes/resolve/close actions |
| Properties | Không có endpoint; trang chỉ hiển thị trạng thái chưa hỗ trợ |
| Settings | Không gọi backend; theme được lưu cục bộ |

List API dùng `pageNumber`, `pageSize` và `status` khi backend hỗ trợ. DataTable chạy controlled/server pagination, còn tìm kiếm chỉ áp dụng trên trang hiện tại.

## Role-to-navigation mapping

| Role | Navigation |
| --- | --- |
| Admin / Staff | Dashboard, Rooms, Tenants, Contracts, Invoices, Maintenance, Account, Settings |
| Tenant | Hồ sơ của tôi, Rooms, Contracts, Invoices, Maintenance, Account, Settings |

Admin/Staff có mutation cho phòng, khách thuê, hợp đồng và hóa đơn. Tenant tạo maintenance request. Các action trái role không được render; backend vẫn là lớp phân quyền quyết định.

## Enum mapping

- Role: `admin`, `staff`, `tenant`.
- Room: `available`, `occupied`, `maintenance`, `inactive`.
- Contract: `draft`, `active`, `terminated`, `cancelled`. “Sắp hết hạn” chỉ là nhãn suy ra cho contract `active` có `endDate` trong 30 ngày.
- Invoice: `draft`, `issued`, `partiallyPaid`, `paid`, `overdue`, `cancelled`.
- Maintenance: `submitted`, `inProgress`, `resolved`, `closed`.

DateOnly dùng `YYYY-MM-DD`; DateTimeOffset dùng chuỗi ISO-8601.

## CORS

Backend production phải cấu hình origin frontend chính xác, không dùng `AllowAnyOrigin`:

```text
Cors__AllowedOrigins__0=https://<frontend-production-domain>
Cors__AllowedOrigins__1=http://localhost:5173
```

Không thêm dấu `/` cuối origin. Azure App Service cần nhận các giá trị này qua Application Settings. Nếu Cloudflare đứng trước frontend, dùng origin public mà trình duyệt thực sự gửi trong header `Origin`.

## Local setup và test

1. Chạy backend tại `http://localhost:5000` với database/seed dành cho development.
2. Tạo `frontend/.env` từ `.env.example`.
3. Chạy `npm ci` rồi `npm run dev` trong `frontend`.
4. Chạy kiểm tra: `npm run typecheck`, `npm run lint`, `npm run test`, `npm run build`.

Production smoke test chỉ được dùng `GET /health/live`, `GET /health/ready`, login bằng credential lấy từ `E2E_*` và một authenticated GET phù hợp role. Không chạy mutation trên production. Nếu không có credential, phải ghi rõ phần authenticated smoke test bị bỏ qua.

## API gaps còn lại

- Chưa có Properties API.
- Chưa có user list/invite/lock/edit-role API; trang Account chỉ dùng current login và change-password.
- Chưa có global Payments list API; lịch sử thanh toán bắt buộc invoice-scoped.
- Dashboard chưa có historical revenue API nên không hiển thị biểu đồ doanh thu giả.
- Các field mock như property/floor/area/deposit/invoice code/due date/payment method/payment status/maintenance priority/assignee không tồn tại trong backend và đã bị loại khỏi runtime UI.
