# Báo cáo ngắn các task của Nhân

Tài liệu này phản ánh trạng thái source và kết quả kiểm tra local ngày 15/09/2026.
Không thay thế trạng thái Jira và không có thao tác commit, push hoặc comment Jira
được thực hiện khi tạo tài liệu này.

## QLPT-253 - Sprint 3 Admin/Dashboard

- **Yêu cầu:** hoàn thiện và kiểm tra phạm vi Admin/Dashboard, gồm API backend,
  giao diện quản trị và kiểm soát quyền truy cập.
- **Đã làm:** hoàn thành các task Postman Admin, unit/integration test, SonarQube và
  CodeceptJS liên quan; bổ sung kiểm tra ADMIN/CUSTOMER cho endpoint quản trị.
- **Luồng:** chạy MySQL/Redis và backend; đăng nhập đúng role; kiểm tra API quản trị;
  chạy Maven test; chạy SonarQube; chạy hành trình giao diện bằng CodeceptJS.
- **Module chính:** các `Admin*Controller`, `DashboardController`, service
  Admin/Dashboard, `AdminControllersUnitTest`,
  `AdminDashboardMockMvcIntegrationTest`, thư mục `quality/sonarqube` và `e2e`.
- **Công cụ:** Spring Boot, JUnit/MockMvc, Postman, SonarQube, CodeceptJS/Playwright.
- **Kiểm tra:** bộ Maven trong `TASK_COMMANDS.md`; SonarQube Quality Gate; hai
  scenario CodeceptJS headed/headless.
- **Kết quả:** backend Admin/Dashboard 25 test PASS; SonarQube Quality Gate PASS;
  CodeceptJS 2/2 scenario PASS. QLPT-253 và các task hỗ trợ 277/278/279 đã Done.

## QLPT-282 - BVA Product/Cart/Promotion

- **Yêu cầu:** thiết kế và thực thi Boundary Value Analysis cho tồn kho/giá Product,
  quantity Cart và giá trị, đơn tối thiểu, lượt dùng Promotion.
- **Đã làm:** tạo workbook BVA, collection Postman có setup/assert/cleanup, chạy các
  ca trên local và cập nhật Actual/Status; log lỗi Cart quantity thập phân thành
  QLPT-342.
- **Luồng:** xác định biên từ DTO/service/schema; chuẩn bị fixture; chạy Setup;
  chạy Product, Cart, Promotion; kiểm tra HTTP, response và trạng thái lưu; tổng hợp
  vào Excel.
- **File/module chính:** `postman/BVA/Nhan/QLPT-282/QLPT-282.postman_collection.json`,
  environment local và workbook BVA của Nhân.
- **Công cụ:** Postman/Newman, Spring Boot API, MySQL, Redis, Excel.
- **Kiểm tra:** Collection Runner `Iterations=1`; kiểm tra cả giá trị tại biên, sát
  biên, ngoài biên và tác dụng phụ.
- **Kết quả:** báo cáo lịch sử đạt Product 9/9, Promotion 40/40 và Cart 22/23; lỗi
  còn lại được ghi nhận ở QLPT-342 và hiện đã Done. Lần chạy hồi quy BVA mới nhất
  đạt 451/451 assertions, không còn failure.

## QLPT-300 - Product API sort theo giá giữ nguyên filter

- **Yêu cầu:** tái hiện và sửa lỗi khi thêm sort giá làm API bỏ qua điều kiện lọc
  sản phẩm.
- **Đã làm:** tái hiện chênh lệch 31 sản phẩm so với 1 sản phẩm khi cùng filter;
  chuyển truy vấn sang custom repository để kết hợp filter, sort và phân trang;
  thêm test hồi quy.
- **Luồng:** dựng request baseline có filter; thêm `sort=price,asc/desc`; so sánh
  tập kết quả; sửa query; chạy unit và integration test; kiểm tra lại FE/API.
- **File/module chính:** `ProductRepository.java`, `ProductRepositoryCustom.java`,
  `ProductRepositoryCustomImpl.java`, `ProductServiceImpl.java`,
  `ProductPriceSortFilterIntegrationTest.java`, `ProductServiceImplTest.java`.
- **Công cụ:** Spring Data JPA/Criteria, JUnit, MockMvc/integration test, Postman và FE.
- **Kiểm tra:** 9/9 test mục tiêu PASS; toàn backend 300 test, 0 failure, 0 error,
  1 skipped; phân trang và hai chiều sort ổn định.
