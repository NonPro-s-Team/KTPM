# RMS UI Design System

## 1. Product context

RMS là hệ thống vận hành phòng trọ dành cho chủ nhà, nhân viên quản lý, kế toán và quản trị viên. Giao diện phải giúp người dùng quét nhanh tình trạng phòng, doanh thu, công nợ, hợp đồng và yêu cầu sửa chữa; đồng thời hỗ trợ thao tác nghiệp vụ lặp lại với độ chính xác cao.

Ngôn ngữ giao diện là tiếng Việt. Dữ liệu bản mẫu không chứa thông tin cá nhân thật.

## 2. Design direction

- Modern Monochrome Enterprise Dashboard.
- Minimalism kết hợp Swiss Style: lưới rõ, typography trung tính, thứ bậc dựa trên kích thước và khoảng cách.
- Executive Dashboard có mật độ cao nhưng vẫn quét nhanh.
- Neutral-first; màu ngữ nghĩa chỉ xuất hiện tại trạng thái, cảnh báo, tiến độ và dữ liệu biểu đồ.
- Bento grid có kiểm soát ở Dashboard; không biến dashboard thành landing page.
- Chuyển động mức 2/10, mật độ 8/10, độ biến thiên thị giác 3/10.
- Surface phân lớp bằng nền và border; shadow chỉ hỗ trợ nhẹ ở light mode.

## 3. Guidelines từ skill `design`

Nguồn: `frontend/.agents/skills/design/SKILL.md`.

- Dùng kiến trúc token ba tầng từ sub-skill `design-system`: primitive → semantic → component.
- Component chỉ tham chiếu semantic/component token, không dùng mã màu rải rác.
- Quy định state ở cấp hệ thống: default, hover, active, focus-visible, disabled và loading.
- Component phức tạp được ghép từ primitive nhỏ, có TypeScript props rõ ràng.
- Dark mode thay semantic mapping, không đảo màu cơ học.
- Tài liệu là nguồn tham chiếu cho code và review; implementation phải phản ánh token đã định nghĩa.

## 4. Guidelines từ skill `ui-ux-pro-max`

Nguồn: `frontend/.agents/skills/ui-ux-pro-max/SKILL.md`.

Kết quả tra cứu cho RMS:

- Design dials: variance 3/10, motion 2/10, density 8/10.
- Typography phù hợp: Inter cho phong cách Minimal Swiss/enterprise dashboard; Be Vietnam Pro là phương án ưu tiên tiếng Việt nhưng có cá tính tròn hơn.
- Bảng trên mobile nằm trong vùng cuộn ngang có nhãn, không làm tràn viewport.
- Có skip link, focus ring rõ, thứ tự Tab theo thứ tự thị giác.
- Touch target tối thiểu 44×44 px.
- Form dùng label hiển thị, đúng `type`/`inputmode`/`autocomplete`, validation gần field.
- Search/filter dùng `useDeferredValue` để tránh cập nhật dồn dập.
- Biểu đồ có legend, tooltip, số liệu/diễn giải dạng chữ và không dựa vào màu làm dấu hiệu duy nhất.
- Tôn trọng `prefers-reduced-motion`.

Tra cứu ban đầu gợi ý primary xanh và kiểu “Operations Landing / Exaggerated Minimalism”. Hai điểm này không áp dụng vì mâu thuẫn với yêu cầu sản phẩm: RMS dùng primary đen/trắng, typography gọn và bố cục ứng dụng vận hành.

## 5. Light palette

### Primitive

| Token         | Giá trị   |
| ------------- | --------- |
| `neutral-0`   | `#FFFFFF` |
| `neutral-50`  | `#FAFAFA` |
| `neutral-100` | `#F5F5F5` |
| `neutral-200` | `#E5E5E5` |
| `neutral-300` | `#D4D4D4` |
| `neutral-400` | `#A3A3A3` |
| `neutral-500` | `#737373` |
| `neutral-600` | `#525252` |
| `neutral-700` | `#404040` |
| `neutral-800` | `#262626` |
| `neutral-900` | `#171717` |
| `neutral-950` | `#0A0A0A` |

### Semantic

