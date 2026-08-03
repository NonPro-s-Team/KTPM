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

**Resolved rule:** `TotalRooms` acts as a **hard cap** on how many Room records can be created under this Building. See `@docs/room-management.md` for the enforcement rule on the Room side (Create must be blocked once the cap is reached).

Additionally: `TotalRooms` **cannot be decreased (via Update) below the current actual count of Room records** already created under this building. This prevents the declared capacity from silently dropping below data that already exists (e.g. building has 20 real rooms, landlord tries to edit `TotalRooms` down to 15 — must be blocked with a clear error).

## Computed / Read-Only Stats (Detail View Only)

The Building detail page additionally shows:
- `VacantRooms` — rooms with no active contract
- `OccupiedRooms` — rooms with an active contract

These are **never stored fields** and are **never part of the Create/Update payload** — they must always be computed live from the `Rooms` table (and, once it exists, the `Contracts` table for active-contract status).

**Sequencing note:** since the Room module doesn't exist yet when Building is first implemented, `VacantRooms` and `OccupiedRooms` should return `0` as a placeholder in this initial pass, clearly marked with a `// TODO` comment. When the Room module is implemented next, `BuildingService`'s detail-fetch logic must be updated to actually query the `Rooms` table for these counts — and again later once `Contracts` exists, to distinguish vacant vs occupied.

## Relationship to Room

- One Building has many Rooms (1-to-many).
- `Room.BuildingId` is a required foreign key — a Room cannot exist without referencing a valid Building. See `@docs/room-management.md`.

## Duplicate Detection (Soft Warning)

To avoid data-entry accidents (e.g. accidentally submitting the same building twice), Building creation includes a **soft duplicate check** — it warns, but does not hard-block.

- **Match signal:** normalized `Address` only (trim whitespace, case-insensitive comparison). `Name` is intentionally NOT used — a landlord may legitimately reuse similar names across different real buildings (e.g. "Nhà trọ Cô Hương 1" / "2"), but two different buildings can't legitimately share the exact same physical address.
- **Flow (warn-then-confirm):**
  1. On `POST /api/buildings`, before creating, check if any existing Building has a normalized Address match.
  2. If a match is found and the request does **not** include a `confirmDuplicate: true` flag: do NOT create the record. Return an HTTP `409 Conflict` with the existing building's `Id`, `Name`, `Address` in the body, so the frontend can show a confirmation dialog (e.g. "A building already exists at this address: {Name}. Create anyway?").
  3. If the request includes `confirmDuplicate: true` (landlord explicitly confirmed via the dialog): skip the check and create the record even though the address matches an existing one.
- Applies to **Create only**, not Update — editing an existing building's address to collide with another building's address is a rarer edge case, not handled in this pass.

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
