# RMS Database Setup

## Prerequisites

- .NET SDK 10 matching the solution target
- Docker Desktop or another Docker Engine capable of Linux containers
- PowerShell, Bash, or another shell that can set environment variables

The database image is SQL Server 2022. No production secret is stored in the
repository.

## Local configuration

Copy `.env.example` to `.env` and replace every placeholder. `.env` is ignored
by Git. At minimum, provide:

```text
MSSQL_SA_PASSWORD
MSSQL_PORT
RMS_DATABASE
ConnectionStrings__DefaultConnection
Jwt__Issuer
Jwt__Audience
Jwt__Key
Jwt__ExpirationMinutes
```

`MSSQL_PORT` controls the host port exposed by Docker Compose.
`RMS_DATABASE` documents the local database name used in the connection
string; SQL Server creates it when EF applies the first migration.

The JWT key must contain at least 32 UTF-8 bytes and token expiry must be
between 1 and 1440 minutes.

In PowerShell, application configuration can be set for the current process:

```powershell
$env:ConnectionStrings__DefaultConnection = "Server=localhost,1433;Database=RMS_Development;User Id=sa;Password=<local-password>;TrustServerCertificate=True;Encrypt=False"
$env:Jwt__Issuer = "RMS"
$env:Jwt__Audience = "RMS.Client"
$env:Jwt__Key = "<at-least-32-byte-local-development-key>"
$env:Jwt__ExpirationMinutes = "1440"
```

## Start SQL Server

```powershell
docker compose --env-file .env up -d sqlserver
docker compose ps
```

Wait until `docker compose ps` reports `healthy` before applying the migration.
The compose file pins SQL Server 2022 CU14 and stores data in the named
`rms-sqlserver-data` volume.

## Restore EF tooling

From the repository root:

```powershell
dotnet tool restore
dotnet restore backend/RMS.slnx
```

The local manifest pins `dotnet-ef` 10.0.10, matching EF Core packages.

## Create a migration

First check whether the model differs from the snapshot:

```powershell
dotnet ef migrations has-pending-model-changes `
  --project backend/src/RMS.Infrastructure `
  --startup-project backend/src/RMS.API
```

Do not create a migration when EF reports no pending changes. When a reviewed
model change genuinely requires one, use a descriptive name:

```powershell
dotnet ef migrations add <MigrationName> `
  --project backend/src/RMS.Infrastructure `
  --startup-project backend/src/RMS.API `
  --output-dir Data/Migrations
```

Never delete or recreate `20260730085239_InitialRmsSchema` merely to change its
timestamp or name.

## Apply migrations

The preferred local operation restores the pinned tool, lists migrations,
applies them, and verifies model/snapshot synchronization:

```powershell
$env:ASPNETCORE_ENVIRONMENT = "Development"
$env:ConnectionStrings__DefaultConnection = "<local-connection-string>"
./scripts/database-update.ps1
```

Equivalent direct EF command:

```powershell
dotnet ef database update `
  --project backend/src/RMS.Infrastructure `
  --startup-project backend/src/RMS.API
```

Running the update command a second time is safe and must report that the
database is already up to date.

## Rollback

The following command destroys every RMS business table and its data. Use it
only against a disposable local/test database after verifying the connection
string. Never use it casually in production:

```powershell
dotnet ef database update 0 `
  --project backend/src/RMS.Infrastructure `
  --startup-project backend/src/RMS.API
```

Check model/snapshot synchronization:

```powershell
dotnet ef migrations has-pending-model-changes `
  --project backend/src/RMS.Infrastructure `
  --startup-project backend/src/RMS.API
```

Generate an idempotent script:

```powershell
dotnet ef migrations script 0 InitialRmsSchema --idempotent `
  --project backend/src/RMS.Infrastructure `
  --startup-project backend/src/RMS.API `
  --output docs/database/InitialRmsSchema.sql
```

The committed script already matches the current migration. Do not regenerate
or create a duplicate script unless a reviewed migration changes.

## Reset the local database

The reset script refuses Production, requires an explicit local/test connection
string, prompts for `RESET`, drops only the configured database, and reapplies
reviewed migrations:

```powershell
./scripts/database-reset.ps1
```

`-Force` is intended only for deliberate non-interactive local/CI use. It does
not bypass the Production guard.

## Development seed

Seeding is disabled by default and is never automatic. To enable it, set
the four password variables from `.env.example`, then run:

```powershell
./scripts/database-reset.ps1 -Seed
```

The explicit seed operation uses
`DatabaseInitializer.SeedDevelopmentDataAsync`; it runs only in Development
with `SeedData__Enabled=true`. Passwords are bcrypt-hashed and never logged or
stored through `HasData`.

The idempotent demo dataset contains one Admin, one Staff, two Tenant users and
profiles, several rooms, one active and one draft contract, one issued and one
partially-paid invoice, a payment, and one maintenance request. Normal API
startup does not migrate or seed.

To seed an already migrated Development database without dropping it:

```powershell
$env:SeedData__Enabled = "true"
dotnet run --project backend/src/RMS.API `
  --no-launch-profile -- --seed-development-data
```

## Run tests

Unit and fast EF model tests:

```powershell
dotnet test backend/src/RMS.Tests/RMS.UnitTests/RMS.UnitTests.csproj
```

SQL Server integration tests:

```powershell
dotnet test backend/src/RMS.Tests/RMS.IntegrationTests/RMS.IntegrationTests.csproj
```

Integration tests use one shared SQL Server 2022 Testcontainers instance,
apply migrations with `MigrateAsync`, and clear data between tests. They never
use EF InMemory or `EnsureCreated`.

Deeper migration, concurrency, operational, and performance scenarios are
tracked in `docs/test-backlog.md`.
