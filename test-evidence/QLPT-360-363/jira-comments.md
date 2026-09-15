# Jira comment drafts — QLPT-360 đến QLPT-363

## QLPT-360 — [EP] Thiện — Admin: tồn kho & giảm giá biến thể sản phẩm

ĐÃ HOÀN THÀNH PHẠM VI EP CHO ADMIN PRODUCT VARIANT

1. Phạm vi thực hiện
- Đã đối chiếu yêu cầu Jira với SRS/SDD, schema `product_variants`, DTO `SaveVariantRequest`, `AdminProductController` và `AdminProductServiceImpl` trên source code thực tế.
- Đã thiết kế và tự động hóa kiểm thử Equivalence Partitioning cho hai trường trọng tâm: `stockQty` và `discountPercent`.
- Đã kiểm tra cả hai luồng ADMIN:
  - Tạo variant: `POST /api/admin/products/{productId}/variants`.
  - Cập nhật variant: `PUT /api/admin/products/variants/{variantId}`.
- Đã kiểm tra phân quyền: ADMIN được tạo/sửa; STAFF gửi payload hợp lệ vẫn nhận HTTP 403 và service không được gọi.
- Đã kiểm tra ở hai tầng:
  - Controller/API boundary: HTTP status, response JSON, validation message, xác nhận service có/không được gọi.
  - Service/persistence: dùng `ArgumentCaptor<ProductVariant>` để xác nhận chính xác `stockQty` và `discountPercent` được đưa vào entity trước khi repository lưu.

2. Mã kiểm thử đã bổ sung
- `backend/src/test/java/com/greenjuicehub/backend/controller/AdminProductVariantEquivalencePartitioningTest.java`.
- `backend/src/test/java/com/greenjuicehub/backend/service/product/AdminProductVariantPersistenceEpTest.java`.
- Tổng cộng 21 lượt test EP mới: 15 test controller + 6 test service/persistence.

3. Các nhóm dữ liệu chính đã bao phủ
- Tồn kho hợp lệ: 0, số dương thông thường (25/40), cận kỹ thuật trên `Integer.MAX_VALUE = 2.147.483.647`.
- Tồn kho không hợp lệ: số âm, null, thiếu trường, số thập phân, chuỗi phi số, vượt giới hạn Integer.
- Giảm giá hợp lệ thông qua cặp `originalPrice/salePrice`: 0%, 20%, 25%, 100% và trường hợp 0/0 không chia cho 0.
- Giá không hợp lệ: `salePrice > originalPrice`, giá gốc âm, giá sale âm, thiếu giá gốc, thiếu giá sale.

4. Kết quả thực thi
- `AdminProductVariantEquivalencePartitioningTest`: 15/15 PASS.
- `AdminProductVariantPersistenceEpTest`: 6/6 PASS.
- Chạy kèm 3 test hồi quy liên quan: tổng 24/24 PASS, 0 Fail, 0 Error, 0 Skip, BUILD SUCCESS.
- Chạy toàn bộ backend: 318 test, 0 Fail, 0 Error, 2 Skip có sẵn, BUILD SUCCESS.
- Không phát hiện bug mới trong phạm vi chạy tự động.
- Hồi quy QLPT-303 PASS: `salePrice > originalPrice` trả HTTP 400 và không lưu.
- Hồi quy QLPT-365 PASS: stock sai kiểu/vượt Integer trả HTTP 400 thay vì 500.

5. Tài liệu/bằng chứng bàn giao
- `test-evidence/QLPT-360-363/ep-test-cases.md`: căn cứ đặc tả, lớp tương đương và expected result.
- `test-evidence/QLPT-360-363/variant-fixtures.md`: dữ liệu variant đại diện để nhóm Customer test sử dụng chung.
- `test-evidence/QLPT-360-363/execution-summary.md`: môi trường, lệnh chạy, kết quả, bug và rủi ro.
- `test-evidence/QLPT-360-363/test-run.txt`: tổng kết nguyên bản từ Maven Surefire.

6. Thông tin nhánh
- Branch: `QLPT-360-361-362-363`.
- Base: `develop` mới nhất tại thời điểm bắt đầu, commit `5a77271`.
- Không sửa production code trong phạm vi task này; chỉ bổ sung mã test và tài liệu evidence vì các lỗi hồi quy liên quan đã được xử lý trên develop.

Kết luận: phạm vi QLPT-360 đã có đủ thiết kế EP, mã test tự động, kết quả thực thi và bằng chứng bàn giao. Kết quả hiện tại: PASS.

