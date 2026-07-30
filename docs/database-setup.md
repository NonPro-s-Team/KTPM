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
ConnectionStrings__DefaultConnection
Jwt__Issuer
Jwt__Audience
Jwt__Key
Jwt__ExpirationMinutes
```

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

Wait until SQL Server accepts connections before applying the migration.

## Restore EF tooling

From the repository root:

```powershell
dotnet tool restore
dotnet restore backend/RMS.slnx
```

The local manifest pins `dotnet-ef` 10.0.10, matching EF Core packages.

## Create a migration

The design-time factory is in Infrastructure, so EF tooling does not need to
start the API:

```powershell
dotnet ef migrations add <MigrationName> `
  --project backend/src/RMS.Infrastructure `
  --startup-project backend/src/RMS.Infrastructure `
  --output-dir Data/Migrations
```

## Apply or roll back migrations

Apply all migrations:

```powershell
dotnet ef database update `
  --project backend/src/RMS.Infrastructure `
  --startup-project backend/src/RMS.Infrastructure
```

Roll back the development database to the empty state:

```powershell
dotnet ef database update 0 `
  --project backend/src/RMS.Infrastructure `
  --startup-project backend/src/RMS.Infrastructure
```

Check model/snapshot synchronization:

```powershell
dotnet ef migrations has-pending-model-changes `
  --project backend/src/RMS.Infrastructure `
  --startup-project backend/src/RMS.Infrastructure
```

Generate an idempotent script:

```powershell
dotnet ef migrations script 0 InitialRmsSchema --idempotent `
  --project backend/src/RMS.Infrastructure `
  --startup-project backend/src/RMS.Infrastructure
```

## Reset the local database

The following removes only the Docker Compose SQL Server container and its
named local volume. It permanently deletes that local development data:

```powershell
docker compose down -v
docker compose --env-file .env up -d sqlserver
dotnet ef database update `
  --project backend/src/RMS.Infrastructure `
  --startup-project backend/src/RMS.Infrastructure
```

## Development seed

Seeding is disabled by default and is never automatic. To enable it, set
`SeedData__Enabled=true` and supply Admin, Staff, and Tenant passwords through
environment variables. A later API startup task may explicitly call
`DatabaseInitializer.InitializeDevelopmentAsync`. Passwords are hashed with
bcrypt and are never logged or stored through `HasData`.

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