- **Kết quả:** fix nằm ở commit `22a2b21` trên `origin/QLPT-300`; Jira QLPT-300 đã
  Done. Commit này hiện chưa nằm trong `origin/develop`, nên cần PR/merge được nhóm
  duyệt trước khi coi là đã tích hợp vào develop.

## QLPT-347 - Equivalence Partitioning Product/Cart/Promotion

- **Yêu cầu:** dùng EP để chia lớp hợp lệ/không hợp lệ cho tồn kho và bộ lọc giá
  Product, quantity Cart, giá trị/đơn tối thiểu và giới hạn lượt Promotion; thiết
  kế, chạy và tổng hợp.
- **Đã làm:** tạo 46 testcase đại diện cho các lớp, 5 request Setup, collection
  Postman và workbook. Đã đối chiếu DTO/service, không tự đoán constraint.
- **Luồng:** chọn một đại diện cho mỗi lớp; chuẩn bị fixture local; chạy Setup;
  thực thi Product EP và QLPT-350/351/352; đối chiếu HTTP, dữ liệu và trạng thái;
  tổng hợp QLPT-353.
- **File/module chính:**
  `postman/EP/Nhan/QLPT-347/QLPT-347.postman_collection.json`,
  `QLPT-347-EP-Test-Cases.xlsx` và `README.md`.
- **Công cụ:** Postman, Spring Boot API, MySQL, Redis, Excel.
- **Kiểm tra:** 51 request chính gồm 5 Setup + 46 testcase; 260/260 assertions
  PASS; HTTP thực tế khớp Expected cho 46/46 ca. Tổng request HTTP do Newman hiển
  thị có thể lớn hơn vì script dùng `pm.sendRequest` để chuẩn bị/đối chiếu fixture.
- **Kết quả:** Product 9/9 PASS; QLPT-350 10/10 PASS; QLPT-351 13/13 PASS;
  QLPT-352 14/14 PASS; không phát hiện bug mới. Excel, collection và README đã
  được cập nhật trên nhánh `QLPT-347`.

## QLPT-367 - White-box coverage cho bộ BVA + EP

- **Yêu cầu:** dùng bộ BVA và EP đã hoàn thành để thu thập code coverage cho
  Product, Cart và Promotion, sau đó đính kèm ảnh coverage lên Jira.
- **Đã làm:** chạy backend với JaCoCo, chạy lại cả BVA và EP, tạo file execution và
  HTML report; đo thêm một testcase đại diện của từng nhóm để giải thích mức bao phủ.
- **Luồng:** chạy backend có JaCoCo agent; chạy Postman BVA rồi EP; dừng backend để
  ghi `.exec`; sinh report HTML; đọc line/branch/method coverage theo module.
- **Module chính:** `ProductController`/`ProductServiceImpl`,
  `CartController`/`CartServiceImpl`, `AdminPromotionController`,
  `PromotionController`, `AdminPromotionServiceImpl`, `PromotionServiceImpl` và
  luồng áp mã trong `OrderController`/`OrderServiceImpl`.
- **Công cụ:** JaCoCo 0.8.13, Maven, Postman, Spring Boot, MySQL, Redis.
- **Kiểm tra:** BVA 451/451 assertions PASS; EP 260/260 assertions PASS; report
  `backend/target/site/jacoco/index.html` sinh thành công.
- **Kết quả:** không cần sửa production code. Coverage của các module mục tiêu:

| Nhóm | Instruction | Branch | Line | Method |
|---|---:|---:|---:|---:|
| Product API | 52.67% | 48.44% | 61.11% | 38.10% |
| Cart API | 76.72% | 75.00% | 81.25% | 61.11% |
| Promotion API | 80.99% | 61.84% | 87.16% | 80.65% |
| Order promotion flow | 55.32% | 39.86% | 63.69% | 41.18% |
| Tổng các lớp đã chọn | 62.51% | 48.67% | 69.96% | 53.72% |

Một testcase không có phần trăm cố định và các phần trăm không cộng tuyến tính vì
nhiều ca đi qua cùng controller/service. Khi reset JaCoCo và đo riêng, ngoài 5
request Setup: một ca Product đại diện thêm 35 line và 13 branch trong
`ProductServiceImpl`; một ca Cart đạt 28/58 line và 3/12 branch của
`CartServiceImpl`; một ca Promotion đạt 47/81 line và 15/50 branch của
`AdminPromotionServiceImpl`. Không thể lấy `100 / coverage của một ca` để suy ra
số testcase tối thiểu. Muốn 100% phải thiết kế thêm ca cho từng line, từng nhánh và
từng method chưa được gọi, kể cả các chức năng ngoài phạm vi BVA/EP của task.