| Vai trò                | Token primitive |
| ---------------------- | --------------- |
| Page background        | `neutral-50`    |
| Page background subtle | `neutral-100`   |
| Surface                | `neutral-0`     |
| Surface secondary      | `neutral-50`    |
| Surface hover/selected | `neutral-100`   |
| Surface active         | `neutral-200`   |
| Text primary           | `neutral-900`   |
| Text secondary         | `neutral-600`   |
| Text muted             | `neutral-500`   |
| Text disabled          | `neutral-400`   |
| Border default/divider | `neutral-200`   |
| Border strong          | `neutral-300`   |
| Primary background     | `neutral-900`   |
| Primary hover          | `neutral-800`   |
| Primary active         | `neutral-950`   |
| Primary foreground     | `neutral-0`     |
| Focus ring             | `neutral-600`   |

## 6. Dark palette

### Primitive

| Token              | Giá trị   |
| ------------------ | --------- |
| `dark-neutral-0`   | `#000000` |
| `dark-neutral-50`  | `#0A0A0A` |
| `dark-neutral-100` | `#171717` |
| `dark-neutral-200` | `#262626` |
| `dark-neutral-300` | `#373737` |
| `dark-neutral-400` | `#525252` |
| `dark-neutral-500` | `#8A8A8A` |
| `dark-neutral-600` | `#A3A3A3` |
| `dark-neutral-700` | `#D4D4D4` |
| `dark-neutral-800` | `#E5E5E5` |
| `dark-neutral-900` | `#F5F5F5` |
| `dark-neutral-950` | `#FAFAFA` |

### Semantic

| Vai trò                          | Token primitive    |
| -------------------------------- | ------------------ |
| Page background                  | `dark-neutral-50`  |
| Page background subtle / surface | `dark-neutral-100` |
| Surface secondary/hover/selected | `dark-neutral-200` |
| Surface active / border strong   | `dark-neutral-300` |
| Text primary                     | `dark-neutral-950` |
| Text secondary                   | `dark-neutral-700` |
| Text muted                       | `dark-neutral-600` |
| Text disabled                    | `dark-neutral-500` |
| Border default/divider           | `dark-neutral-200` |
| Primary background               | `dark-neutral-950` |
| Primary hover                    | `dark-neutral-800` |
| Primary active                   | `#FFFFFF`          |
| Primary foreground               | `dark-neutral-100` |
| Focus ring                       | `dark-neutral-600` |

Dark theme không dùng `#000000` làm nền toàn trang và không dựa vào shadow để phân lớp.

## 7. Semantic colors

| Trạng thái  | Light text / background / border  | Dark text / background / border   |
| ----------- | --------------------------------- | --------------------------------- |
| Success     | `#166534` / `#F0FDF4` / `#BBF7D0` | `#86EFAC` / `#14251A` / `#255B36` |
| Information | `#1D4ED8` / `#EFF6FF` / `#BFDBFE` | `#93C5FD` / `#142035` / `#26446F` |
| Warning     | `#92400E` / `#FFFBEB` / `#FDE68A` | `#FCD34D` / `#2B2110` / `#6B4F18` |
| Danger      | `#B91C1C` / `#FEF2F2` / `#FECACA` | `#FCA5A5` / `#2D1616` / `#6F2828` |
| Neutral     | `#525252` / `#F5F5F5` / `#D4D4D4` | `#D4D4D4` / `#262626` / `#525252` |

Mỗi status luôn có nhãn chữ hoặc icon bên cạnh màu. Không phủ semantic color lên toàn bộ card.

## 8. Typography

Inter được chọn làm font chính vì:

- hỗ trợ đầy đủ ký tự tiếng Việt;
- chữ số rõ, có tabular figures;
- hợp phong cách Minimal Swiss và dữ liệu enterprise;
- giữ độ rộng gọn hơn Be Vietnam Pro ở bảng mật độ cao.

Be Vietnam Pro được đánh giá cao về bản sắc Việt và độ thân thiện nhưng không chọn vì hình dáng tròn, độ rộng lớn hơn làm giảm mật độ dữ liệu.

