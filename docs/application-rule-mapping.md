# RMS Application Business Rule Mapping

| BR | Use Case | Application Service | Domain Method | Repository Check | Test |
| --- | --- | --- | --- | --- | --- |
| BR-01 | Tạo/cập nhật/chuyển trạng thái phòng | `RoomService` + `AuthorizationGuard.EnsureAdminOrStaff` | `Room.UpdateDetails`, `Room.ChangeStatus` | `RoomNumberExistsAsync`; `HasActiveContractForRoomAsync` | `CreateRoom_Tenant_IsForbidden`, `UpdateRoom_DoesNotChangeStatus` |
| BR-02 | Chuyển trạng thái phòng, chấm dứt hợp đồng | `RoomService.ChangeRoomStatusAsync`, `RentalContractService.TerminateAsync` | `Room.ChangeStatus` | `HasActiveContractForRoomAsync` | `ChangeStatus_ActiveContract_BlocksLeavingOccupied`, `Terminate_ActiveContract_TerminatesAndReleasesRoom` |
| BR-03 | Tạo/kích hoạt hợp đồng chỉ với phòng Available | `RentalContractService` | Không có method riêng; Application đọc `Room.Status` | `IRoomRepository.GetByIdAsync` | `CreateDraft_OccupiedRoom_ThrowsBR03`, `CreateDraft_MaintenanceRoom_ThrowsBR03`, `Activate_RoomNoLongerAvailable_IsRejected` |
| BR-04 | Một Active Contract trên mỗi phòng | `RentalContractService.CreateDraftAsync`, `ActivateAsync` | `RentalContract.Activate` | `HasActiveContractForRoomAsync` | `CreateDraft_ExistingActiveContract_ThrowsBR04`, `Activate_AnotherActiveContractExists_IsRejected` |
| BR-05 | EndDate sau StartDate | `RentalContractService` truyền request vào Domain | Constructor và `RentalContract.UpdateDraftTerms` | Không cần | Domain `Constructor_EndDateNotAfterStartDate_ThrowsBusinessRuleViolation` |
| BR-06 | Hợp đồng có Room/Tenant hợp lệ | `RentalContractService.CreateDraftAsync`, `ActivateAsync` | Constructor guard `RoomId`/`TenantId` | `Room.GetByIdAsync`, `Tenant.GetByIdAsync` | `CreateDraft_MissingRoom_ThrowsNotFound`, `CreateDraft_MissingTenant_ThrowsNotFound` |
| BR-07 | Activate Contract đồng thời Occupy Room | `RentalContractService.ActivateAsync` | `RentalContract.Activate`, `Room.ChangeStatus` | Recheck room và Active Contract khác | `Activate_ValidContract_ActivatesAndOccupiesRoom`, `Activate_SavesContractAndRoomOnce` |
| BR-08 | Terminate Contract đồng thời release Room | `RentalContractService.TerminateAsync` | `RentalContract.Terminate`, `Room.ChangeStatus` | Load Contract và Room | `Terminate_ActiveContract_TerminatesAndReleasesRoom` |
| BR-09 | Chỉ số cuối không nhỏ hơn chỉ số đầu | `InvoiceService.CreateInvoiceAsync`, `UpdateDraftInvoiceAsync` | Constructor và `Invoice.UpdateDraftReadingsAndPrices` | Không cần | `CreateInvoice_InvalidReading_PropagatesBR09` + Domain Invoice tests |
| BR-10 | Một invoice mỗi Contract/kỳ | `InvoiceService.CreateInvoiceAsync` | `BillingPeriod` bảo vệ kỳ hợp lệ | `ExistsForContractAndPeriodAsync` | `CreateInvoice_DuplicatePeriod_ThrowsBR10` |
| BR-11 | Tenant không thấy Draft invoice | `InvoiceService.GetInvoiceAsync`, `GetInvoicesAsync` | Đọc `Invoice.Status` | Tenant query dùng `includeDraft: false` | `GetInvoice_TenantCannotSeeDraft`, `GetInvoices_TenantQueryExcludesDraft` |
| BR-12 | Payment amount > 0 | `InvoiceService.RegisterPaymentAsync` | `Invoice.RegisterPayment` | Không cần | Domain `RegisterPayment_ZeroAmount_ThrowsBusinessRuleViolationException` |
| BR-13 | Không overpay | `InvoiceService.RegisterPaymentAsync` | `Invoice.RegisterPayment` | Load invoice hiện tại | `RegisterPayment_Overpayment_PropagatesBR13` |
| BR-14 | Thanh toán đủ chuyển Paid | `InvoiceService.RegisterPaymentAsync` | `Invoice.RegisterPayment` | Load invoice hiện tại | `RegisterPayment_Full_InvoiceBecomesPaid` |
| BR-15 | Thanh toán một phần chuyển PartiallyPaid | `InvoiceService.RegisterPaymentAsync` | `Invoice.RegisterPayment` | Load invoice hiện tại | `RegisterPayment_Partial_InvoiceBecomesPartiallyPaid` |
| BR-16 | Tenant chỉ xem dữ liệu của mình | `TenantService`, `RentalContractService`, `InvoiceService`, `MaintenanceRequestService` | Không thuộc Domain | Tenant query theo `TenantId`; `IsOwnedByTenantAsync` | `GetTenant_OtherTenant_IsForbidden`, `GetContract_OtherTenantContract_IsForbidden`, `GetInvoice_OtherTenant_IsForbidden`, `GetById_OtherTenantRequest_IsForbidden` |
| BR-17 | Tenant chỉ tạo maintenance cho phòng đang thuê | `MaintenanceRequestService.CreateAsync` | Constructor `MaintenanceRequest` | `GetActiveContractByTenantIdAsync` | `Create_TenantWithoutActiveContract_ThrowsBR17`, `Create_TenantWithActiveContract_CreatesRequestForActiveRoom` |
| BR-18 | Chỉ Admin/Staff cập nhật maintenance | `MaintenanceRequestService` + `AuthorizationGuard` | Các transition method của `MaintenanceRequest` | Load request sau authorization | `StartProgress_Tenant_ThrowsBR18`, `StartProgress_Staff_Succeeds` |
| BR-19 | Paid invoice bất biến | `InvoiceService.UpdateDraftInvoiceAsync` | `Invoice.UpdateDraftReadingsAndPrices` | Load invoice | Domain `UpdateDraftReadingsAndPrices_PaidInvoice_ThrowsBusinessRuleViolationException` |
| BR-20 | Lưu đầy đủ payment history | `InvoiceService.RegisterPaymentAsync`, `GetPaymentHistoryAsync` | `Invoice.RegisterPayment` tạo `Payment` | Invoice details phải load `Payments` | `RegisterPayment_UsesCurrentUserAsRecorder`, Domain `RegisterPayment_ValidAmount_AddsPaymentToHistory` |

## Ranh giới concurrency bắt buộc ở Infrastructure

Application pre-check BR-04 và BR-10 giúp trả lỗi có ý nghĩa nhưng không thể tự chống
race condition hoàn toàn. Infrastructure task sau phải bổ sung:

- filtered unique index hoặc cơ chế tương đương cho một Active Contract trên mỗi
  Room;
- unique constraint cho `(ContractId, BillingMonth, BillingYear)`;
- chuyển database conflict/concurrency exception thành `ConflictException` có code
  `BR-04` hoặc `BR-10`;
- integration test tạo đồng thời để chứng minh constraint hoạt động.

Các transaction nhiều aggregate (`CreateTenant`, `Activate`, `Terminate`,
`RegisterPayment`) chỉ gọi `SaveChangesAsync` một lần. Infrastructure phải bảo đảm
mỗi lần SaveChanges này là một database transaction.
