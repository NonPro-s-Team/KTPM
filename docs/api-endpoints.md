# RMS API Endpoints

Base path: `/api`. Health endpoints intentionally live outside that base path.
`Authenticated` means any valid Admin, Staff, or Tenant JWT; Application
Services still enforce ownership and role-specific business rules.

| Method | Route | Role | Request | Success response | FR |
| --- | --- | --- | --- | --- | --- |
| POST | `/api/auth/login` | Anonymous | `LoginRequest` | 200 `LoginResponse` | FR-01-01 |
| POST | `/api/auth/logout` | Authenticated | None | 204 | FR-01-02 |
| POST | `/api/auth/change-password` | Authenticated | `ChangePasswordRequest` | 204 | FR-01-05 |
| POST | `/api/auth/users/{userId:guid}/unlock` | Admin | Route ID | 204 | FR-01-04 |
| GET | `/api/rooms` | Authenticated | `pageNumber`, `pageSize`, optional `status` | 200 `PagedResult<RoomResponse>` | FR-02-01, FR-02-02 |
| GET | `/api/rooms/{roomId:guid}` | Authenticated | Route ID | 200 `RoomResponse` | FR-02-01 |
| POST | `/api/rooms` | Admin, Staff | `CreateRoomRequest` | 201 `RoomResponse` + Location | FR-02-03 |
| PUT | `/api/rooms/{roomId:guid}` | Admin, Staff | `UpdateRoomRequest` | 200 `RoomResponse` | FR-02-04 |
| PATCH | `/api/rooms/{roomId:guid}/status` | Admin, Staff | `ChangeRoomStatusRequest` | 200 `RoomResponse` | FR-02-05 |
| GET | `/api/tenants` | Admin, Staff | `pageNumber`, `pageSize` | 200 `PagedResult<TenantResponse>` | FR-03-01 |
| GET | `/api/tenants/me` | Tenant | None | 200 `TenantResponse` | FR-03-04 |
| GET | `/api/tenants/{tenantId:guid}` | Authenticated | Route ID | 200 `TenantResponse` | FR-03-04 |
| POST | `/api/tenants` | Admin, Staff | `CreateTenantRequest` | 201 `TenantResponse` + Location | FR-03-01 |
| PUT | `/api/tenants/{tenantId:guid}` | Admin, Staff | `UpdateTenantRequest` | 200 `TenantResponse` | FR-03-01 |
| GET | `/api/contracts` | Authenticated | `pageNumber`, `pageSize`, optional `status` | 200 `PagedResult<RentalContractResponse>` | FR-03-04 |
| GET | `/api/contracts/{contractId:guid}` | Authenticated | Route ID | 200 `RentalContractResponse` | FR-03-04 |
| POST | `/api/contracts` | Admin, Staff | `CreateRentalContractRequest` | 201 `RentalContractResponse` + Location | FR-03-02 |
| PUT | `/api/contracts/{contractId:guid}` | Admin, Staff | `UpdateDraftContractRequest` | 200 `RentalContractResponse` | FR-03-02 |
| POST | `/api/contracts/{contractId:guid}/activate` | Admin, Staff | Route ID | 200 `RentalContractResponse` | FR-03-03 |
| POST | `/api/contracts/{contractId:guid}/terminate` | Admin, Staff | Route ID | 200 `RentalContractResponse` | FR-03-05 |
| POST | `/api/contracts/{contractId:guid}/cancel` | Admin, Staff | Route ID | 200 `RentalContractResponse` | FR-03-06 |
| GET | `/api/invoices` | Authenticated | `pageNumber`, `pageSize`, optional `status` | 200 `PagedResult<InvoiceResponse>` | FR-04-05 |
| GET | `/api/invoices/outstanding` | Authenticated | Optional `tenantId` | 200 `IReadOnlyList<InvoiceResponse>` | FR-04-05 |
| GET | `/api/invoices/{invoiceId:guid}` | Authenticated | Route ID | 200 `InvoiceDetailsResponse` | FR-04-05, FR-04-06 |
| POST | `/api/invoices` | Admin, Staff | `CreateInvoiceRequest` | 201 `InvoiceResponse` + Location | FR-04-01, FR-04-02 |
| PUT | `/api/invoices/{invoiceId:guid}` | Admin, Staff | `UpdateDraftInvoiceRequest` | 200 `InvoiceResponse` | FR-04-02 |
| POST | `/api/invoices/{invoiceId:guid}/issue` | Admin, Staff | Route ID | 200 `InvoiceResponse` | FR-04-03 |
| POST | `/api/invoices/{invoiceId:guid}/payments` | Admin, Staff | `RegisterPaymentRequest` | 200 `PaymentResponse` | FR-04-04 |
| GET | `/api/invoices/{invoiceId:guid}/payments` | Authenticated | Route ID | 200 `IReadOnlyList<PaymentResponse>` | FR-04-06 |
| GET | `/api/maintenance-requests` | Authenticated | `pageNumber`, `pageSize`, optional `status` | 200 `PagedResult<MaintenanceRequestResponse>` | FR-05-01, FR-05-02, FR-05-03 |
| GET | `/api/maintenance-requests/{requestId:guid}` | Authenticated | Route ID | 200 `MaintenanceRequestResponse` | FR-05-01, FR-05-02, FR-05-03 |
| POST | `/api/maintenance-requests` | Tenant | `CreateMaintenanceRequestRequest` | 201 `MaintenanceRequestResponse` + Location | FR-05-01 |
| POST | `/api/maintenance-requests/{requestId:guid}/start` | Admin, Staff | `StartMaintenanceRequestRequest` | 200 `MaintenanceRequestResponse` | FR-05-02 |
| POST | `/api/maintenance-requests/{requestId:guid}/progress-notes` | Admin, Staff | `AddMaintenanceProgressRequest` | 200 `MaintenanceRequestResponse` | FR-05-03 |
| POST | `/api/maintenance-requests/{requestId:guid}/resolve` | Admin, Staff | `ResolveMaintenanceRequestRequest` | 200 `MaintenanceRequestResponse` | FR-05-03 |
| POST | `/api/maintenance-requests/{requestId:guid}/close` | Admin, Staff | `CloseMaintenanceRequestRequest` | 200 `MaintenanceRequestResponse` | FR-05-04 |
| GET | `/api/dashboard/summary` | Admin, Staff | None | 200 `DashboardSummaryResponse` | FR-05-05 |
| GET | `/health/live` | Anonymous | None | 200 health JSON | NFR-08 |
| GET | `/health/ready` | Anonymous | None | 200 or 503 health JSON | NFR-08 |

Payment registration returns 200 because the MVP has no endpoint for reading a
single payment by payment ID; it therefore does not manufacture a Location
header.
