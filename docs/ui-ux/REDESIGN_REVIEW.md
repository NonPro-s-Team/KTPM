# RMS Frontend Redesign Review

## Design direction

RMS được xây dựng theo hướng **Modern Monochrome Enterprise Dashboard**:
neutral-first, tối giản theo tinh thần Swiss Style, mật độ dữ liệu cao nhưng dễ
quét, phân cấp rõ và chỉ dùng màu semantic cho trạng thái nghiệp vụ. Dashboard
dùng bento grid có kiểm soát; thẻ, bảng và biểu đồ ưu tiên border nhẹ thay vì
shadow hoặc hiệu ứng trang trí.

Hai skill đã áp dụng:

- `frontend/.agents/skills/design/SKILL.md`
- `frontend/.agents/skills/ui-ux-pro-max/SKILL.md`

Các quyết định chính từ skill gồm: thiết kế từ token tập trung, giới hạn radius
6–10 px cho bề mặt nghiệp vụ, dùng Inter Variable hỗ trợ tiếng Việt, giữ vùng
bấm tối thiểu 44 px, bố cục responsive theo nội dung, trạng thái luôn có nhãn
chữ hoặc icon và giảm chuyển động khi người dùng bật
`prefers-reduced-motion`.

## Cách chạy frontend

Yêu cầu Node.js 22.22 trở lên và npm 10 trở lên.

```bash
cd frontend
npm install
npm run dev
```

Mở `http://localhost:5173`. Dùng dữ liệu bất kỳ đúng định dạng để đi qua màn
hình đăng nhập bản mẫu, ví dụ:

- Email: `quanly@example.local`
- Mật khẩu: `matkhau123`

Đây chỉ là dữ liệu mô phỏng, không phải tài khoản thật.

## Route cần review

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
- Một URL không tồn tại để kiểm tra trang 404

## Cách đổi theme

Chọn biểu tượng mặt trời/mặt trăng trên header hoặc trang đăng nhập, sau đó chọn:

- Sáng
- Tối
- Theo hệ thống

Lựa chọn được lưu với khóa `rms-theme`, được áp dụng trước khi React khởi tạo để
tránh flash sai theme và tự cập nhật `color-scheme`.

## Quyết định thiết kế

- Dùng ba lớp token: primitive, semantic và component.
- Light Theme dùng nền trang `#FAFAFA`, surface `#FFFFFF`; Dark Theme dùng nền
  trang `#0A0A0A`, surface `#171717`.
- Màu xanh lá, xanh dương, amber và đỏ chỉ xuất hiện trong badge, alert, icon,
  validation, chart indicator và thao tác destructive.
- Sidebar desktop rộng 240 px, thu gọn còn 68 px ở tablet và chuyển thành drawer
  trên mobile.
- Header cao 64 px; content padding lần lượt 16/24/24 px theo mobile/tablet/desktop.
- Bảng không kẻ border từng ô; ở màn hình hẹp, phần bảng tự cuộn ngang mà không
  làm tràn toàn trang.
- Modal và drawer dùng native `<dialog>`, có accessible name, backdrop, focus
  management và xử lý sự kiện `cancel` từ phím Escape.
- Dashboard dùng Recharts, legend bằng chữ, mô tả accessible cho từng biểu đồ,
  palette chart thích ứng Light/Dark.
- Dữ liệu, type và service được tách khỏi page để sẵn sàng tích hợp API.
- Route được lazy-load; biểu đồ nằm trong chunk riêng để giữ bundle khởi động gọn.

## Screenshot

- [Login Light Desktop](screenshots/login-light-desktop.png)
- [Login Dark Desktop](screenshots/login-dark-desktop.png)
- [Dashboard Light Desktop](screenshots/dashboard-light-desktop.png)
- [Dashboard Dark Desktop](screenshots/dashboard-dark-desktop.png)
- [Dashboard Mobile](screenshots/dashboard-mobile.png)
- [Rooms Light Desktop](screenshots/rooms-light-desktop.png)
- [Rooms Dark Desktop](screenshots/rooms-dark-desktop.png)
- [Rooms Mobile](screenshots/rooms-mobile.png)
- [DataTable Light](screenshots/datatable-light.png)
- [DataTable Dark](screenshots/datatable-dark.png)
- [Room Drawer Mobile](screenshots/room-drawer-mobile.png)

Tất cả screenshot chỉ chứa mock data và địa chỉ thuộc miền `.local`.

## Kết quả kiểm tra

| Hạng mục | Kết quả |
| --- | --- |
| Formatter | Pass — toàn bộ file khớp Prettier |
| Typecheck | Pass — TypeScript project build không lỗi |
| Lint | Pass — Oxlint không cảnh báo |
| Test | Pass — 4 file, 4 test |
| Production build | Pass — Vite build thành công |
| Dependency audit | Pass — 0 vulnerability production |
| Browser console | Pass — 0 error, 0 warning |
| Routing | Pass — toàn bộ 13 route và fallback 404 |
| Theme | Pass — Light, Dark, System và persistence |
| Responsive | Pass — 375, 768, 1024 và 1440 px |

## Accessibility

- Có skip link, landmark, breadcrumb, heading hierarchy và accessible name.
- Input có label, required state, helper/error liên kết bằng `aria-describedby`.
- Icon button có `aria-label`; trạng thái không phụ thuộc duy nhất vào màu.
- Focus-visible có outline tương phản; control và vùng bấm chính đạt tối thiểu
  44 px.
- Native dialog xử lý `cancel`/Escape; menu và tab dùng role phù hợp.
- Table có region label, header semantic, sort state, selected state và keyboard
  scroll.
- Chart có mô tả bằng chữ và legend; số liệu dùng tabular numbers.
- Motion được giảm/tắt khi `prefers-reduced-motion: reduce`.
- Neutral foreground/background chính và màu semantic được chọn theo mục tiêu
  tương phản WCAG AA.

## Known limitations

- Đăng nhập, tìm kiếm, thông báo và các thao tác tạo/cập nhật hiện là prototype.
- Dữ liệu nghiệp vụ vẫn lấy từ `src/data/mockData.ts`; service layer chưa gọi
  backend thật.
- Chưa có upload hồ sơ, xuất hóa đơn, thanh toán online hoặc phân quyền thực.
- Bộ test hiện bao phủ theme persistence, validation đăng nhập, DataTable và
  hành vi Escape của drawer; chưa phải bộ end-to-end đầy đủ cho mọi module.
- Cần review nội dung nghiệp vụ, permission matrix và mapping DTO trước khi nối
  API production.