## QLPT-361 — EP tồn kho biến thể sản phẩm (`product_variants.stock_qty`)

ĐÃ HOÀN THÀNH THIẾT KẾ VÀ THỰC THI EP CHO `stock_qty`

1. Căn cứ xác định miền dữ liệu
- SDD/schema: `stock_qty INT NOT NULL DEFAULT 0`.
- DTO `SaveVariantRequest`: `stockQty` là `Integer`, bắt buộc và phải `>= 0`.
- SRS/SDD hiện chưa quy định trần tồn kho ở mức nghiệp vụ. Vì vậy miền hợp lệ hiện tại được xác định theo hợp đồng kỹ thuật Java/MySQL: từ 0 đến 2.147.483.647.
- Đã kiểm tra validation JSON/Bean Validation tại controller và kiểm tra giá trị entity tại service/repository boundary.

2. Các lớp tương đương hợp lệ
- STK-V1 — hết hàng: `stockQty = 0`; API chấp nhận, trả đúng 0 và lưu/cập nhật entity đúng 0.
- STK-V2 — còn hàng thông thường: `stockQty = 25` khi create và `40` khi update; API chấp nhận và giữ nguyên giá trị xuyên suốt request → service → entity → response.
- STK-V3 — cận kỹ thuật trên: `stockQty = 2.147.483.647`; service chấp nhận, repository nhận đúng giá trị, response không bị tràn hoặc thay đổi.

3. Các lớp tương đương không hợp lệ
- STK-I1 — số âm: `-1` → HTTP 400, message chứa `Tồn kho phải >= 0`.
- STK-I2 — null: `stockQty: null` → HTTP 400, message chứa `Tồn kho không được để trống`.
- STK-I3 — thiếu trường `stockQty` → HTTP 400, báo bắt buộc.
- STK-I4 — số thập phân: `1.5` → HTTP 400, `Dữ liệu JSON không hợp lệ`; không được âm thầm ép thành 1.
- STK-I5 — chuỗi phi số: `"abc"` → HTTP 400, JSON không hợp lệ.
- STK-I6 — vượt Integer: `2.147.483.648` → HTTP 400; xác nhận không còn rơi thành HTTP 500.
- Với mọi lớp không hợp lệ, Mockito `verify(..., never())` xác nhận service create/update không được gọi, nên không có dữ liệu lỗi đi xuống tầng lưu trữ.

4. Luồng và quyền đã kiểm tra
- ADMIN create variant: expected HTTP 201; xác nhận `$.stockQty`, response và lời gọi `createVariant(productId, request)`.
- ADMIN update variant: expected HTTP 200; xác nhận entity cũ được cập nhật đúng và response phản ánh đúng tồn kho mới.
- STAFF create variant với payload hợp lệ: HTTP 403; service không được gọi.
- Service create/update: dùng `ArgumentCaptor` kiểm tra `ProductVariant.stockQty` trước khi repository save.

5. Kết quả
- Controller EP suite: 15/15 PASS (bao gồm các case stock/discount/API quyền).
- Persistence EP suite: 6/6 PASS; các đại diện stock create gồm 0, 25, 2.147.483.647 và 10; update gồm 0 và 40.
- Hồi quy QLPT-365 PASS: stockQty sai kiểu hoặc vượt Integer trả HTTP 400 thay vì 500.
- Không phát hiện sai lệch mới giữa Expected Result và Actual Result.

6. Dữ liệu chia sẻ cho nhóm Customer test
- `EP-ADMIN-OOS`: originalPrice 100000, salePrice 100000, stockQty 0, discount kỳ vọng 0%.
- `EP-ADMIN-NORMAL`: originalPrice 100000, salePrice 80000, stockQty 25, discount kỳ vọng 20%.
- Không khuyến nghị tạo fixture `stockQty = 2.147.483.647` trên môi trường dùng chung; case cận kỹ thuật này đã được bao phủ bằng test tự động.

7. Rủi ro còn lại
- Chưa có yêu cầu về giới hạn tồn kho tối đa ở mức nghiệp vụ. Hệ thống hiện chấp nhận đến `Integer.MAX_VALUE`; chưa phân loại là bug vì không trái SRS/SDD hiện hành.
- Phần persistence dùng repository mock; nên bổ sung một lượt smoke test trên môi trường triển khai/MySQL thật khi release.

Mã test: `AdminProductVariantEquivalencePartitioningTest.java` và `AdminProductVariantPersistenceEpTest.java`.
Kết luận: PASS.

