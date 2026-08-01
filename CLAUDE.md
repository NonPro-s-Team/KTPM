# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project overview

RMS (Room Management System / "TroConnect") is a boarding-house management app: ASP.NET Core Web API backend (Clean Architecture, .NET 10, EF Core, SQL Server) + React/TypeScript frontend (Vite). Domain docs and commit conventions are in Vietnamese; code identifiers and comments are in English.

## Commands

### Backend (`backend/`)

```bash
dotnet restore                                          # from backend/
dotnet build
dotnet run --project src/RMS.API                        # https://localhost:5001, http://localhost:5000
dotnet test src/RMS.Tests/RMS.UnitTests/RMS.UnitTests.csproj
dotnet test src/RMS.Tests/RMS.IntegrationTests/RMS.IntegrationTests.csproj   # needs Docker (Testcontainers)
dotnet test --filter "FullyQualifiedName~ClassName.MethodName"              # single test
```

Integration tests spin up their own SQL Server container via Testcontainers (`SqlServerContainerFixture`) — they do **not** use the `docker-compose` instance. Docker must simply be running.

Required config (env vars or `appsettings.Development.json`, see `.env.example`): `ConnectionStrings__DefaultConnection`, `Jwt__Issuer`/`Jwt__Audience`/`Jwt__Key`/`Jwt__ExpirationMinutes`, `Cors__AllowedOrigins__0`. `AddInfrastructure` throws on startup if the connection string is missing.

Seed development data: `dotnet run --project src/RMS.API -- --seed-development-data` (reads `SeedData__*`, runs once, then exits — does not start the web server).

### Database

```bash
cp .env.example .env                                     # fill in real secrets, never commit
docker compose --env-file .env up -d sqlserver           # wait for "healthy"
$env:ASPNETCORE_ENVIRONMENT = "Development"
$env:ConnectionStrings__DefaultConnection = "<...>"
./scripts/database-update.ps1                             # apply EF Core migrations
./scripts/database-reset.ps1 -Seed                        # destructive reset + optional seed, asks for confirmation
```

Details/rollback: `docs/database-setup.md`. Schema/ERD: `docs/database-schema.md`.

### Frontend (`frontend/`)

```bash
npm ci
cp .env.example .env.local        # or rely on .env.development for the hosted API
npm run dev                       # http://localhost:5173
npm run typecheck                 # tsc -b --pretty false
npm run lint                      # oxlint
npm run test                      # vitest run
npm run test -- path/to/File.test.tsx -t "test name"   # single test
npm run build                     # tsc -b && vite build
npm run format / format:check     # prettier
```

`VITE_API_BASE_URL` resolves from `.env.production` (build) or `.env.development` (dev, points at `http://localhost:5000/api` by default); `.env.local` overrides both if the local backend runs on a different port. Never put secrets in frontend env vars.

### CI

`.github/workflows/ci.yml` runs backend `dotnet build`/`dotnet test` and frontend `typecheck`/`lint`/`test`/`build` on push/PR to `main`/`develop`.

**Known discrepancy:** the original SRS/spec targeted .NET 8, but the actual build decision moved to **.NET 10** — all `.csproj` files correctly target `net10.0`. `ci.yml`'s `setup-dotnet` step still pins `8.x`, left over from the original spec; it has not been updated to match. Don't "fix" this to net10 without confirming with the maintainer first, and don't assume CI is validating against the real target framework.

## Deployment

Production runs on Azure and **auto-deploys on every push to `main`** — there is no staging environment or approval gate, so merging to `main` ships immediately:

- **Frontend**: https://www.troconnect.site (Azure Static Web Apps), deployed by `.github/workflows/azure-static-web-apps-proud-stone-0b36ca300.yml` (uploads `frontend/dist`, the Vite build output).
- **Backend API**: https://api.troconnect.site/swagger/index.html (Azure App Service `rms-api-hientm-2026`), deployed by `.github/workflows/main_rms-api-hientm-2026.yml` (`dotnet publish` of `RMS.API`). This workflow correctly uses the .NET 10 SDK — unlike `ci.yml`, it is not affected by the `8.x`/`net10.0` discrepancy above.
- **Database**: production also runs on Azure, separate from the local `docker-compose` SQL Server used for development and the ephemeral Testcontainers instance used by integration tests. Connection string and other secrets are configured directly in Azure App Service settings, not in the repo.

## Architecture

### Backend: Clean Architecture, strict dependency direction

`RMS.Domain` (entities, enums, value objects, domain exceptions, no dependencies) ← `RMS.Application` (services, DTOs/"Models" per feature folder, interfaces for persistence/security in `Common/Interfaces`) ← `RMS.Infrastructure` (EF Core `AppDbContext`, repositories implementing the Application interfaces, JWT/password services) ← `RMS.API` (controllers, middleware, auth policies). Each layer's `DependencyInjection.cs` (`AddApplication`, `AddInfrastructure`, `AddApiServices`) wires its own services; `Program.cs` just calls all three then builds the pipeline.

Feature folders are mirrored across layers by name, e.g. `Rooms`, `Contracts`(`RentalContracts`), `Invoices`, `MaintenanceRequests`, `Tenants`, `Dashboard`, `Auth` — each has an `I{X}Service` in Application and an implementation in the same folder, plus a matching repository interface/impl in Infrastructure and a controller in `RMS.API/Controllers`.

### Error contract (RFC 7807)

