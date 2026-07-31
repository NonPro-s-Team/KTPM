# RMS Frontend

Giao diện quản lý phòng trọ được xây dựng bằng React, TypeScript và Vite. Bản
hiện tại sử dụng dữ liệu mô phỏng an toàn để minh họa đầy đủ các luồng quản lý,
đồng thời đã chuẩn bị lớp dịch vụ để kết nối API thật.

## Yêu cầu

- Node.js 22.22 trở lên
- npm 10 trở lên

## Khởi chạy

```bash
npm install
npm run dev
```

Ứng dụng mặc định chạy tại `http://localhost:5173`.

## Biến môi trường

Sao chép `.env.example` thành `.env` nếu cần thay đổi địa chỉ API:

```env
VITE_API_BASE_URL=/api
```

Không đặt khóa bí mật hoặc token truy cập trong biến môi trường của frontend.

## Các lệnh kiểm tra

```bash
npm run format:check
npm run typecheck
npm run lint
npm run test
npm run build
```

## Tuyến giao diện

- `/login`
- `/dashboard`
- `/properties`
- `/rooms`
- `/tenants`
- `/contracts`
- `/invoices`
- `/payments`
- `/maintenance`
- `/users`
- `/settings`
- `/403`

Các địa chỉ không tồn tại sẽ hiển thị trang 404.

## Giao diện và dữ liệu

- Hỗ trợ Sáng, Tối và Theo hệ thống; lựa chọn được lưu trên trình duyệt.
- Responsive tại mobile, tablet và desktop.
- Dữ liệu trong `src/data/mockData.ts` chỉ dùng cho bản mẫu.
- Các hàm trong `src/services` là điểm nối dành cho API backend sau này.

Tài liệu thiết kế, kết quả review và ảnh chụp nằm trong `docs/ui-ux`.
