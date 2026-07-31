## Summary

- Xây dựng mới toàn bộ frontend cho hệ thống quản lý phòng trọ.
- Áp dụng Modern Monochrome Enterprise Dashboard, Swiss-inspired minimalism,
  neutral-first và data-dense.
- Bao phủ đăng nhập, dashboard, khu trọ, phòng, khách thuê, hợp đồng, hóa đơn,
  thanh toán, sửa chữa, tài khoản/phân quyền và cài đặt.

## UI/UX skills used

- `design` — `frontend/.agents/skills/design/SKILL.md`
- `ui-ux-pro-max` — `frontend/.agents/skills/ui-ux-pro-max/SKILL.md`
- Áp dụng token architecture, visual hierarchy, typography, spacing, responsive,
  accessibility, loading feedback, controlled motion và anti-pattern review.
- Dùng Inter Variable, radius nhỏ, border nhẹ, vùng bấm 44 px và màu semantic
  chỉ cho trạng thái/thao tác phù hợp.

## Theme

- Light Theme.
- Dark Theme.
- System Theme theo `prefers-color-scheme`.
- Neutral design tokens tập trung theo primitive, semantic và component.
- Semantic status colors cho success, information, warning, danger và neutral.
- Lưu lựa chọn trong localStorage, tránh flash sai theme và cập nhật
  `color-scheme`.

## Pages

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
- `*` — trang 404

## Technical implementation

- React 19, TypeScript và Vite.
- React Router 8.3 với lazy-loaded routes.
- Lucide React cho icon và Recharts cho biểu đồ.
- Component system dùng chung cho form, table, feedback, navigation và overlay.
- Theme provider, token CSS và local Inter Variable.
- Mock data, domain types và API service layer tách riêng.
- Vitest, Testing Library, Oxlint và Prettier cho validation.
- Node.js 22.22+ do yêu cầu engine của React Router 8.3.

## Validation

- Formatter: pass.
- Typecheck: pass.
- Lint: pass.
- Test: pass — 4 file, 4 test.
- Production build: pass.
- Production dependency audit: pass — 0 vulnerability.
- Routing/browser console: pass — 13 route, fallback 404, 0 error/warning.
- Responsive: pass tại 375, 768, 1024 và 1440 px.
- Theme: pass cho Light, Dark, System và persistence.
- Accessibility: landmark/heading/label/aria, focus-visible, semantic status,
  44 px touch target, reduced motion và native dialog cancel/Escape.

## Screenshots

- `docs/ui-ux/screenshots/login-light-desktop.png`
- `docs/ui-ux/screenshots/login-dark-desktop.png`
- `docs/ui-ux/screenshots/dashboard-light-desktop.png`
- `docs/ui-ux/screenshots/dashboard-dark-desktop.png`
- `docs/ui-ux/screenshots/dashboard-mobile.png`
- `docs/ui-ux/screenshots/rooms-light-desktop.png`
- `docs/ui-ux/screenshots/rooms-dark-desktop.png`
- `docs/ui-ux/screenshots/rooms-mobile.png`
- `docs/ui-ux/screenshots/datatable-light.png`
- `docs/ui-ux/screenshots/datatable-dark.png`
- `docs/ui-ux/screenshots/room-drawer-mobile.png`

## Review checklist

- [ ] Light Theme
- [ ] Dark Theme
- [ ] Desktop
- [ ] Tablet
- [ ] Mobile
- [ ] Login
- [ ] Dashboard
- [ ] Data tables
- [ ] Forms
- [ ] Modal/Drawer
- [ ] Theme persistence
- [ ] Accessibility
- [ ] No secrets committed

## Known limitations

- Authentication, search, notification and CRUD submissions still use prototype
  behavior.
- Business pages use mock data; service functions await backend DTO and endpoint
  integration.
- Uploads, payment gateway, invoice export and real permission enforcement are
  out of scope for this frontend pass.
- Please review Vietnamese business copy, permission matrix and DTO mapping
  before production integration.

## Merge note

- Đây là Draft PR.
- Không tự merge.
- Chờ người dùng review và xác nhận các quyết định UI/UX.