Every handled error returns `application/problem+json` with a stable `code` field. `ExceptionHandlingMiddleware` (`backend/src/RMS.API/Middleware/ExceptionHandlingMiddleware.cs`) maps exception types to status/code:

| Exception | Status | Code source |
| --- | --- | --- |
| `AuthenticationException` | 401 | exception `Code` |
| `ForbiddenAccessException` | 403 | exception `Code` |
| `NotFoundException` | 404 | exception `Code` |
| `ConflictException` | 409 | exception `Code` (often a `BR-xx`) |
| `ValidationException` | 400 | exception `Code` |
| `BusinessRuleException` / `BusinessRuleViolationException` | 400 | domain rule code (`BR-01`..`BR-20`) |
| other `DomainException` | 400 | domain `Code` |
| malformed JSON / bad request | 400 | `VALIDATION_ERROR` |
| anything else | 500 | `INTERNAL_ERROR` (no stack traces/SQL/secrets ever returned) |

Full contract with examples: `docs/api-error-contract.md`. When adding a new failure mode, throw one of the existing typed exceptions (`RMS.Application.Common.Exceptions` or `RMS.Domain.Exceptions`) rather than inventing new HTTP handling — the middleware is the single translation point.

### Business rules (BR-01..BR-20)

The SRS's business rules are enumerated as constants in `RMS.Domain.Constants.BusinessRuleCodes` and thrown as `BusinessRuleException(ruleCode, message)`. Which layer is responsible for enforcing each rule (Domain invariant vs. Application coordination vs. a DB constraint) is documented in `docs/domain-rule-mapping.md` and `docs/application-rule-mapping.md` — consult these before deciding where a new check belongs. Key examples: a room can only have one active contract (`BR-04`), invoices are unique per contract+billing period (`BR-10`), paid invoices are immutable (`BR-19`), payments cannot exceed the outstanding invoice amount (`BR-13`).

### Auth & authorization

JWT bearer auth with three roles (`RMS.Domain.Enums.UserRole`: `Admin`, `Staff`, `Tenant`). Policies are `AdminOnly` / `AdminOrStaff` / `TenantOnly` (`RMS.API.Authorization.AuthorizationPolicies`), applied per-controller/action. Tenants are restricted to their own data (`BR-16`) — this is enforced in Application services via `ICurrentUserService`, not by the domain layer.

### Frontend architecture

- `src/api/*Api.ts` — one file per backend feature area (rooms, contracts, invoices, etc.), thin wrappers around a shared `httpClient` (axios instance in `src/api/httpClient.ts`).
- `httpClient` attaches the bearer token from stored session (skipping the login call itself), and on any `401` (other than login) clears the session and hard-redirects to `/login`. All API errors are normalized into `ApiClientError`/`ApiError`, mirroring the backend's ProblemDetails shape (`status`, `title`, `detail`, `code`, `traceId`, `fieldErrors`).
- `src/store/authStore.ts` (Zustand) holds the session, schedules an auto-logout timer at token expiry, and persists via `src/store/authSession.ts` (`remember` controls localStorage vs. sessionStorage-style persistence).
- Routing (`src/App.tsx`) is role-gated: `ProtectedRoute` requires an authenticated session, `RoleGuard` restricts specific routes (e.g. `/dashboard` is admin/staff only). Pages are lazy-loaded per route.
- Backend/frontend contract details (routes, role restrictions, unsupported endpoints like `/properties`) are documented in `docs/frontend-backend-integration.md` and `frontend/README.md`.
- `/properties` is a work-in-progress feature (the page currently just shows an "API not supported yet" notice) — treat it as unfinished, not out of scope.

### Project status

- Solo-maintainer project: no established PR/branch/commit conventions beyond what's in git history — don't assume team review process exists.
- Frontend is currently mid-refactor to streamline and remove redundant UI — expect some inconsistency in `frontend/src/components` and `frontend/src/pages` styling/structure while this is in progress.
- Prefer Vietnamese for explanations and any new documentation/comments aimed at the maintainer; code identifiers stay in English per existing convention.

### Testing structure

- Backend: `RMS.UnitTests` (pure unit tests, mocked dependencies) vs. `RMS.IntegrationTests` (real SQL Server via Testcontainers, `SqlServerCollection`/`SqlServerContainerFixture` disable parallelization and reset all tables between tests via `ResetAsync`).
- Frontend: Vitest + Testing Library for unit/component tests (co-located `*.test.tsx`/`*.test.ts`). No e2e suite exists — `@playwright/test` was previously declared as a dependency but never wired up (no config, no `frontend/e2e` directory) and has been removed.

## Docs map

`docs/` contains the authoritative design references (mostly Vietnamese) — check these before re-deriving architecture from code:
- `docs/api-overview.md`, `docs/api-endpoints.md`, `docs/api-error-contract.md`, `docs/api-setup.md` — API surface and conventions
- `docs/domain-rule-mapping.md`, `docs/application-rule-mapping.md`, `docs/persistence-rule-mapping.md` — where each `BR-xx` rule is enforced
- `docs/domain-assumptions.md`, `docs/application-assumptions.md`, `docs/infrastructure-assumptions.md` — scope decisions and open questions
- `docs/database-schema.md`, `docs/database-setup.md`, `docs/database-audit.md` — schema, migrations, constraints
- `docs/frontend-backend-integration.md`, `docs/ui-ux/UI_DESIGN_SYSTEM.md` — frontend contract and design system
- `docs/SRS/SRS_QuanLyPhongTro.pdf` — original requirements spec (source of truth for business rules)