Chín testcase Product EP bổ sung các lớp tương đương cần báo cáo nhưng không làm
tăng coverage code mục tiêu so với lần đo trước, vì bộ BVA đã đi qua cùng các
line/branch của luồng đọc tồn kho và lọc giá. Đây là chồng lặp coverage hợp lệ giữa
hai kỹ thuật thiết kế test, không phải testcase thừa hay lỗi đo.

### Coverage đo riêng của một testcase đại diện

Mỗi phép đo dưới đây đã reset JaCoCo, chạy 5 request Setup bắt buộc rồi chỉ chạy
thêm một testcase đại diện. Vì vậy đây là số đo của một ca trong môi trường chạy
thực tế, không phải tỷ lệ cố định áp dụng cho mọi testcase.

| Testcase đại diện | Class chính | Line | Branch | Method | Phần tăng riêng so với Setup |
|---|---|---:|---:|---:|---|
| `PROD-MIN-002` | `ProductServiceImpl` | 63/101 = 62.38% | 28/64 = 43.75% | 6/14 = 42.86% | +35 line, +13 branch, +1 method |
| `CART-EP-ADD-VALID` | `CartServiceImpl` | 28/58 = 48.28% | 3/12 = 25.00% | 5/13 = 38.46% | Setup không chạm class này; toàn bộ số trên đến từ luồng Cart |
| `PROMO-EP-PCT-VALID` | `AdminPromotionServiceImpl` | 47/81 = 58.02% | 15/50 = 30.00% | 8/13 = 61.54% | Setup không chạm class này; ca còn đi qua Product/Order để chuẩn bị và kiểm tra fixture |

Riêng `PROD-MIN-002`, 5 request Setup đã chạm 28/101 line, 15/64 branch và
5/14 method của `ProductServiceImpl`. Do đó không được nói testcase Product tự nó
bao phủ 62.38%; phần thực sự tăng thêm của testcase là 35/101 line = 34.65 điểm
phần trăm và 13/64 branch = 20.31 điểm phần trăm.

### Khoảng còn thiếu để đạt 100%

| Nhóm sau khi chạy toàn bộ BVA + EP | Line còn thiếu | Branch còn thiếu | Method còn thiếu |
|---|---:|---:|---:|
| Product API | 42/108 | 33/64 | 13/21 |
| Cart API | 12/64 | 3/12 | 7/18 |
| Promotion API | 19/148 | 29/76 | 6/31 |
| Order promotion flow | 134/369 | 89/148 | 30/51 |

Không thể kết luận chính xác cần thêm bao nhiêu testcase chỉ từ bảng coverage.
Ví dụ, hai testcase cùng đi qua login, đọc sản phẩm và validate DTO có thể bao phủ
lại đúng các line cũ nhưng không mở thêm nhánh mới. Trong giả định cực lý tưởng
rằng mỗi ca mới luôn bao phủ một tập line mới lớn bằng ca đại diện và không hề
chồng lặp, phép tính minh họa cho class service là:

- `ProductServiceImpl`: `ceil((101 - 28) / 35) = 3` ca sau Setup.
- `CartServiceImpl`: `ceil(58 / 28) = 3` ca.
- `AdminPromotionServiceImpl`: `ceil(81 / 47) = 2` ca.

Ba con số trên chỉ là ước lượng lý tưởng để giải thích cách tính, không phải số ca
tối thiểu bảo đảm 100%. Số ca thực tế chỉ xác định được sau khi mở các line/branch
màu đỏ trong JaCoCo, lập danh sách điều kiện chưa đi qua, thiết kế ca cho từng
nhánh và chạy lại đến khi cả line, branch và method đều đạt mục tiêu.

## Checklist hoàn thành QLPT-347

- [x] Đối chiếu Jira với DTO/service/schema thực tế.
- [x] Thiết kế 9 ca Product stock/price filters.
- [x] Thiết kế 10 ca Cart, 13 ca Promotion value/minimum và 14 ca usage limit.
- [x] Collection có Setup, assertions và cleanup/chốt an toàn.
- [x] Chạy đủ 46 testcase trên database local.
- [x] 260/260 assertions PASS, 0 FAIL, 0 error.
- [x] Cập nhật Actual HTTP Status, Actual Result và Status trong Excel.
- [x] Tổng hợp QLPT-353; không có Actual khác Expected nên không log bug mới.
- [x] Người dùng duyệt bổ sung Product EP.
- [ ] Commit/push nhánh `QLPT-347` và cập nhật Jira/subtask.