## QLPT-362 — EP phần trăm giảm giá biến thể (`product_variants.discount_percent`)

ĐÃ HOÀN THÀNH THIẾT KẾ VÀ THỰC THI EP CHO `discount_percent`

1. Căn cứ nghiệp vụ/kỹ thuật
- `discountPercent` là trường dẫn xuất, không nhận trực tiếp từ request.
- Input điều khiển gồm `originalPrice` và `salePrice` trong `SaveVariantRequest`.
- Hai giá bắt buộc, phải `>= 0`, đồng thời `salePrice <= originalPrice`.
- `AdminProductServiceImpl.calcDiscount` tính phần trăm giảm từ giá; nếu `originalPrice = 0` thì trả 0 để tránh chia cho 0.
- Đã kiểm tra cả giá trị trả về API và giá trị thực tế gán vào `ProductVariant.discountPercent` trước khi repository save.

2. Các lớp tương đương hợp lệ
- DSC-V1 — không giảm: 100.000 / 100.000 → kỳ vọng 0,00%; create lưu và trả đúng 0,00.
- DSC-V2 — giảm thông thường: 100.000 / 80.000 → kỳ vọng 20,00%; create lưu và trả đúng 20,00.
- DSC-V3 — giảm thông thường khi update: 100.000 / 75.000 → kỳ vọng 25,00%; entity và response cùng đúng 25,00.
- DSC-V4 — giảm toàn bộ: 100.000 / 0 → kỳ vọng 100,00%; create/update xử lý đúng, không xuất hiện giá trị âm hoặc sai dấu.
- DSC-V5 — cả hai giá bằng 0: 0 / 0 → kỳ vọng 0,00%; không phát sinh phép chia cho 0.

3. Các lớp tương đương không hợp lệ
- DSC-I1 — `salePrice = 100001` lớn hơn `originalPrice = 100000` → HTTP 400, message `Giá sale phải nhỏ hơn hoặc bằng giá gốc`; service không được gọi.
- DSC-I2 — giá gốc âm `-1` → HTTP 400.
- DSC-I3 — giá sale âm `-1` → HTTP 400, message `Giá sale phải >= 0`.
- DSC-I4 — thiếu `originalPrice` → HTTP 400, báo trường bắt buộc.
- DSC-I5 — thiếu `salePrice` → HTTP 400, báo trường bắt buộc.
- Với tất cả lớp không hợp lệ, xác nhận không gọi service lưu dữ liệu.

4. Kiểm tra create/update và persistence
- Controller create: status 201, response chứa đúng `discountPercent = 20.00` cho lớp giảm thông thường.
- Controller update: status 200, response chứa `discountPercent = 100.00` cho lớp giảm toàn bộ.
- Service create được chạy tham số hóa cho 0%, 20%, 100% và 0/0.
- Service update được chạy tham số hóa cho 100% và 25%.
- Dùng `ArgumentCaptor<ProductVariant>` xác nhận giá trị discount trong entity, không chỉ kiểm tra DTO response.

5. Kết quả và hồi quy
- Toàn bộ 21 test EP mới PASS; bộ chọn lọc 24/24 PASS, 0 Fail, 0 Error, BUILD SUCCESS.
- Hồi quy QLPT-303 PASS: `salePrice > originalPrice` trả 400, không còn chấp nhận input rồi ép discount âm về 0%.
- Case giảm 100% và 0/0 đều PASS ở tầng controller/service.
- Không phát hiện bug mới trong phạm vi này.

6. Variant chia sẻ cho nhóm Customer test
- `EP-ADMIN-NORMAL`: 100000/80000, stockQty 25, discount kỳ vọng 20%.
- `EP-ADMIN-FREE`: 100000/0, stockQty 10, discount kỳ vọng 100%.
- `EP-ADMIN-ZERO-PRICE`: 0/0, stockQty 10, discount kỳ vọng 0%.
- Khi tạo trên môi trường dùng chung, thay `productId`, `flavorId`, `sizeId` bằng dữ liệu hợp lệ của môi trường.

Mã test: `AdminProductVariantEquivalencePartitioningTest.java` và `AdminProductVariantPersistenceEpTest.java`.
Kết luận: PASS.

## QLPT-363 — Tổng hợp kết quả & báo cáo bug module Admin

ĐÃ HOÀN THÀNH TỔNG HỢP KẾT QUẢ KIỂM THỬ EP MODULE ADMIN

