# TroConnect — Design System (MASTER)

Nguồn sự thật cho mọi trang UI của TroConnect. Mọi trang mới PHẢI dùng đúng token
trong file này. Thay đổi cục bộ cho một trang cụ thể ghi vào mục **Overrides** cuối
file, không sửa token gốc.

## 1. Phong cách

**Minimalism & Swiss Style** — monochrome, tương phản cao.

- KHÔNG shadow, KHÔNG gradient.
- KHÔNG border-radius: `rounded-none` toàn bộ (input, button, card, checkbox...).
- KHÔNG dùng bảng màu mặc định của Tailwind (blue/red/green...) — palette mặc định
  đã bị vô hiệu trong `src/index.css` (`--color-*: initial`), chỉ còn token bên dưới.
- KHÔNG emoji làm icon — chỉ SVG từ `lucide-react`.
- Trạng thái (success/error/info) phân biệt bằng **độ đậm viền + chữ in hoa**,
  không dùng màu semantic đỏ/vàng/xanh.

## 2. Màu (token)

Định nghĩa bằng CSS variables trong `src/index.css`, đổi theo class `dark` trên `<html>`.
Class Tailwind tương ứng: `bg-bg`, `text-fg`, `text-muted`, `border-border`, `border-border-strong`.

| Token           | Light     | Dark      | Dùng cho                          |
| --------------- | --------- | --------- | --------------------------------- |
| `bg`            | `#FFFFFF` | `#000000` | Nền trang, nền card, nền input    |
| `fg`            | `#0A0A0A` | `#FAFAFA` | Chữ chính, nền button primary     |
| `muted`         | `#6E6E6E` | `#9C9C9C` | Chữ phụ, placeholder, hint        |
| `border`        | `#E2E2E2` | `#2A2A2A` | Viền mặc định (input, card)       |
| `border-strong` | `#0A0A0A` | `#FAFAFA` | Viền nhấn (focus, error, alert)   |

## 3. Typography

- **Inter** duy nhất (self-host qua `@fontsource/inter`), weight 400 / 500 / 600 / 700.
- Label form + tiêu đề Alert + button: **UPPERCASE + letter-spacing rộng** (`tracking-widest`/`tracking-wider`).
- Không dùng font trang trí.

## 4. Theme

- `darkMode` theo class `dark` trên `<html>` (Tailwind v4: `@custom-variant dark`).
- Lưu qua **React Context** (`src/context/ThemeContext.tsx`) — KHÔNG dùng localStorage.
- Mặc định theo `prefers-color-scheme`.

## 5. Components (`src/components/auth/`)

| Component          | Quy tắc chính                                                                 |
| ------------------ | ----------------------------------------------------------------------------- |
| `AuthLayout`       | Căn giữa, logo (ô vuông đặc + wordmark) góc trên trái, `ThemeToggle` góc trên phải, footer |
| `Button`           | `primary` = nền `fg` chữ `bg`, hover ĐẢO màu (150ms); `secondary` viền strong; `ghost` chữ muted; prop `isLoading` → spinner `Loader2` |
| `Input`            | Prop `label` / `error` / `hint`; validate onBlur ở page; error → viền strong + text lỗi |
| `PasswordInput`    | Bọc `Input`, luôn có nút hiện/ẩn (Eye/EyeOff)                                  |
| `Checkbox`         | Ô vuông viền strong, checked → nền `fg` + icon Check màu `bg`                  |
| `PasswordStrength` | 4 khối vuông tô đậm dần (`bg-fg` / `bg-border`), nhãn YẾU→MẠNH, không màu semantic |
| `Alert`            | `error` viền 2px strong / `success` viền 1px strong / `info` viền 1px thường; tiêu đề in hoa |

## 6. UX bắt buộc

- Mọi ô password có nút hiện/ẩn.
- Inline validation khi blur, không chỉ lúc submit.
- Nút submit có 3 trạng thái: idle → loading (spinner + disable) → kết quả (Alert/chuyển trang).
- `cursor-pointer` cho mọi phần tử click được.
- Transition 150–300ms; tôn trọng `prefers-reduced-motion` (đã tắt global trong `index.css`).
- Focus-visible rõ (outline 2px `border-strong`, global trong `index.css`).
- Tương phản ≥ 4.5:1 (theme thuần đen/trắng nên phần lớn đạt AAA).
- Responsive: 375 / 768 / 1024 / 1440px.

