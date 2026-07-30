# RMS Infrastructure Overview

## Architecture

`RMS.Infrastructure` implements technical contracts declared by
`RMS.Application` and maps the canonical aggregates from `RMS.Domain`.
Dependencies remain one-way:

```text
RMS.API -> RMS.Infrastructure -> RMS.Application -> RMS.Domain
```

Application and Domain do not reference EF Core, SQL Server, `HttpContext`, or
Infrastructure.

## DbContext and unit of work

`AppDbContext` is the single EF Core context and the scoped `IUnitOfWork`.
Repositories receive that same scoped instance. A use case tracks and mutates
all required aggregates, then calls `SaveChangesAsync` once. EF Core therefore
commits each multi-aggregate use case in one SQL Server transaction.

The context exposes only the eight canonical sets: Users, Tenants, Rooms,
RentalContracts, Invoices, Payments, MaintenanceRequests, and
MaintenanceRequestUpdates. Mapping is discovered with
`ApplyConfigurationsFromAssembly`; lazy loading and `EnsureCreated` are not
used.

## Repository behavior

Repositories are use-case-specific and implement interfaces from
`RMS.Application.Common.Interfaces.Persistence`. There is no generic
repository and no repository-level `SaveChanges`.

| Query category | Tracking | Related data |
| --- | --- | --- |
| Aggregate by ID | Tracked | Only navigations required by the use case |
| Login user lookup | Tracked | No extra navigation |
| Paged list | No tracking | Reference data required for response mapping |
| Existence/ownership check | Scalar SQL query | No entity materialization |
| Dashboard | Scalar `CountAsync` queries | No Dashboard entity |

Paged queries count and filter in SQL, use a stable `CreatedAt DESC, Id ASC`
order, then apply `Skip` and `Take`.

## Concurrency and exception mapping

User, Tenant, Room, RentalContract, Invoice, and MaintenanceRequest have a
shadow SQL Server `rowversion` concurrency token. Payment and
MaintenanceRequestUpdate are append-only history and do not have RowVersion.

`AppDbContext.SaveChangesAsync` translates only known persistence failures:

- `DbUpdateConcurrencyException` becomes `ConflictException` with
  `CONCURRENCY_CONFLICT`.
- SQL Server duplicate-key errors 2601/2627 inspect the constraint/index name.
- Active-contract and invoice-period conflicts become `BR-04` and `BR-10`.
- Username and room-number duplicates receive stable application codes.
- An unrecognized duplicate constraint receives the generic `CONFLICT` code.

Raw SQL messages, database names, statements, and connection strings are never
placed in the application exception message. Other database failures remain
`DbUpdateException` so they are not misclassified as conflicts.

## Security and technical services

- `PasswordHasher` uses BCrypt.Net with work factor 12. Invalid hash input
  returns `false`; passwords are never logged.
- `JwtAccessTokenService` signs with HMAC-SHA256 and uses the injected UTC
  clock. Issuer, audience, key, and lifetime are required configuration.
- `JwtOptionsValidator` requires a key of at least 32 UTF-8 bytes and limits
  access-token lifetime to 1-1440 minutes.
- `CurrentUserService` reads only `NameIdentifier` and `Role` claims from
  `IHttpContextAccessor` and returns safe defaults for missing/invalid claims.
- `DateTimeProvider` returns `DateTimeOffset.UtcNow`.

There is no refresh token, token blacklist, or server-side logout session.

## Dependency injection

`AddInfrastructure` fails immediately when
`ConnectionStrings:DefaultConnection` is absent, registers the context and
Application persistence interfaces with scoped lifetime, and binds JWT and
seed options. Password hashing and the UTC clock are stateless singletons.
Current user and access-token generation are scoped.

`DatabaseInitializer` is registered but not called automatically. Migration
and seed operations are separated as `ApplyMigrationAsync` and
`SeedDevelopmentDataAsync`; `InitializeDevelopmentAsync` remains an explicit
Development-only convenience operation. The API recognizes
`--seed-development-data` only as an explicit local CLI operation and never
migrates or seeds during normal startup.