| Role               | Size / line-height        | Weight  |
| ------------------ | ------------------------- | ------- |
| Page title         | 24/32 px, mobile 22/30 px | 600     |
| Section title      | 18/26 px                  | 600     |
| Card title         | 15/22 px                  | 600     |
| Body               | 15/24 px                  | 400     |
| Body small / table | 14/20 px                  | 400     |
| Label              | 14/20 px                  | 500     |
| Caption/helper     | 12/18 px                  | 400–500 |
| KPI                | 28/34 px                  | 600     |

Chỉ dùng weight 400, 500 và 600. Dữ liệu tài chính, số phòng và ngày tháng dùng `font-variant-numeric: tabular-nums`.

## 9. Spacing scale

Base 4 px: `2, 4, 8, 12, 16, 20, 24, 32, 40, 48, 64`.

- Inline compact: 4–8 px.
- Control nội bộ: 8–12 px.
- Card padding: 16–20 px.
- Section gap: 20–24 px.
- Content padding: mobile 16 px, tablet 20–24 px, desktop 24–32 px.

## 10. Radius scale

- `radius-xs`: 4 px cho indicator nhỏ.
- `radius-sm`: 6 px cho input, button nhỏ.
- `radius-md`: 8 px cho button, card và dropdown.
- `radius-lg`: 10 px cho modal/drawer.
- `radius-pill`: 999 px chỉ cho badge, switch và avatar.

## 11. Shadow system

- `shadow-xs`: card light mode, một lớp mờ rất nhẹ.
- `shadow-sm`: dropdown.
- `shadow-md`: modal/drawer.
- Dark mode ưu tiên border; shadow được giảm mạnh.
- Không dùng glow, shadow màu hoặc nhiều lớp đậm.

## 12. Layout grid

- Desktop: 12 cột linh hoạt, gap 20–24 px.
- Dashboard stat: 4 cột tại ≥1280 px, 2 cột tại 768–1279 px, 1 cột dưới 768 px.
- Content max-width 1600 px để dữ liệu không bị kéo quá dài.
- Không dùng khoảng trắng kiểu marketing; nhóm theo nhiệm vụ và tần suất sử dụng.

## 13. Sidebar

- Expanded 240 px; collapsed 68 px.
- Nền khác page bằng một cấp neutral.
- Item cao tối thiểu 44 px, icon Lucide 18 px, stroke nhất quán.
- Active state dùng nền selected, chữ primary và indicator 2 px.
- Mobile chuyển thành drawer có scrim, đóng bằng Escape và nút rõ ràng.

## 14. Header

- Cao 64 px desktop/tablet, tối thiểu 60 px mobile.
- Chứa nút menu, search, thông báo, theme toggle và user menu.
- Search co lại thành icon trên màn hình hẹp; không làm tràn header.
- Header sticky, dùng border thay shadow.

## 15. Button

- Cao 40 px; vùng chạm icon button 44×44 px.
- Variants: primary, secondary, ghost, danger.
- Primary tối đa một CTA nổi bật trên mỗi vùng.
- Có hover, active, focus-visible, disabled và loading; state không làm dịch layout.

## 16. Input

- Label hiển thị; placeholder chỉ là ví dụ.
- Cao tối thiểu 42 px desktop và 44 px mobile.
- Error gắn qua `aria-describedby`, đặt ngay dưới field và nêu cách sửa.
- Focus ring 2 px có offset; không xóa outline nếu không thay thế.

## 17. Select

- Dùng native select cho prototype để đảm bảo keyboard/screen reader ổn định.
- Label, disabled, focus-visible và helper/error giống Input.
- Không dùng placeholder làm option hợp lệ nếu field bắt buộc.

## 18. Checkbox

- Native input được giữ semantics, visual 18×18 px nhưng label tạo vùng chạm ≥44 px.
- Indeterminate/checked không chỉ phân biệt bằng màu.
- Label nằm bên phải, khoảng cách 8 px.

## 19. Badge

- Chiều cao 24–26 px, radius pill.
- Có chấm/icon nhỏ và nhãn chữ.
- Mapping: success, info, warning, danger, neutral.
- Không dùng badge cho nội dung dài hoặc hành động.

## 20. Card

