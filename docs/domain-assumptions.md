# RMS Domain Design Assumptions

Các mục dưới đây là quyết định thiết kế tạm thời để triển khai Domain; chúng không
biến thành yêu cầu SRS chính thức nếu nhóm chưa xác nhận.

1. Domain dùng `Guid` làm khóa chính. Entity mới sinh `Guid` khác rỗng khi được tạo.
2. `Username` dự kiến unique ở database; Domain chỉ kiểm tra bắt buộc và độ dài.
3. `RoomNumber` dự kiến unique ở database; Domain chưa tự truy vấn để kiểm tra trùng.
4. `CitizenId` và `PhoneNumber` chưa áp unique cho tới khi nhóm xác nhận.
5. SRS 1.0 không hỗ trợ hoàn tác, refund hoặc reverse Payment.
6. Overdue chỉ được model bằng enum và domain method; due date/cơ chế tự chuyển
   Overdue sẽ được xác định ở Application task sau.
7. Không triển khai soft delete trong task hiện tại.
8. Timestamp dùng `DateTimeOffset`, được chuẩn hóa về UTC khi lưu trong entity; việc
   hiển thị UTC+7 thuộc API/UI.
9. Invoice lưu snapshot giá thuê, chỉ số và đơn giá điện/nước tại thời điểm tạo hoặc
   khi chỉnh sửa lúc còn Draft.
10. Dashboard là read model/query concern, không phải Domain entity.
11. `BillingPeriod.Year` tạm giới hạn từ 2000 đến 2100 để loại dữ liệu hiển nhiên
    không hợp lệ.
12. Tiền được làm tròn hai chữ số bằng
    `MidpointRounding.AwayFromZero`; chỉ số công tơ vẫn giữ độ chính xác `decimal`.
13. Invoice chỉ nhận payment khi ở Issued hoặc PartiallyPaid theo đặc tả task.
    Quy tắc nhận payment sau khi MarkOverdue cần nhóm xác nhận trong task Application.
14. Invoice có thể bị cancel khi chưa có payment; không hỗ trợ cancel Invoice
    PartiallyPaid hoặc Paid.
15. Các tên cũ `Contract`, `RepairRequest`, `RepairStatus`, `UtilityReading` và
    `BusinessRuleException` đang được Infrastructure/API tham chiếu. Task này giữ
    compatibility shell tối thiểu để solution build, còn migration sang tên mới sẽ
    được xử lý cùng DbContext/Fluent configuration ở task sau.
16. File SRS được lưu trong repository tại `docs/SRS/SRS_QuanLyPhongTro.pdf`.
    Đường dẫn ngắn hơn được nêu trong task (`docs/SRS_QuanLyPhongTro.pdf`) không tồn tại.
    Nội dung task chi tiết được dùng làm nguồn triển khai chính, SRS 1.0 dùng để đối chiếu.
17. MaxLength tạm dùng trong Domain: username 100, password hash 512, họ tên 200,
    số điện thoại 20, CCCD 50, số phòng 50, mô tả phòng 1.000, tiêu đề bảo trì 200,
    mô tả/ghi chú bảo trì 2.000. Các giới hạn này cần được xác nhận trước khi tạo
    Fluent configuration và migration.
18. `Tenant` chỉ giữ `UserId` khác rỗng. Việc xác nhận User tồn tại và có vai trò
    Tenant là kiểm tra xuyên aggregate, do Application thực hiện.
19. `Payment.CreatedAt` dùng cùng timestamp với `PaidAt` vì API domain đăng ký thanh
    toán không nhận một timestamp tạo riêng.
20. `Invoice.Cancel` hiện cho phép trạng thái Draft, Issued hoặc Overdue khi chưa có
    payment. Quy tắc cancel sau khi Issue vẫn cần nhóm xác nhận.
