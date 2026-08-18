# Dashboard & Reporting

## Purpose

The Dashboard is a **view-only summary screen** for the landlord: counts and totals, with the ability to click through into a module's detail page. It is **not** a place for business logic, and it does not introduce new business rules of its own.

Summary metrics shown (MVP):
- Number of buildings (dãy trọ) — count sourced from the Building module's own list/summary endpoint (see `@docs/building-management.md`, which is now a full CRUD module with its own detail pages)
- Total number of tenants (tenant profiles currently in the system)
- Total number of rooms
- Revenue by month/quarter/year

## Architectural Rule: No Dedicated Backend "Dashboard" Feature

Do **not** create a `Features/Dashboard` module on the backend that reaches into other modules' data to compute aggregates. That would make the dashboard "know too much" about other modules' internals.

Instead:
- **Each module exposes its own small summary endpoint.** For example:
  - `GET /rooms/summary` (or `/rooms/count`) — room counts
  - `GET /invoices/summary` — total outstanding/overdue amounts, paid totals, etc.
  - `GET /tenants/summary` — tenant counts
- The **frontend** `/features/dashboard` is responsible for calling these several endpoints and combining the results for display. Aggregation across modules happens at the frontend/presentation layer, not the backend.
- This keeps each module responsible only for summarizing its own data — consistent with the project's general principle of not adding cross-cutting abstractions until they're actually needed.

## If Cross-Module Aggregation Becomes Genuinely Necessary

If a future requirement truly needs server-side aggregation across modules in a single response (e.g. for performance), that's the point to introduce a dedicated reporting feature — not before. Follow the project's general rule: only extract/introduce shared infrastructure when it's actually needed, not preemptively.
