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
- Endpoints auth: `POST /accounts/login`, `/accounts/register`, `/accounts/forgot-password`, `/accounts/reset-password`.
- Register: backend nhận `{ email, password, role }` — `role` là enum SỐ (`0` = Landlord, `1` = Tenant) vì backend chưa bật `JsonStringEnumConverter`. Trường "Họ tên" trên UI chưa có chỗ chứa ở backend.

## Overrides

_Chưa có. Khi một trang cần lệch khỏi MASTER, ghi rõ: trang nào, token/quy tắc nào, giá trị mới, lý do._
