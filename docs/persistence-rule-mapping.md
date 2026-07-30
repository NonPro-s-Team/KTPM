# RMS Persistence Rule Mapping

| BR | Application pre-check | Database protection | Constraint/Index | Integration test |
| --- | --- | --- | --- | --- |
| BR-04 | `HasActiveContractForRoomAsync` before create/activate | Race-safe unique active contract per room | `UX_RentalContracts_Room_Active`, unique filtered on `RoomId` where `Status = Active` | First active succeeds; second same room maps to BR-04; drafts and different rooms allowed; concurrent creators yield one winner |
| BR-09 | Domain validates end readings are not below start readings | Rejects invalid stored readings even if Application is bypassed | `CK_Invoices_ElectricityReadings`, `CK_Invoices_WaterReadings` | Migration/model checks plus invoice round-trip suite |
| BR-10 | `ExistsForContractAndPeriodAsync` | Race-safe unique invoice per contract and period | `UX_Invoices_Contract_BillingPeriod` on (`ContractId`, `BillingPeriodKey`) | Duplicate maps to BR-10; different periods/contracts allowed; concurrent creators yield one winner |
| BR-12 | Domain requires payment amount > 0 | Rejects non-positive persisted Payment | `CK_Payments_Amount` | Payment registration and migration constraint coverage |
| BR-13 | Domain prevents cumulative overpayment | Ensures `PaidAmount` remains between 0 and `TotalAmount` | `CK_Invoices_Amounts`; Invoice `RowVersion` prevents stale concurrent payment updates | Two contexts update one invoice; stale writer gets `CONCURRENCY_CONFLICT` and persisted paid amount does not exceed total |
| BR-20 | `Invoice.RegisterPayment` appends immutable history and use case saves once | Payment FK/history row and invoice update commit atomically; deletes are restricted | `FK_Payments_Invoices_InvoiceId`, `IX_Payments_InvoiceId_PaidAt` | Payment state/history round-trip, recorder FK, transaction rollback, and restricted invoice deletion |

Application pre-checks provide clear early errors. The database constraints are
the final guard against direct persistence and request races.
