# RMS Database Audit

## Scope

This audit covers `AppDbContext`, all eight entity configurations,
`20260730085239_InitialRmsSchema`, its model snapshot, the generated idempotent
SQL script, Docker configuration, design-time tooling, initialization, and
development seed data.

## Migration inventory

| Order | Migration | Purpose | Empty/duplicate |
| --- | --- | --- | --- |
| 1 | `20260730085239_InitialRmsSchema` | Creates the complete RMS schema | No |

The migration is in `RMS.Infrastructure.Data.Migrations`, uses the conventional
`Data/Migrations` output directory, has a model snapshot, and has a valid
reverse-order `Down` method. No new migration is required because EF reports
that the model and snapshot have no pending differences.

## Model summary

| Item | Audited result |
| --- | --- |
| Business tables | 8 |
| Primary keys | 8 |
| Foreign keys | 10, all Restrict/NoAction |
| Explicit indexes | 14 |
| SQL Server rowversions | 6 |
| Legacy tables | 0 |
| BillingPeriod storage | `BillingPeriodKey` integer in `YYYYMM` format |

The eight business tables are Users, Tenants, Rooms, RentalContracts, Invoices,
Payments, MaintenanceRequests, and MaintenanceRequestUpdates.
`__EFMigrationsHistory` is the only EF system table.

## Important database protections

- `UX_Users_Username`
- `UX_Tenants_UserId`
- `UX_Rooms_RoomNumber`
- `UX_RentalContracts_Room_Active`, filtered by the source enum value
  `ContractStatus.Active = 2`
- `UX_Invoices_Contract_BillingPeriod`
- Checks for failed-login attempts, rent, contract dates, billing period,
  meter readings, invoice totals, and positive payments
- Real SQL Server `rowversion` columns on all six mutable aggregates

## Operational audit

- The Docker image is pinned and has a healthcheck, configurable host port,
  named volume, and environment-provided password.
- EF tooling fails fast when `ConnectionStrings:DefaultConnection` is absent.
- Database update and destructive reset are explicit scripts; both reject
  Production.
- Development seeding is disabled by default, environment-gated, idempotent,
  bcrypt-based, and uses Domain transitions.
- Normal API startup neither migrates nor seeds the database.

## Smoke-check evidence

The finalization branch was verified on a disposable local SQL Server Express
database named `RMS_DatabaseFinalization_Audit`:

- Release solution build: 0 warnings, 0 errors.
- Empty database: `InitialRmsSchema` applied successfully.
- Second update: no migration applied; database already up to date.
- Migration history: exactly `20260730085239_InitialRmsSchema`.
- Catalog: exactly the eight expected business tables, 10 `NO_ACTION` foreign
  keys, all important indexes, nine check constraints, and six rowversion
  columns.
- Development seed: 4 users, 2 tenant profiles, 4 rooms, 1 active contract,
  1 draft contract, 2 invoices, 1 payment, and 1 maintenance request.
- Second seed: counts remained unchanged.
- EF model check: no pending model changes.
- Existing unit/model tests: 165 passed.

The disposable audit database was dropped after verification. Docker Compose
runtime validation remains unavailable on the audit workstation because the
Docker CLI is not installed; the configuration is intended for Docker-capable
developer machines and CI.
