# CodeceptJS + Playwright — hướng dẫn cho nhóm

Hạ tầng kiểm thử giao diện Green Juice Hub. Bộ smoke mẫu chạy trên **frontend thật**, không cần tài khoản, MySQL, Redis hay backend. Đây là kiểm thử giao diện và routing, không phải bằng chứng thanh toán/đặt hàng đầu-cuối.

## 1. Cài đặt trên máy mới

Cần Git, Node.js **22.12+** (Node 22 LTS hoặc 24 LTS), npm và mạng để tải dependency/Chromium. Chạy từ gốc repository:

```powershell
cd frontend
npm ci
cd ../e2e
npm ci
npm run browsers:install
npm test
```

Linux CI dùng `npx playwright install --with-deps chromium` để cài thư viện hệ thống. Commit `package-lock.json`; dùng `npm ci` để cả nhóm cài cùng dependency. Không cần cài CodeceptJS global.

`npm test` tự chạy Vite tại `http://127.0.0.1:4173`, chờ frontend sẵn sàng, chạy Chromium headless, rồi dừng Vite. API được ép về local `http://127.0.0.1:8081/api`; smoke không gửi OTP, không đăng nhập thật, không đặt hàng. Google login dùng client ID giả trong chế độ tự khởi động.

## 2. Lệnh chạy

| Lệnh trong e2e | Mục đích |
| --- | --- |
| `npm test` / `npm run test:smoke` | 4 scenario smoke, không cần token |
| `npm run test:headed` | Chạy smoke với cửa sổ Chromium hiển thị |
| `npm run test:list` | Xem scenario và steps, không mở trình duyệt |
| `npm run test:checkout` | Chỉ chạy checkout đã chuẩn bị dữ liệu |

Smoke kiểm tra form đăng nhập, validation số điện thoại trống, redirect checkout khi chưa đăng nhập và trang 404. Mỗi scenario dùng browser context mới; assertion kiểm tra nội dung/element, không chỉ URL.

Dùng frontend local đã chạy sẵn:

```powershell
$env:E2E_BASE_URL = 'http://localhost:5173'
npm test
Remove-Item Env:E2E_BASE_URL
```

Runner không dừng server do bạn tự khởi động. Chỉ chấp nhận URL loopback để tránh vô tình test production. Khi tự chạy frontend, bạn phải cấu hình API trỏ về backend test; không dùng tài khoản thật.

## 3. Kết quả và minh chứng

- `output/junit.xml`: kết quả JUnit, số test và failure.
- `output/login-form.png`, `login-validation.png`, `checkout-login-required.png`, `not-found.png`: ảnh chụp trực tiếp sau các assertion.
- Plugin `screenshotOnFail` tự chụp khi test lỗi vào output.
- `output/frontend.log`: log Vite khi runner tự khởi động frontend.
- Exit code 0: suite đạt; khác 0: setup/test lỗi. Kiểm tra cả exit code và JUnit, không dùng báo cáo cũ để kết luận lần chạy mới.

`output` bị Git ignore. Bộ minh chứng được chọn để đính kèm nằm tại `test-evidence/codeceptjs-playwright/`, không trong docs, không commit ZIP. Xem kỹ screenshot trước khi upload nếu dùng tài khoản/dữ liệu riêng.

## 4. Checkout (không chạy mặc định)

Chuẩn bị backend local, database test, CUSTOMER có địa chỉ nhận hàng và sản phẩm trong giỏ còn tồn kho. Lấy cartItemId của chính khách hàng này từ API giỏ hàng. Chỉ dùng token test qua biến môi trường:

```powershell
$env:E2E_ACCESS_TOKEN = '<JWT của CUSTOMER test>'
$env:E2E_CART_ITEM_IDS = '7,8'
$env:E2E_API_URL = 'http://127.0.0.1:8081/api'
npm run test:checkout
Remove-Item Env:E2E_ACCESS_TOKEN
Remove-Item Env:E2E_CART_ITEM_IDS
Remove-Item Env:E2E_API_URL
```

Helper nạp token vào browser context, reload để Zustand đọc lại session, rồi truyền selectedIds đúng cách React Router dùng. Token được đọc trong custom helper, không đưa vào tham số step/console. Không commit token, cookie hay trace có phiên đăng nhập.

Hai scenario checkout chỉ kiểm tra chọn COD và các phương thức thanh toán hiển thị. **Không bấm đặt hàng**, không xác nhận giao dịch. Token hết hạn/thiếu cart item không được coi là test đạt. Kiểm thử nghiệp vụ thanh toán cần suite riêng và sandbox phù hợp.

## 5. Viết scenario mới

```javascript
Feature('Tên module');
Scenario('Hành vi và kết quả mong đợi', ({ I }) => {
  I.amOnPage('/login');
  I.waitForElement('input[type="tel"]', 15);
  I.click('Tiếp tục');
  I.waitForText('Vui lòng nhập số điện thoại', 10);
});
```

Đặt file trong tests/ và khai báo suite/config tương ứng. Smoke mặc định chỉ nhận smoke_test.js để test cần tài khoản không lẫn vào smoke. Ưu tiên data-testid, label hoặc nội dung ổn định; tránh XPath theo vị trí. Dùng waitForElement/waitForText thay cho chờ cứng. Thêm bước chung vào steps_file.js; thao tác cần giấu secret đặt trong helpers/Session.js.

## 6. CI và xử lý lỗi

Workflow `.github/workflows/e2e-smoke.yml` chạy smoke khi PR thay đổi frontend/e2e, hoặc chạy thủ công. Không cần repository secret. JUnit, ảnh và log được lưu thành artifact 7 ngày kể cả khi job lỗi. Workflow cần được push trước khi chạy trên GitHub.

| Lỗi | Cách xử lý |
| --- | --- |
| Không tìm thấy node/npm | Cài Node LTS, mở terminal mới, kiểm tra node -v |
| Thiếu Vite | Chạy npm ci trong frontend |
| Thiếu Chromium | Chạy npm run browsers:install trong e2e |
| Port 4173 bị chiếm | Dừng server trùng hoặc dùng E2E_BASE_URL |
| Checkout về login | Kiểm tra token CUSTOMER còn hạn và API local |
| Checkout về products | Kiểm tra E2E_CART_ITEM_IDS thuộc khách hàng và giỏ không rỗng |
| Timeout | Xem output/frontend.log, ảnh failure, JUnit; chạy test:headed |

Tham khảo: [cấu hình CodeceptJS](https://codecept.io/configuration/), [reporter](https://codecept.io/reports), [Playwright helper](https://codecept.io/helpers/Playwright/).
