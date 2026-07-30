# RMS Application Use Case Traceability

| FR | Use Case | Service Method | Repository | Domain Method | Unit Test |
| --- | --- | --- | --- | --- | --- |
| FR-01-01 | Đăng nhập | `AuthService.LoginAsync` | `IUserRepository.GetByUsernameAsync` | `User.RecordFailedLogin`, `RecordSuccessfulLogin` | `Login_ValidCredentials_ReturnsToken`, `Login_InvalidPassword_RecordsFailedAttempt` |
| FR-01-02 | Đăng xuất | `AuthService.LogoutAsync` | Không có server session | Không có | Xác nhận authenticated; API trả 204 và client xóa token ở task sau |
| FR-01-03 | Phân quyền theo role/ownership | `AuthorizationGuard` được mọi service gọi | Query Tenant/ownership theo từng resource | Không có | Các test `*_Tenant_*Forbidden` và `*_OtherTenant_*Forbidden` |
| FR-01-04 | Khóa/mở khóa tài khoản | `AuthService.LoginAsync`, `UnlockUserAsync` | `IUserRepository` | `User.RecordFailedLogin`, `User.Unlock` | `Login_FifthInvalidAttempt_LocksAccount`, `UnlockUser_Admin_UnlocksAccount` |
| FR-01-05 | Đổi mật khẩu | `AuthService.ChangePasswordAsync` | `IUserRepository.GetByIdAsync` | `User.ChangePasswordHash` | `ChangePassword_WrongCurrentPassword_IsRejected`, `ChangePassword_ValidRequest_ChangesHash` |
| FR-02-01 | Xem danh sách phòng có phân trang | `RoomService.GetRoomsAsync` | `IRoomRepository.GetPagedAsync` | Không có | `GetRooms_TenantWithoutFilter_IsAllowed` |
| FR-02-02 | Lọc phòng theo trạng thái | `RoomService.GetRoomsAsync` | `IRoomRepository.GetPagedAsync` | Không có | `GetRooms_TenantWithStatusFilter_IsForbidden` |
| FR-02-03 | Tạo phòng | `RoomService.CreateRoomAsync` | `RoomNumberExistsAsync`, `Add` | Constructor `Room` | `CreateRoom_Admin_CreatesAvailableRoom`, `CreateRoom_DuplicateRoomNumber_ThrowsConflict` |
| FR-02-04 | Cập nhật thông tin phòng | `RoomService.UpdateRoomAsync` | `GetByIdAsync`, `RoomNumberExistsAsync` | `Room.UpdateDetails` | `UpdateRoom_DoesNotChangeStatus` |
| FR-02-05 | Chuyển trạng thái phòng | `RoomService.ChangeRoomStatusAsync` | `GetByIdAsync`, `HasActiveContractForRoomAsync` | `Room.ChangeStatus` | `ChangeStatus_NoActiveContract_AllowsAvailableToMaintenance`, `ChangeStatus_ActiveContract_BlocksLeavingOccupied` |
| FR-03-01 | Tạo hồ sơ và tài khoản Tenant | `TenantService.CreateTenantAsync` | `IUserRepository`, `ITenantRepository` | Constructors `User`, `Tenant` | `CreateTenant_Admin_CreatesUserAndTenant`, `CreateTenant_SavesOnce` |
| FR-03-02 | Tạo hợp đồng Draft | `RentalContractService.CreateDraftAsync` | Room/Tenant lookup; Active Contract check | Constructor `RentalContract` | `CreateDraft_AvailableRoom_CreatesDraft`, các test BR-03/BR-04 |
| FR-03-03 | Kích hoạt hợp đồng | `RentalContractService.ActivateAsync` | Contract/Room lookup; Active Contract recheck | `RentalContract.Activate`, `Room.ChangeStatus` | `Activate_ValidContract_ActivatesAndOccupiesRoom`, `Activate_SavesContractAndRoomOnce` |
| FR-03-04 | Xem hợp đồng | `GetContractAsync`, `GetContractsAsync` | `IRentalContractRepository`; tenant query theo ID | Không có | `GetContract_TenantOwnContract_IsAllowed`, `GetContracts_TenantRepositoryQueryUsesTenantId` |
| FR-03-05 | Chấm dứt hợp đồng | `RentalContractService.TerminateAsync` | Contract/Room lookup | `RentalContract.Terminate`, `Room.ChangeStatus` | `Terminate_ActiveContract_TerminatesAndReleasesRoom` |
| FR-03-06 | Hủy hợp đồng Draft | `RentalContractService.CancelDraftAsync` | `GetByIdAsync` | `RentalContract.Cancel` | `CancelDraft_DoesNotChangeRoomStatus` |
| FR-04-01 | Tạo hóa đơn tháng | `InvoiceService.CreateInvoiceAsync` | Contract lookup; period existence check; `Add` | Constructor `BillingPeriod`, `Invoice` | `CreateInvoice_ActiveContract_CreatesDraftInvoice`, `CreateInvoice_DuplicatePeriod_ThrowsBR10` |
| FR-04-02 | Nhập chỉ số/đơn giá điện nước | `CreateInvoiceAsync`, `UpdateDraftInvoiceAsync` | Invoice/Contract lookup | Constructor `Invoice`, `UpdateDraftReadingsAndPrices` | `CreateInvoice_InvalidReading_PropagatesBR09`, Domain calculation tests |
| FR-04-03 | Phát hành hóa đơn | `InvoiceService.IssueInvoiceAsync` | `IInvoiceRepository.GetByIdAsync` | `Invoice.Issue` | `IssueInvoice_Draft_BecomesIssued` |
| FR-04-04 | Ghi nhận thanh toán | `InvoiceService.RegisterPaymentAsync` | `IInvoiceRepository.GetByIdAsync` | `Invoice.RegisterPayment` | `RegisterPayment_Partial_InvoiceBecomesPartiallyPaid`, `RegisterPayment_Full_InvoiceBecomesPaid` |
| FR-04-05 | Xem công nợ | `GetOutstandingInvoicesAsync`, `GetInvoicesAsync` | Outstanding query theo Tenant hoặc toàn bộ | `Invoice.GetOutstandingAmount` | `GetInvoices_TenantQueryExcludesDraft`, ownership tests |
| FR-04-06 | Xem lịch sử thanh toán | `InvoiceService.GetPaymentHistoryAsync` | Invoice details + ownership | Đọc `Invoice.Payments` | `GetPaymentHistory_OtherTenant_IsForbidden`, Domain payment-history test |
| FR-05-01 | Tạo yêu cầu sửa chữa | `MaintenanceRequestService.CreateAsync` | Current Tenant + Active Contract lookup | Constructor `MaintenanceRequest` | `Create_TenantWithActiveContract_CreatesRequestForActiveRoom`, `Create_TenantWithoutActiveContract_ThrowsBR17` |
| FR-05-02 | Tiếp nhận yêu cầu | `MaintenanceRequestService.StartProgressAsync` | `IMaintenanceRequestRepository.GetByIdAsync` | `MaintenanceRequest.StartProgress` | `StartProgress_Staff_Succeeds`, `StartProgress_Tenant_ThrowsBR18` |
| FR-05-03 | Cập nhật tiến độ/resolve | `AddProgressNoteAsync`, `ResolveAsync` | `IMaintenanceRequestRepository.GetByIdAsync` | `AddProgressNote`, `Resolve` | `Resolve_Staff_Succeeds` + Domain transition/update tests |
| FR-05-04 | Đóng yêu cầu | `MaintenanceRequestService.CloseAsync` | `IMaintenanceRequestRepository.GetByIdAsync` | `MaintenanceRequest.Close` | `Close_Admin_Succeeds` |
| FR-05-05 | Dashboard thống kê | `DashboardService.GetSummaryAsync` | `IDashboardReadRepository.GetSummaryAsync` | Không tạo Domain entity | `GetSummary_Admin_ReturnsProjection`, `GetSummary_Staff_ReturnsProjection` |

## Phần đã định nghĩa abstraction nhưng chờ layer sau

- JWT: `IAccessTokenService` và `AccessTokenResult` đã có; JWT generation, expiry tối
  đa 24 giờ và key/issuer/audience thuộc Infrastructure.
- Password: `IPasswordHasher` đã có; bcrypt salt rounds >= 10 thuộc Infrastructure.
- Current user: `ICurrentUserService` chỉ lộ authentication, `UserId`, `UserRole`;
  đọc JWT claim thuộc API/Infrastructure.
- Persistence: repository/UoW contract đã phục vụ đúng use case; EF Core query,
  Include/projection, mapping và transaction thuộc Infrastructure.
- Logout: API task sau trả 204, client xóa token; chưa có blacklist.
- Dashboard: read projection contract đã có; SQL/EF projection chờ Infrastructure.
- HTTP: controller, status-code mapping, Swagger và middleware chờ API task.