## Ảnh minh chứng cần chụp cho QLPT-347

1. **Môi trường:** mở Docker Desktop, chụp MySQL và Redis ở trạng thái Running;
   không mở tab Env hoặc lộ mật khẩu.
2. **Backend:** mở terminal backend, chụp dòng `Tomcat started on port 8081`.
3. **API:** mở Postman request Setup hoặc trình duyệt tới
   `/api/products?page=0&size=1`, chụp HTTP 200.
4. **Tổng bộ EP:** Postman > collection QLPT-347 > Run collection > chọn
   `QLPT-282 LOCAL` > `Iterations=1`; chụp màn hình cuối thấy 260 Passed, 0 Failed,
   0 Errors và tên collection/environment.
5. **Product EP:** chụp `PROD-EP-MIN-INCLUDE` và `PROD-EP-MIN-MALFORMED`; ảnh phải
   thấy TC ID, HTTP status và Test Results.
6. **QLPT-350:** chụp một ca hợp lệ `CART-EP-ADD-VALID` và một ca không hợp lệ như
   `CART-EP-ADD-DECIMAL`; ảnh phải thấy TC ID, HTTP và Test Results.
7. **QLPT-351:** chụp `PROMO-EP-PCT-VALID` và `PROMO-EP-PCT-OVER-MAX`.
8. **QLPT-352:** chụp một ca còn lượt và một ca tại/hết giới hạn, ví dụ
   `PROMO-EP-GLOBAL-BELOW-LIMIT` và `PROMO-EP-GLOBAL-AT-LIMIT`.
9. **Excel:** mở sheet Summary, chụp Tổng testcase 46, PASS 46, FAIL 0,
   NOT RUN 0; sau đó chụp vùng Expected/Actual/Status của Product EP, Cart EP và
   Promotion EP.
10. **Jira:** mở QLPT-347 và từng subtask 350-353, đính ảnh đúng phạm vi rồi chụp
   màn hình có issue key, trạng thái và attachment/comment. Chỉ chuyển trạng thái
   sau khi đã duyệt kết quả.

FE không phải minh chứng bắt buộc cho QLPT-347 vì đây là kiểm thử hộp đen ở API.

## Checklist hoàn thành QLPT-367

- [x] Backend chạy với JaCoCo agent.
- [x] Chạy BVA: 451/451 assertions PASS.
- [x] Chạy EP: 260/260 assertions PASS, gồm Product EP 9/9 testcase.
- [x] Sinh `jacoco-qlpt367.exec` và HTML report.
- [x] Tổng hợp coverage Product, Cart, Promotion và Order promotion flow.
- [x] Đo riêng ba testcase đại diện để giải thích coverage theo testcase.
- [x] Không sửa production code ngoài phạm vi.
- [ ] Người dùng chụp và duyệt ảnh coverage.
- [ ] Commit/push tài liệu cần thiết và cập nhật QLPT-367.

## Ảnh minh chứng cần chụp cho QLPT-367

1. **JaCoCo backend:** chụp terminal có lệnh chạy Spring Boot với `javaagent` và
   dòng `Tomcat started on port 8081`; không chụp nội dung `.env`.
2. **BVA:** chạy QLPT-282 trong Postman, chụp Collection Runner thấy 451 Passed,
   0 Failed, 0 Errors.
3. **EP:** chạy QLPT-347, chụp Collection Runner thấy 260 Passed, 0 Failed,
   0 Errors.
4. **Product coverage:** mở
   `backend/target/site/jacoco/com.greenjuicehub.backend.service.product.impl/ProductServiceImpl.html`;
   chụp breadcrumb/tên class và hàng `Total`.
5. **Cart coverage:** mở file report tương tự cho `CartServiceImpl.html`; chụp hàng
   `Total`.
6. **Promotion coverage:** chụp `AdminPromotionServiceImpl.html` và
   `PromotionServiceImpl.html`; nếu cần chứng minh áp mã khi đặt đơn, chụp thêm
   `OrderServiceImpl.html`.
7. **Tổng quan:** quay lại `backend/target/site/jacoco/index.html`, chụp bảng tổng
   coverage và thời điểm report.
8. **Jira:** mở QLPT-367, đính các ảnh Product/Cart/Promotion và hai ảnh runner;
   comment rõ số assertions và bốn loại coverage, sau đó chụp issue key, comment,
   attachment và trạng thái.

Ảnh database/Redis là minh chứng môi trường phụ cho QLPT-367; acceptance chính là
ảnh coverage Product/Cart/Promotion cùng kết quả BVA/EP.