## 7. API

- Axios instance: `src/lib/axios.ts`, baseURL `/api`, proxy dev → `http://localhost:5066` (backend ASP.NET).
- Interceptor tự gắn `Authorization: Bearer <token>` — đọc từ `localStorage` (đã "Ghi nhớ đăng nhập") hoặc `sessionStorage`, key `troconnect_token`.
- Endpoints auth: `POST /accounts/login`, `/accounts/register`, `/accounts/forgot-password`, `/accounts/reset-password`.
- Register: backend nhận `{ email, password, role }` — `role` là enum SỐ (`0` = Landlord, `1` = Tenant) vì backend chưa bật `JsonStringEnumConverter`. Trường "Họ tên" trên UI chưa có chỗ chứa ở backend.
- Endpoints Nhà trọ (Property): `GET/POST /buildings`, `GET/PUT/DELETE /buildings/{id}` — yêu cầu `[Authorize]`. Tên frontend "Property" ánh xạ 1:1 vào entity backend `Building`, xem `src/types/property.ts`. Create trả 409 `{ isDuplicate, existingBuilding, message }` khi trùng địa chỉ — flow xử lý ở `PropertyFormModal.tsx` (hỏi lại người dùng, gửi lại với `confirmDuplicate: true`).
- Response 401 khi token hết hạn/không hợp lệ (đã gắn Authorization mà vẫn 401) → interceptor tự xoá token + điều hướng `/login`. KHÔNG áp dụng cho 401 của chính `/accounts/login` (sai mật khẩu) — request đó không gắn token nên interceptor bỏ qua, page tự xử lý lỗi inline.
- Endpoints Phòng (Room): **API thật**, route FLAT `GET/POST /rooms`, `GET/PUT/DELETE /rooms/{id}` — KHÔNG nested theo building. Lọc theo nhà trọ bằng query param `?buildingId=`. Không phân trang, không response wrapper. List (`RoomListDto`) chỉ có `id/name/buildingName/basePrice/maxOccupancy` — thiếu `servicePrice`/`singleOccupantDiscountAmount` nên sửa phòng phải gọi `GET /rooms/{id}` lấy đủ field trước khi mở form (xem `PropertyRoomsPage.tsx`). Lỗi 400 model-validation trả `{ errors: { "Name": [...], "BasePrice": [...] } }` — **key PascalCase đúng tên field C#**, khác hẳn casing camelCase của các response khác; map field qua `roomService.getFieldErrors`. Lỗi business rule (hết hạn mức phòng, sai buildingId) trả `{ message }` phẳng qua `roomService.getErrorMessage`.
- **Room KHÔNG có trường trạng thái phòng (Available/Occupied/Maintenance), KHÔNG có tầng, KHÔNG có diện tích** — đã verify trực tiếp qua `Room.cs`/API thật. Không tự thêm các field này ở FE cho tới khi backend có.
- Endpoints Người thuê (Tenant): `GET/POST /tenants`, `GET/PUT/DELETE /tenants/{id}`, tìm kiếm bằng `?search=` (khớp `FullName` hoặc `IdNumber`). Không phân trang, không wrapper. List (`TenantListDto`) chỉ có `id/fullName/idNumber/phoneNumber` → sửa phải gọi `GET /tenants/{id}` lấy đủ field. `gender` là enum SỐ (`0` Male / `1` Female / `2` Other, nullable), `dateOfBirth` là chuỗi `yyyy-MM-dd` (DateOnly, nullable). Trùng `IdNumber` → 400 `{ message }` (gắn inline vào field CCCD, không đẩy lên banner chung).
- **Tenant KHÔNG liên kết tới Room**: không có `RoomId`, `MoveInDate`/`MoveOutDate`, tiền cọc, enum trạng thái (Active/CheckedOut), và không có endpoint checkout/move-out. Đây là **hồ sơ người thuê độc lập** đúng theo `docs/tenant-and-account.md`. Quan hệ Người thuê ↔ Phòng đi qua module **Contract** (`ContractTenant`, vai trò Representative/CoTenant) — module này CHƯA tồn tại. Không dựng danh sách người thuê theo phòng, không check giới hạn `maxOccupancy` theo số người thuê cho tới khi Contract có.
- Rule định dạng CCCD (9 hoặc 12 chữ số) và SĐT (10 số, bắt đầu `0`) trong `TenantFormModal` là **chặt hơn BE** (BE chỉ có `[Required]`) — thêm ở FE để bắt lỗi nhập liệu sớm; nếu BE siết/nới khác đi thì phải chỉnh lại cho khớp.

