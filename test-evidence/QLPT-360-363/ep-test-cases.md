# Thiết kế test case EP - QLPT-361, QLPT-362

## Cơ sở xác định miền dữ liệu

- SRS FR-PROD-02: mỗi variant có giá gốc, giá sale, phần trăm giảm và tồn kho riêng.
- SRS FR-ADMIN-PROD-01: chỉ Admin được tạo/sửa variant; Staff chỉ được xem.
- SDD mục `product_variants`: `stock_qty INT NOT NULL DEFAULT 0`, `discount_percent DECIMAL(5,2) NOT NULL DEFAULT 0`.
- `SaveVariantRequest`: `stockQty` là `Integer`, bắt buộc và `>= 0`; `originalPrice`/`salePrice` bắt buộc và `>= 0`; `salePrice <= originalPrice`.
- `AdminProductServiceImpl.calcDiscount`: phần trăm giảm được tính từ giá, không nhận trực tiếp từ request; nếu giá gốc bằng 0 thì kết quả là 0.

SRS/SDD không quy định giới hạn nghiệp vụ tối đa cho tồn kho. Vì vậy miền hợp lệ hiện tại được lấy theo hợp đồng kỹ thuật Java/MySQL: số nguyên từ 0 đến 2.147.483.647.

## Phân hoạch `stockQty`

| Lớp | Dữ liệu đại diện | Kỳ vọng |
|---|---:|---|
| STK-V1 - hợp lệ, hết hàng | 0 | API chấp nhận; lưu/cập nhật đúng 0 |
| STK-V2 - hợp lệ, còn hàng | 25 hoặc 40 | API chấp nhận; lưu/cập nhật đúng giá trị |
| STK-V3 - hợp lệ, cận kỹ thuật trên | 2.147.483.647 | API/service chấp nhận và giữ nguyên |
| STK-I1 - âm | -1 | HTTP 400; không gọi service lưu |
| STK-I2 - null | null | HTTP 400; báo bắt buộc |
| STK-I3 - thiếu trường | không có `stockQty` | HTTP 400; báo bắt buộc |
| STK-I4 - số thập phân | 1.5 | HTTP 400; JSON không hợp lệ cho số nguyên |
| STK-I5 - chuỗi phi số | `"abc"` | HTTP 400; JSON không hợp lệ |
| STK-I6 - vượt `Integer` | 2.147.483.648 | HTTP 400; không để rơi thành lỗi 500 |

## Phân hoạch `discountPercent`

`discountPercent` là trường dẫn xuất. Test case điều khiển `originalPrice` và `salePrice`:

| Lớp | Giá gốc / giá sale | Giảm giá kỳ vọng | Kỳ vọng xử lý |
|---|---:|---:|---|
| DSC-V1 - không giảm | 100.000 / 100.000 | 0,00% | Chấp nhận và lưu 0,00 |
| DSC-V2 - giảm thông thường | 100.000 / 80.000 | 20,00% | Chấp nhận và lưu 20,00 |
| DSC-V3 - giảm thông thường khi update | 100.000 / 75.000 | 25,00% | Chấp nhận và cập nhật 25,00 |
| DSC-V4 - giảm toàn bộ | 100.000 / 0 | 100,00% | Chấp nhận và lưu/cập nhật 100,00 |
| DSC-V5 - cả hai giá bằng 0 | 0 / 0 | 0,00% | Chấp nhận, không chia cho 0 |
| DSC-I1 - giảm âm | 100.000 / 100.001 | Không hợp lệ | HTTP 400; không lưu |
| DSC-I2 - giá gốc âm | -1 / 0 | Không hợp lệ | HTTP 400 |
| DSC-I3 - giá sale âm | 100.000 / -1 | Không hợp lệ | HTTP 400 |
| DSC-I4 - thiếu giá gốc | thiếu / 80.000 | Không hợp lệ | HTTP 400 |
| DSC-I5 - thiếu giá sale | 100.000 / thiếu | Không hợp lệ | HTTP 400 |

## Các luồng được thực thi

| Luồng | Lớp được bao phủ | Điểm kiểm tra |
|---|---|---|
| Admin tạo variant | STK-V2, các lớp STK-I/DSC-I, DSC-V2 | HTTP status, response, service có/không được gọi |
| Admin sửa variant | STK-V1, STK-V2, DSC-V3, DSC-V4, STK-I1 | HTTP status, entity trước/sau, response |
| Service tạo variant | STK-V1/V2/V3, DSC-V1/V2/V4/V5 | đối tượng truyền vào repository và response |
| Service sửa variant | STK-V1/V2, DSC-V3/V4 | entity được cập nhật và response |
| Staff thử tạo variant | lớp quyền không hợp lệ | HTTP 403; service không được gọi |
