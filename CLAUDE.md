# CLAUDE.md — TroConnect

Context memory for Claude Code sessions on the **TroConnect** project. Read this file first in every session.

## 1. Project Overview

TroConnect is a management system for chains of rental boarding houses (nhà trọ), built to digitize a currently paper-based process. Contracts are still signed on paper, but scanned and uploaded into the app for easier tracking and management.

- **Primary user (MVP):** the landlord/owner (chủ trọ). Multi-role support (e.g. staff, tenant self-service) is a future phase, not MVP.
- **Initial scale:** 2–3 boarding house buildings, ~20–50 rooms total.
- **MVP scope:**
  - Dashboard: view-only summary counts (buildings, tenants, rooms, revenue by month/quarter/year) with drill-down into detail pages. No business logic lives on the dashboard — see `@docs/dashboard-and-reporting.md`.
  - Full CRUD for: **Building** (parent of Room — implement first), Rooms, Contracts, Invoices, Tenant Profiles, Tenant Accounts.
  - **Build order:** Building → Room → Contract → Invoice. Tenant Profile/Account can be built in parallel (no FK dependency on Room/Contract).

Detailed domain rules for each module are in `/docs` — see references below.

## 2. Tech Stack & Architecture

- **Backend:** C# ASP.NET Web API (RESTful)
- **Frontend:** ReactJS
- **Database:** PostgreSQL
- **ORM:** EF Core, **Code-First** (write entities → `Add-Migration` → `Update-Database`). Never Database-First.
- **Architecture:** Simple layered architecture. Controllers call Services directly. **Services call `DbContext` directly** — no generic Repository pattern.
- **Interfaces:** Do NOT create a 1:1 interface for every service. Only introduce an interface when there are genuinely ≥2 implementations, or when needed to mock for a test. Don't add abstraction "just in case."
- **Shared/cross-module logic:** Only extract shared logic when it's actually reused in ≥2 places — do not pre-emptively extract "in case it's needed later."
- **Testing:** Not required from day one. Priority is a working MVP first; testing strategy will be added later.
- **Authentication:** JWT Bearer tokens for session auth; **BCrypt** for password hashing. A single shared `Account` entity (with a `Role` field) handles both Landlord and future Tenant self-service login — see `@docs/authentication.md`.

## 3. Domain Rules

See detailed docs per module:
- @docs/tenant-and-account.md — Tenant Profile vs Tenant Account, and their relationship
- @docs/authentication.md — Account entity, Register/Login/Forgot Password flows, JWT + BCrypt rules
- @docs/building-management.md — Building (dãy trọ) entity, fields, and build-order note (must exist before Room)
- @docs/room-management.md — Room entity and fields
- @docs/contract-management.md — Contract rules, Contract↔Room, Contract↔Tenant (representative/co-tenant)
- @docs/invoice-billing.md — Invoice generation, status lifecycle
- @docs/dashboard-and-reporting.md — how summary data is exposed and aggregated

## 4. Code Conventions

- **Naming:** default .NET conventions for C# (PascalCase for classes/methods, camelCase for local variables) and default React/TS conventions (PascalCase components, camelCase variables/functions).
- **Commits:** Conventional Commits, **with scope per module**, e.g. `feat(room): add discount field for single occupancy`, `fix(invoice): correct overdue status trigger`.
- **Folder structure — feature-based**, both backend and frontend. No dedicated `Interfaces/` layer.

Backend:
```
/src
  /Features
    /Buildings
      BuildingsController.cs
      BuildingService.cs
      BuildingDtos.cs
    /Rooms
      RoomsController.cs
      RoomService.cs
      RoomDtos.cs
    /Contracts
    /Invoices
    /Tenants        (tenant profile)
    /Accounts       (shared login account — Landlord + future Tenant self-service, see @docs/authentication.md)
  /Data
    AppDbContext.cs
    /Entities
    /Migrations
  /Common
```

Frontend:
```
/src
  /features
    /buildings
    /rooms
    /contracts
    /invoices
    /tenants
    /accounts
    /dashboard
  /components         (shared UI components)
  /lib                (axios instance, shared helpers)
```

## 5. How Claude Should Work With Me

I'm rebuilding this project from scratch to relearn it deeply — I don't just want working code, I want to understand it.

**Mandatory rule for every session:**
1. **Explain the theory and the processing flow FIRST**, in plain language, before any implementation help.
2. **Then give hints** — pseudocode is fine, but do NOT hand over complete, directly copy-pasteable C#/TS code, **unless I explicitly ask for it** (e.g. "give me the full code", "just write it for me").
3. **Actively ask me questions back** before giving the next hint, to check whether I actually understood — don't just hand out hints on request without verifying understanding first. This is a hard requirement, not optional.

Follow this rule automatically in every session unless I explicitly override it.
