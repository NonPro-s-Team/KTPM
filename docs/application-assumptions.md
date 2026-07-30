# RMS Application Layer Assumptions

Các mục dưới đây ghi lại quyết định triển khai tạm thời của tầng Application. Chúng
không thay thế hoặc tự mở rộng yêu cầu chính thức trong SRS 1.0.

1. Domain từ PR #1 đã merge là nguồn sự thật kỹ thuật cho constructor, state
   transition và invariant. Application không sửa `RMS.Domain`.
2. Toàn solution tiếp tục target `net10.0`; nội dung `.NET 8` trong SRS chỉ là mô tả
   môi trường ban đầu.
3. JWT logout trong SRS 1.0 là client xóa access token. Application chỉ xác nhận
   current user đã authenticated; chưa có token blacklist hoặc server-side session.
4. Mật khẩu mới và mật khẩu khởi tạo Tenant phải có tối thiểu 8 ký tự. Đây là
   chính sách tối thiểu ở Application cho tới khi nhóm chốt password policy đầy đủ.
5. Tạo Tenant đồng thời tạo một `User` có role `Tenant` và một hồ sơ `Tenant`, sau đó
   lưu cả hai bằng đúng một `IUnitOfWork.SaveChangesAsync`.
6. `PhoneNumber` và `CitizenId` chưa được enforce unique cho tới khi nhóm xác nhận
   requirement.
7. `Username` và `RoomNumber` được Application pre-check và dự kiến unique tại
   database.
8. Cập nhật hợp đồng Draft chỉ thay đổi `StartDate`, `EndDate` và `MonthlyRent`;
   không đổi `RoomId` hoặc `TenantId`.
9. Hóa đơn lấy `RentalContract.MonthlyRent` làm snapshot giá thuê khi tạo, không lấy
   giá phòng hiện tại.
10. SRS chưa định nghĩa due date và lịch tự động chuyển `Overdue`; Application chưa
    triển khai scheduler hoặc use case tự động này.
11. Không triển khai Cancel Invoice vì SRS không yêu cầu use case đó.
12. Payment không hỗ trợ update, delete, reverse hoặc refund.
13. Tenant tạo Maintenance Request không truyền `RoomId`; hệ thống suy ra phòng từ
    Active Contract của Tenant.
14. MVP giả định một Tenant có tối đa một Active Contract. Repository contract
    `GetActiveContractByTenantIdAsync` phản ánh giả định này.
15. Application chỉ pre-check conflict. Database constraint và concurrency handling
    thuộc Infrastructure.
16. Dashboard là read model/projection, không phải Domain aggregate.
17. Timestamp được lấy từ `IDateTimeProvider`, lưu và xử lý theo UTC. Hiển thị UTC+7
    thuộc API/UI.
18. Application exception chỉ có code/message nghiệp vụ, không chứa HTTP status code
    hoặc stack trace.
19. `GetByIdAsync` cho Tenant/Contract/Invoice/Maintenance phải load navigation hoặc
    collection cần cho response details. `RoomNumber` và `TenantName` trong contract
    response được phép null khi navigation chưa được load.
20. Lịch sử payment được trả theo `PaidAt` tăng dần (cũ đến mới).
21. Outstanding invoice gồm `Issued`, `PartiallyPaid` và `Overdue`. Việc lọc đúng ba
    trạng thái là trách nhiệm của repository implementation.
22. Domain hiện chỉ cho `Invoice.RegisterPayment` ở `Issued` hoặc `PartiallyPaid`.
    Việc cho phép thanh toán invoice `Overdue` cần nhóm xác nhận và thay đổi Domain có
    test hồi quy; Application không bypass invariant này.
23. `ActiveMaintenanceRequests` trên Dashboard gồm `Submitted` và `InProgress`.
    `UnpaidInvoices` gồm `Issued`, `PartiallyPaid` và `Overdue`.
24. Repository implementation sau này phải load `Invoice.Payments` cho invoice
    details/payment history và dữ liệu ownership cần thiết cho query chi tiết.
25. `IDashboardReadRepository` sẽ được Infrastructure triển khai bằng projection
    query; Application không tải toàn bộ entity để tự đếm.
26. Bcrypt, JWT generation, persistence repositories, Unit of Work và system clock
    implementation vẫn chờ Infrastructure; controller và HTTP exception mapping chờ
    API task.