## 8. Components mở rộng sau auth

| Component                              | Quy tắc chính                                                                                          |
| --------------------------------------- | ------------------------------------------------------------------------------------------------------- |
| `components/layout/Sidebar.tsx`         | Sidebar trái `w-64` (thu gọn còn `w-16`), nhóm nav theo module (`NavGroup` — nhãn uppercase + icon), item active dùng `border-l-2 border-fg`, `ThemeToggle` + nút thu gọn/mở rộng (`PanelLeftClose`/`PanelLeftOpen`) ở cuối. Khi thu gọn: ẩn chữ logo/label, mỗi group hiện 1 icon-link trỏ vào mục đầu tiên (title = tooltip) — chỉ hợp lý vì mỗi group hiện có đúng 1 mục; group nhiều mục cần đổi sang flyout menu. Thêm module mới (Hợp đồng/Hóa đơn/Hồ sơ khách thuê...) = thêm 1 `NavGroup`, không build trước khi module đó có route |
| `components/layout/AppLayout.tsx`       | `>=768px`: sidebar cố định bên trái (state thu gọn lưu `localStorage` key `troconnect_sidebar_collapsed`, transition `width` 200ms) + nội dung căn giữa `max-w-5xl`. `<768px`: sidebar ẩn (không thu gọn được), thay bằng top bar mỏng có nút hamburger mở drawer (dùng lại pattern overlay `bg-fg/40` của `Modal`) |
| `components/shared/Modal.tsx`           | Overlay `bg-fg/40`, đóng bằng Esc hoặc click nền, `role="dialog"` — nền tảng cho form và confirm dialog   |
| `components/shared/ConfirmDialog.tsx`   | Bọc `Modal`, dùng cho **mọi** hành động xoá (không xoá trực tiếp khi click) — nút Huỷ (`ghost`) + nút xác nhận (`primary`) |
| `components/shared/DataTable.tsx`       | `>=768px` render `<table>`; `<768px` chuyển card key/value theo cột (Table Handling)                     |
| `components/shared/EmptyState.tsx`      | Icon `lucide-react` + tiêu đề uppercase + mô tả + action tuỳ chọn                                        |
| `components/shared/Toast.tsx`           | `ToastProvider` bọc toàn app (`App.tsx`) + hook `useToast().showToast(message, variant?)`. Cùng ngôn ngữ với `Alert` (viền đậm phân biệt trạng thái, không màu semantic), tự ẩn sau 3.5s, xếp chồng góc dưới-phải |
| `components/shared/TableSkeleton.tsx`   | Khung loading khớp breakpoint của `DataTable` (table `>=768px` / card `<768px`), bar `animate-pulse bg-border` |
| `components/properties/RoomFormModal.tsx` | Dùng chung Tạo/Sửa qua prop `mode: 'create' \| 'edit'`. Field khớp `CreateRoomRequest`/`UpdateRoomRequest` thật — validate onBlur mirror đúng `[Range]`/`[Required]` của BE. Lỗi 400 field-level từ BE ghi đè lỗi client-side qua `roomService.getFieldErrors` |
| `components/auth/Select.tsx`            | Dropdown cùng ngôn ngữ với `Input` (label uppercase, viền `border-strong` khi focus/lỗi), `appearance-none` + icon `ChevronDown` tự vẽ. Prop `placeholder` = dòng trống đầu danh sách cho field optional |
| `components/tenants/TenantFormModal.tsx` | Dùng chung Tạo/Sửa qua prop `mode`. Lỗi trùng CCCD hiển thị inline ngay dưới ô CCCD (không đẩy lên banner) vì gắn được vào đúng field |

## Overrides

_Chưa có. Khi một trang cần lệch khỏi MASTER, ghi rõ: trang nào, token/quy tắc nào, giá trị mới, lý do._
