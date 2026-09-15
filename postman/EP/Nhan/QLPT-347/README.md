# QLPT-347 - Equivalence Partitioning cho Product/Cart/Promotion

## Mục đích

Thư mục này chứa bộ kiểm thử hộp đen theo kỹ thuật **Equivalence Partitioning (EP)** cho task QLPT-347 và ba subtask:

- **QLPT-347:** phân lớp tồn kho và bộ lọc giá của Product theo trạng thái stock, tham số có/không có và kiểu dữ liệu.
- **QLPT-350:** phân lớp `quantity` của Cart theo kiểu dữ liệu, giá trị tối thiểu và tồn kho.
- **QLPT-351:** phân lớp `value`, `type`, `minOrderValue` và điều kiện đơn tối thiểu của Promotion.
- **QLPT-352:** phân lớp `maxUses`, `maxUsesPerUser`, quan hệ giữa hai giới hạn và trạng thái còn/hết lượt.
- **QLPT-353:** tổng hợp kết quả sau khi chạy; chỉ ghi bug khi Actual khác Expected và đã tái hiện độc lập.

## File sử dụng

- `QLPT-347.postman_collection.json`: collection có 5 request Setup và 46 testcase EP.
- `QLPT-347-EP-Test-Cases.xlsx`: bảng thiết kế và kết quả testcase theo format báo cáo chung của nhóm.
- Tái sử dụng environment local tại `postman/BVA/Nhan/QLPT-282/QLPT-282.postman_environment.json`; không tạo thêm environment trùng lặp.

## Cấu trúc collection

1. `Setup` - kiểm tra backend, đăng nhập Customer/Admin và xác nhận đúng tài khoản test.
2. `QLPT-347 - Product stock and price filters` - 9 testcase.
3. `QLPT-350 - Cart quantity` - 10 testcase.
4. `QLPT-351 - Promotion value and minimum` - 13 testcase.
5. `QLPT-352 - Promotion usage limits` - 14 testcase.

Mỗi testcase chọn **một giá trị đại diện** cho một lớp tương đương. Ví dụ, lớp hợp lệ của `quantity` là số nguyên từ `1` đến tồn kho `S`; giá trị `5` đại diện cho lớp này. Các lớp `quantity < 1`, `quantity > S`, `null` và số không nguyên được kiểm thử bằng các request riêng.

## Chuẩn bị trước khi chạy

1. Chạy MySQL và Redis local bằng Docker.
2. Chạy backend và chờ log `Tomcat started on port 8081`.
3. Kiểm tra `http://localhost:8081/api/products?page=0&size=1` trả HTTP 200.
4. Trong Postman, import collection `QLPT-347.postman_collection.json`.
5. Import hoặc chọn environment `QLPT-282 LOCAL` đã dùng cho BVA.
6. Kiểm tra `base_url=http://localhost:8081` và các ID fixture đúng database local.

## Bật quyền ghi dữ liệu test

Chỉ bật ba biến sau khi chắc chắn đang dùng database local dành cho kiểm thử:

| Biến | Giá trị khi chạy | Tác dụng |
|---|---:|---|
| `dedicated_test_data_confirmed` | `true` | Xác nhận đây là fixture test riêng. |
| `allow_test_writes` | `true` | Cho phép tạo/xóa cart item và promotion fixture. |
| `allow_order_creation` | `true` | Cho phép các ca giới hạn lượt tạo đơn COD để tăng usage. |

Sau khi chụp đủ minh chứng, đặt ba biến về `false`.

## Cách chạy trong Postman

1. Mở collection **QLPT-347 - Nhan - Product Cart Promotion EP**.
2. Chọn **Run collection**.
3. Chọn environment **QLPT-282 LOCAL**.
4. Giữ đúng thứ tự folder, đặt `Iterations = 1`, không chọn data file.
5. Bấm **Run QLPT-347...** và không chạy song song một collection khác trên cùng fixture.
6. Kết quả hoàn chỉnh phải có đủ 5 request Setup và 46 testcase EP, `Errors = 0`. Một testcase chỉ được ghi `PASS` khi toàn bộ assertion của request đó đều pass.

Nếu Setup thất bại thì dừng, sửa môi trường rồi chạy lại từ đầu. Không dùng kết quả các request phía sau khi token, fixture hoặc backend chưa hợp lệ.

## Ghi kết quả vào Excel

Với từng TC ID, điền đúng ba cột kết quả:

- `Actual HTTP Status`: status thật mà Postman nhận được.
- `Actual Result`: mô tả ngắn dữ liệu thật và assertion chính, không chép nguyên response dài.
- `Status`: `PASS` nếu Actual khớp Expected; `FAIL` nếu khác; giữ `NOT RUN` nếu chưa chạy.

Chỉ điền `Bug ID` sau khi:

1. chạy lại riêng testcase ít nhất hai lần;
2. kiểm tra request, token, fixture và thứ tự chạy đều đúng;
3. tái hiện được Actual khác Expected;
4. xác định lỗi không đến từ script Postman hoặc dữ liệu local sai.

## Minh chứng cần chụp cho Jira

1. Ảnh Collection Runner nhìn rõ tên collection, environment, tổng số test, Passed, Failed và Errors.
2. Ảnh một ca Product hợp lệ và một ca sai kiểu, có TC ID, HTTP status và Test Results.
3. Ảnh một ca hợp lệ và một ca không hợp lệ của QLPT-350, có TC ID và Test Results.
4. Ảnh một ca hợp lệ và một ca không hợp lệ của QLPT-351, có HTTP status và assertions.
5. Ảnh một ca còn lượt và một ca hết lượt của QLPT-352.
6. Ảnh Excel cho thấy TC ID, lớp tương đương, Expected, Actual và Status đã điền.

Không chụp token, mật khẩu hoặc nội dung file `.env`.

## Kết quả thực thi ngày 15/09/2026

- Môi trường: API local `http://localhost:8081`, MySQL và Redis local.
- Phạm vi chạy: 5 request Setup và toàn bộ 46 testcase EP.
- Kết quả: 51 request chính hoàn tất, 260/260 assertions PASS, 0 FAIL, 0 error. Newman có thể hiển thị tổng request HTTP lớn hơn vì các script dùng `pm.sendRequest` để chuẩn bị và đối chiếu fixture.
- QLPT-347 Product stock/price filters: 9/9 testcase PASS.
- QLPT-350 Cart quantity: 10/10 testcase PASS.
- QLPT-351 Promotion value/minimum: 13/13 testcase PASS.
- QLPT-352 Promotion usage limits: 14/14 testcase PASS.
- HTTP thực tế của cả 46 testcase khớp với cột `Expected HTTP Status`.
- Không có Actual khác Expected sau lần chạy này, vì vậy không ghi nhận bug mới cho QLPT-353.

File Excel đã được cập nhật ba cột `Actual HTTP Status`, `Actual Result` và
`Status` theo đúng TC ID của lần chạy trên. Các cột thiết kế, Expected Result và
Bug ID không bị thay đổi.
