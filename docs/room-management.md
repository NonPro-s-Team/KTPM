# Room Management

## Buildings (Parent Module)

Rooms belong to a Building (dãy trọ) — a full CRUD module, built **before** Room. See `@docs/building-management.md` for the Building entity, fields, and rules. This doc covers the Room entity itself, which requires a valid `BuildingId`.

## Purpose

Rooms are the core rentable unit within a Building.

## Room Creation Limit (Business Rule)

`Building.TotalRooms` (see `@docs/building-management.md`) acts as a **hard cap** on how many Rooms can exist under that Building.

- **On Room create:** before inserting, count existing Rooms where `BuildingId` matches. If that count is already `>= Building.TotalRooms`, reject the request with a clear error (e.g. "This building has reached its room limit of {TotalRooms}. Increase TotalRooms on the building first if you need to add more rooms.").
- **On Room delete:** no special rule needed here — deleting a room simply frees up capacity under the cap.
- This check belongs in `RoomService`, not `BuildingService` — `RoomService` is what's creating the Room, so it queries `Building.TotalRooms` at creation time. `BuildingService` separately enforces its own rule (can't decrease `TotalRooms` below actual Room count on Building update) — see `@docs/building-management.md`.

## Core Fields (MVP)

- Basic info: room name/number, `BuildingId` (FK to Building)
- Base room price (giá phòng)
- Service price (giá dịch vụ — baseline recurring service fee, e.g. covers electricity/water/other)
- Maximum occupancy (số lượng người tối đa)
- Single-occupant discount amount (nullable): if a room is occupied by only 1 person, this optional discount amount is deducted from the total

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
