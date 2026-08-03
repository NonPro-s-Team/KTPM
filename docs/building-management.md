# Building Management (Dãy Trọ)

## Purpose

A **Building** (dãy trọ) represents one physical rental building/row within the landlord's chain of boarding houses (chuỗi nhà trọ). This is the top-level grouping that Rooms belong to.

## Build Order

Implementation order for MVP: **Building → Room → Contract → Invoice**, with Tenant Profile/Account buildable in parallel (no FK dependency on Room/Contract). **Building must be implemented first** because Room requires a valid `BuildingId`.

## Core Fields (editable via Create/Update)

- `Name` (string) — e.g. "Dãy trọ 1"
- `Address` (string) — e.g. "123 Đường ABC, Bình Thạnh"
- `TotalRooms` (int) — declared total number of rooms in this building. This is a **manually-entered, stored field** (not computed) — the landlord enters it directly when creating/editing a Building.

These three fields are directly entered/edited by the landlord.

**Future decision point:** once the Room module exists and individual Room records are tracked per building, decide whether `TotalRooms` should become auto-synced from the actual Room count, or remain an independently-editable declared value. Not a decision needed now — just don't forget to revisit it.

## Computed / Read-Only Stats (Detail View Only)

The Building detail page additionally shows:
- `VacantRooms` — rooms with no active contract
- `OccupiedRooms` — rooms with an active contract

These are **never stored fields** and are **never part of the Create/Update payload** — they must always be computed live from the `Rooms` table (and, once it exists, the `Contracts` table for active-contract status).

**Sequencing note:** since the Room module doesn't exist yet when Building is first implemented, `VacantRooms` and `OccupiedRooms` should return `0` as a placeholder in this initial pass, clearly marked with a `// TODO` comment. When the Room module is implemented next, `BuildingService`'s detail-fetch logic must be updated to actually query the `Rooms` table for these counts — and again later once `Contracts` exists, to distinguish vacant vs occupied.

## Relationship to Room

- One Building has many Rooms (1-to-many).
- `Room.BuildingId` is a required foreign key — a Room cannot exist without referencing a valid Building. See `@docs/room-management.md`.

## Delete Rule

A Building **cannot be deleted while it still has any Rooms attached**. Block the delete and return a clear error (e.g. "Cannot delete a building that still has rooms — move or delete its rooms first."). This is the default safety rule; revisit only if a deliberate cascading-delete workflow is wanted later.

## CRUD Scope (MVP)

Full CRUD, same shape as the other core modules:
- **Create:** Name, Address, TotalRooms
- **Read:**
  - List/table view: basic info (Name, Address, TotalRooms)
  - Detail/page view: full info (Name, Address, TotalRooms) + computed stats (VacantRooms, OccupiedRooms)
- **Update:** edit Name / Address / TotalRooms
- **Delete:** subject to the rule above (blocked if Rooms exist)
