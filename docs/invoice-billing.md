# Invoice & Billing

## What an Invoice Is Generated Against

An Invoice is tied to the **Room's currently active Contract** — not directly to a Tenant Profile, and not to a Room in isolation. The active Contract is what tells the system who is currently renting and at what price, so it's the correct anchor for billing.

- **Hard rule:** if a Room has no active Contract (i.e. it's vacant), an Invoice **cannot** be created for it.

## Invoice Fields (MVP)

- Room name
- Room rent (tiền phòng)
- Electricity (tiền điện)
- Water (tiền nước)
- Other service fees (tiền dịch vụ)
- Total amount (tổng tiền)

## Generation

- **MVP: manual creation only** — the landlord creates each invoice by hand.
- **Future phase:** automatic recurring generation (e.g. monthly) — not part of MVP, don't build this yet, but don't design the Invoice entity in a way that would block adding it later.

## Status Lifecycle

An Invoice has a status that changes automatically based on events, not manual toggling by the landlord (except for the initial creation and marking payment received):

1. **Unpaid** (Chưa thanh toán) — default status when an invoice is issued to a tenant.
2. **Paid** (Đã thanh toán) — set when the tenant's payment is successfully recorded.
3. **Overdue** (Quá hạn) — the system automatically checks the due date and transitions the status to Overdue when the due date has passed and the invoice is still unpaid. This must be a system-driven check (e.g. scheduled/background check against due date), not something the landlord manually sets.

- **Partial payment status:** not in MVP. This is an **optional feature for a future phase** (some landlords may want it, some won't) — don't build it now, but be aware the status model may need to accommodate a `PartiallyPaid` state later.

## CRUD Scope (MVP)

- **Create:** new invoice based on a room's active contract
- **Read:** basic (list) and detail views
- **Update:** edit invoice
- **Delete:** remove invoice
