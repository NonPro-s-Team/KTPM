# RMS Domain Business Rule Mapping

Tài liệu này phân định rõ rule nào được một entity/aggregate tự bảo vệ, rule nào cần
Application Service điều phối, và rule nào cần database constraint ở task sau.

> Nguồn đối chiếu: SRS 1.0 được lưu tại
> `docs/SRS/SRS_QuanLyPhongTro.pdf`. Đường dẫn ngắn hơn được nêu trong task
> (`docs/SRS_QuanLyPhongTro.pdf`) không tồn tại.

| Business Rule | Domain/Application | Thành phần dự kiến | Ghi chú |
| --- | --- | --- | --- |
| BR-01 | Application / Authorization | Room application service | Domain không biết JWT hay vai trò của caller. |
| BR-02 | Application + Domain | Room + RentalContract | Application xác định hợp đồng Active; `Room.ChangeStatus` không cho phòng có hợp đồng Active rời Occupied. |
| BR-03 | Application | Contract application service + room repository | Cần truy vấn trạng thái Room trước khi tạo hợp đồng. |
| BR-04 | Application + Database | Contract application service + filtered unique constraint | Cần kiểm tra dữ liệu xuyên aggregate; database constraint chống race condition. |
| BR-05 | Domain | RentalContract | Constructor và cập nhật draft bắt buộc EndDate sau StartDate ít nhất một ngày. |
| BR-06 | Domain + Application | RentalContract + application service | Domain từ chối RoomId/TenantId rỗng; Application kiểm tra bản ghi Room/Tenant thực sự tồn tại. |
| BR-07 | Application transaction | Contract application service | Điều phối `RentalContract.Activate`, chuyển Room sang Occupied và lưu trong cùng transaction. |
| BR-08 | Application transaction | Contract application service | Điều phối `RentalContract.Terminate`, chuyển Room về Available và lưu trong cùng transaction. |
| BR-09 | Domain | Invoice | Constructor/cập nhật draft từ chối chỉ số cuối nhỏ hơn chỉ số đầu. |
| BR-10 | Application + Database | Invoice application service + unique constraint | Unique theo ContractId và kỳ tháng/năm; value object `BillingPeriod` bảo vệ kỳ hợp lệ. |
| BR-11 | Application query filtering + Domain status | Invoice query service | Tenant không nhận Invoice Draft; Domain chỉ quản lý trạng thái Invoice. |
| BR-12 | Domain | Invoice + Payment | `Invoice.RegisterPayment` và Payment từ chối amount không lớn hơn 0. |
| BR-13 | Domain | Invoice | Không cho amount vượt outstanding amount. |
| BR-14 | Domain | Invoice | Thanh toán đủ tự chuyển Invoice sang Paid và ghi PaidAt. |
| BR-15 | Domain | Invoice | Thanh toán dương nhưng chưa đủ tự chuyển Invoice sang PartiallyPaid. |
| BR-16 | Application / Authorization | Contract/Invoice query services | Cần caller identity và ownership query. |
| BR-17 | Application / Authorization + Query | Maintenance application service | Cần xác nhận Tenant sở hữu Active contract của Room. |
| BR-18 | Application / Authorization | Maintenance application service | Domain không xác thực vai trò Admin/Staff. |
| BR-19 | Domain | Invoice | Chỉ Invoice Draft được cập nhật dữ liệu tính tiền; Invoice Paid không thể sửa trực tiếp. |
| BR-20 | Domain + Infrastructure | Invoice/Payment aggregate + persistence | Domain tạo Payment bất biến và lưu vào history; Infrastructure persist cùng Invoice transaction. |

## Tóm tắt ranh giới

- Domain thực thi trực tiếp: BR-05, BR-09, BR-12, BR-13, BR-14, BR-15, BR-19
  và phần invariant nội bộ của BR-02, BR-06, BR-20.
- Application điều phối/ủy quyền: BR-01, BR-02, BR-03, BR-04, BR-06, BR-07,
  BR-08, BR-10, BR-11, BR-16, BR-17, BR-18.
- Database constraint cần bổ sung sau: BR-04 và BR-10.