- Surface + border 1 px + shadow rất nhẹ ở light mode.
- Radius 8 px; padding 16–20 px.
- Header card không bọc thêm card con nếu không có lý do ngữ nghĩa.
- StatCard ưu tiên số liệu, icon nhỏ và delta dạng chữ.

## 21. Data table

- Header nền secondary, chữ 12–13 px weight 600.
- Không border từng cell; dùng divider theo hàng.
- Hỗ trợ search, filter, sort với `aria-sort`, chọn hàng, pagination và row action.
- Có loading skeleton, empty state và error state.
- Mobile dùng vùng cuộn ngang có `tabindex="0"` và mô tả truy cập; cột hành động được giữ gọn.

## 22. Modal

- Max-width theo nội dung, tối đa `calc(100vw - 32px)`.
- Max-height `calc(100dvh - 32px)`, phần body cuộn.
- Scrim 48–58%; surface không trong suốt.
- Focus vào control đầu tiên, đóng bằng Escape, khôi phục focus về trigger.
- Footer có Cancel và một hành động chính.

## 23. Drawer

- Dùng cho navigation mobile và form dài.
- Rộng tối đa 440 px desktop; 100% trừ 16 px trên mobile.
- Cùng nguyên tắc focus, Escape và scroll containment như Modal.

## 24. Dropdown

- Dùng menu cho các hành động liên quan, không dùng để điều hướng chính.
- Hỗ trợ Arrow Up/Down, Enter, Escape.
- Item destructive tách bằng divider và danger token.
- Không mở chỉ bằng hover.

## 25. Tooltip

- Chỉ bổ sung nghĩa cho icon/thuật ngữ; không chứa thao tác quan trọng.
- Xuất hiện khi hover và focus, nội dung ngắn.
- Không thay thế accessible name.

## 26. Chart

- Doanh thu: area/line chart 6 tháng, một dải neutral chính và một chỉ báo comparison.
- Trạng thái phòng: donut tối đa 3 nhóm, có legend và số lượng ngay cạnh.
- Grid line nhẹ, tooltip theo theme, số tiền định dạng `vi-VN`.
- Có `aria-label` mô tả insight và danh sách/bảng tóm tắt dạng chữ.
- Không animate khi người dùng chọn reduced motion.

## 27. Empty state

- Icon Lucide 32 px, tiêu đề ngắn, mô tả cách tiếp tục và tối đa một CTA.
- Không dùng minh họa trang trí lớn.

## 28. Loading state

- Skeleton giữ đúng kích thước nội dung để tránh layout shift.
- Button loading giữ nguyên chiều rộng, disabled và có nhãn screen reader.
- Vùng cập nhật dữ liệu dùng `aria-busy`.

## 29. Responsive

- Breakpoints kiểm tra bắt buộc: 375, 768, 1024, 1440 px.
- Mobile: sidebar thành drawer; CTA và filter có thể xuống hàng; bảng cuộn trong vùng riêng.
- Tablet: sidebar collapsed; grid 2 cột; padding 20–24 px.
- Desktop: sidebar expanded; grid 4 cột; padding 24–32 px.
- Không vô hiệu hóa zoom; dùng `min-height: 100dvh`.

## 30. Accessibility

- Mục tiêu WCAG 2.2 AA cho nội dung chính.
- Skip link tới `main`.
- Heading tuần tự; mỗi trang có một `h1`.
- Icon button có `aria-label`; status không chỉ dùng màu.
- Focus-visible 2 px rõ trên cả hai theme.
- Modal/drawer quản lý focus và Escape; không tạo keyboard trap ngoài phạm vi overlay.
- `aria-live="polite"` cho thông báo không khẩn cấp; `role="alert"` cho lỗi form.
- Tôn trọng `prefers-reduced-motion`; mọi thao tác chính hoạt động bằng keyboard.

## 31. Anti-patterns

Không dùng teal làm primary, gradient nổi bật, glassmorphism toàn trang, neumorphism, claymorphism, aurora, cyberpunk, glow, emoji icon, card nhiều màu, radius 20–32 px, pill cho mọi control, nested card không cần thiết, animation phức tạp, sidebar quá rộng, shadow đậm, khoảng trắng kiểu landing page, font quá nhỏ/mảnh hoặc dữ liệu hard-code trong component lớn.
