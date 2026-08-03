# Room Management

## Purpose

Rooms belong to boarding house buildings (dãy trọ). Each building is just a grouping — MVP dashboard only shows aggregate counts per building (e.g. "Building 1 – Bình Thạnh", "Building 2 – Gò Vấp", "Building 3 – Tân Bình"), not deep building-level management screens.

## Core Fields (MVP)

- Basic info: room name/number, building it belongs to
- Base room price (giá phòng)
- Service price(s) (giá dịch vụ — e.g. electricity/water/other recurring service fees baseline)
- Maximum occupancy (số lượng người tối đa)
- Single-occupant discount flag/amount: if a room is occupied by only 1 person, it may optionally have a discounted price

## CRUD Scope (MVP)

- **Create:** add new room with the fields above
- **Read:**
  - List/table view: basic room info for quick scanning
  - Detail/page view: full room info
- **Update:** edit room info
- **Delete:** remove room

## Relationship to Contracts

- See `@docs/contract-management.md` for the Room↔Contract relationship rule: a room can have **at most one active Contract at a time**.
- A room with no active contract is considered vacant. Invoices cannot be created for a vacant room (see `@docs/invoice-billing.md`).