1. Môi trường thực thi
- Ngày chạy: 14/09/2026, múi giờ Asia/Saigon.
- Branch: `QLPT-360-361-362-363`.
- Base develop: commit `5a77271`.
- Runtime: Maven 3.9.11, Eclipse Temurin JDK 21, Docker.
- Framework: JUnit Jupiter, Spring MockMvc, Mockito, AssertJ.

2. Lệnh chạy bộ chọn lọc
`docker run --rm -v "D:\KTPM:/workspace" -v "C:\Users\Thien\.m2:/root/.m2" -w /workspace/backend maven:3.9.11-eclipse-temurin-21 mvn "-Dtest=AdminProductVariantEquivalencePartitioningTest,AdminProductVariantPersistenceEpTest,AdminProductControllerMockMvcIntegrationTest,AdminProductServiceImplTest" test`

3. Kết quả theo test suite
- `AdminProductVariantEquivalencePartitioningTest`: Run 15, Pass 15, Fail 0, Error 0, Skip 0.
- `AdminProductVariantPersistenceEpTest`: Run 6, Pass 6, Fail 0, Error 0, Skip 0.
- `AdminProductControllerMockMvcIntegrationTest`: Run 1, Pass 1.
- `AdminProductServiceImplTest`: Run 2, Pass 2.
- Tổng bộ chọn lọc: 24/24 PASS, Fail 0, Error 0, Skip 0, BUILD SUCCESS, thời gian 01:10 phút.
- Full backend regression: 318 test, Fail 0, Error 0, Skip 2 có sẵn, BUILD SUCCESS, thời gian 02:17 phút.

4. Đối chiếu Expected/Actual
- QLPT-361: hoàn tất phân hoạch hợp lệ/không hợp lệ cho `stock_qty`; create/update và persistence đều đúng Expected Result.
- QLPT-362: hoàn tất phân hoạch `discount_percent` thông qua cặp giá gốc/sale; 0%, 20%, 25%, 100% và 0/0 đều đúng Expected Result.
- Phân quyền: STAFF không thể tạo variant, trả HTTP 403; đúng expected.
- Input invalid không đi xuống service/repository; đúng expected.

5. Bug và phân loại
- Không phát hiện bug mới trong lượt chạy tự động này.
- QLPT-303 (đã Done): regression PASS; `salePrice > originalPrice` trả 400 và không lưu.
- QLPT-365 (đã Done): regression PASS; stockQty thập phân/chuỗi/vượt Integer trả 400 thay vì 500.
- Vì không có sai lệch mới giữa Actual Result và Expected Result nên không tạo thêm bug report cho Sprint 7 trong phạm vi QLPT-360–363.

6. Variant test bàn giao để dùng chung
- `EP-ADMIN-OOS`: originalPrice 100000, salePrice 100000, stockQty 0, discount 0%.
- `EP-ADMIN-NORMAL`: originalPrice 100000, salePrice 80000, stockQty 25, discount 20%.
- `EP-ADMIN-FREE`: originalPrice 100000, salePrice 0, stockQty 10, discount 100%.
- `EP-ADMIN-ZERO-PRICE`: originalPrice 0, salePrice 0, stockQty 10, discount 0%.
- Payload mẫu và hướng dẫn thay ID môi trường được ghi trong `variant-fixtures.md`.

7. Tệp báo cáo cuối
- `ep-test-cases.md`: nguồn đặc tả, ma trận lớp tương đương và điểm kiểm tra.
- `variant-fixtures.md`: dữ liệu chia sẻ cho kiểm thử Customer.
- `execution-summary.md`: môi trường, lệnh chạy, kết quả, bug và rủi ro.
- `test-run.txt`: kết quả Maven Surefire nguyên bản.

8. Rủi ro/giới hạn còn lại
- SRS/SDD chưa quy định giới hạn tồn kho tối đa ở mức nghiệp vụ; hiện hệ thống chấp nhận tới Integer.MAX_VALUE. Đây là điểm cần Product Owner xác nhận nếu muốn áp dụng trần kinh doanh cụ thể.
- Kiểm thử persistence hiện dùng repository mock, chưa thay thế lượt smoke test trên môi trường triển khai thật và MySQL thật.
- Hai test Skip trong full backend là test đã có sẵn, không phát sinh từ thay đổi Sprint 7.

Kết luận chung: PASS. Đủ số liệu Pass/Fail, đối chiếu đặc tả/source, fixture chia sẻ và đánh giá bug/rủi ro. Không cần sửa production code trong phạm vi QLPT-360–363.
