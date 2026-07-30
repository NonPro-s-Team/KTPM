# RMS Database Test Backlog

This task intentionally performs only database smoke checks. The following
deeper coverage is deferred to the dedicated testing phase.

## Migration and compatibility

- Upgrade paths from every future released migration, including large datasets.
- Migration interruption, retry, and deployment-lock behavior.
- Backward/forward compatibility during rolling application deployments.
- Automated rollback rehearsal with backup and restore validation.

## Constraints and concurrency

- High-contention BR-04 and BR-10 race tests with many concurrent writers.
- Concurrency retries for all six rowversion aggregates.
- Boundary/property-based tests for every decimal precision and check
  constraint.
- Collation-specific username and room-number uniqueness tests.
- Delete-restriction coverage for every foreign key and mixed dependency graph.

## Seeder

- Idempotence across repeated runs and partially seeded databases.
- Recovery from a failed seed transaction.
- Verification of all demo state transitions and credential rotation.
- Seed behavior under alternate supported SQL Server collations.

## Operations

- Docker healthcheck behavior on Windows, Linux, and CI runners.
- Reset/update script tests for invalid environments, missing variables,
  cancellation, native-command failure, and paths containing spaces.
- Database backup/restore, storage growth, and disaster-recovery exercises.
- Least-privilege migration and runtime SQL login validation.

## Performance and production readiness

- Query-plan and index-usage tests for dashboards and paged searches.
- Representative-volume load tests and lock/deadlock analysis.
- Connection resiliency and transient SQL failure tests.
- Production observability, alerting, retention, and data-archival validation.

## API Tests

The API layer is implemented in the current phase, but broad automated HTTP
coverage remains deferred to the dedicated testing phase. Every item below is
`Planned`; none is marked passed without execution.

| ID | Objective | Endpoint | Role | Expected status | Priority | Planned tool | Status |
| --- | --- | --- | --- | --- | --- | --- | --- |
| API-01 | Valid login returns a JWT and safe user metadata | `POST /api/auth/login` | Admin/Staff/Tenant | 200 | High | xUnit + WebApplicationFactory | Planned |
| API-02 | Wrong password is rejected | `POST /api/auth/login` | Anonymous | 401 | High | xUnit + WebApplicationFactory | Planned |
| API-03 | Locked account is rejected | `POST /api/auth/login` | Anonymous | 401 | High | xUnit + SQL Server | Planned |
| API-04 | Protected endpoint rejects missing token | `GET /api/rooms` | Anonymous | 401 | High | xUnit + WebApplicationFactory | Planned |
| API-05 | Expired token is rejected with zero clock skew | `GET /api/rooms` | Authenticated | 401 | High | xUnit + generated JWT | Planned |
| API-06 | Tenant cannot invoke an Admin/Staff endpoint | `POST /api/rooms` | Tenant | 403 | High | xUnit + WebApplicationFactory | Planned |
| API-07 | Tenant cannot read another tenant's data | `GET /api/tenants/{tenantId}` | Tenant | 403 | High | xUnit + SQL Server | Planned |
| API-08 | Missing resource uses ProblemDetails | `GET /api/rooms/{roomId}` | Authenticated | 404 | High | xUnit + WebApplicationFactory | Planned |
| API-09 | Invalid request uses ValidationProblemDetails | `POST /api/rooms` | Admin | 400 | High | xUnit + WebApplicationFactory | Planned |
| API-10 | Duplicate RoomNumber maps to conflict | `POST /api/rooms` | Admin | 409 | High | xUnit + SQL Server | Planned |
| API-11 | Duplicate active room contract maps BR-04 | `POST /api/contracts/{contractId}/activate` | Admin/Staff | 409 | High | xUnit + SQL Server | Planned |
| API-12 | Duplicate invoice period maps BR-10 | `POST /api/invoices` | Admin/Staff | 409 | High | xUnit + SQL Server | Planned |
| API-13 | Malformed JSON uses ProblemDetails | `POST /api/rooms` | Admin | 400 | High | xUnit + raw HTTP content | Planned |
| API-14 | Unknown enum string is rejected | `PATCH /api/rooms/{roomId}/status` | Admin/Staff | 400 | High | xUnit + WebApplicationFactory | Planned |
| API-15 | Valid pagination returns stable metadata | `GET /api/rooms?pageNumber=1&pageSize=20` | Authenticated | 200 | Medium | xUnit + SQL Server | Planned |
| API-16 | Out-of-range pagination is rejected | `GET /api/rooms?pageNumber=0&pageSize=101` | Authenticated | 400 | High | xUnit + WebApplicationFactory | Planned |
| API-17 | Room creation returns Location | `POST /api/rooms` | Admin/Staff | 201 | High | xUnit + SQL Server | Planned |
| API-18 | Tenant creation never returns PasswordHash | `POST /api/tenants` | Admin/Staff | 201 | High | xUnit + response inspection | Planned |
| API-19 | Contract activation updates contract and room atomically | `POST /api/contracts/{contractId}/activate` | Admin/Staff | 200 | High | xUnit + SQL Server | Planned |
| API-20 | Overpayment is rejected | `POST /api/invoices/{invoiceId}/payments` | Admin/Staff | 400 | High | xUnit + SQL Server | Planned |
| API-21 | Tenant cannot view a draft invoice | `GET /api/invoices/{invoiceId}` | Tenant | 403 | High | xUnit + SQL Server | Planned |
| API-22 | Maintenance creation requires an active room contract | `POST /api/maintenance-requests` | Tenant | 400 | High | xUnit + SQL Server | Planned |
| API-23 | OpenAPI includes the Bearer scheme | `GET /swagger/v1/swagger.json` | Development | 200 | Medium | xUnit + JSON inspection | Planned |
| API-24 | CORS allows only a configured origin | Preflight `OPTIONS /api/rooms` | Browser client | 204/no allow header | High | xUnit + WebApplicationFactory | Planned |
| API-25 | Live health reports process health | `GET /health/live` | Anonymous | 200 | High | xUnit + WebApplicationFactory | Planned |
| API-26 | Ready health reports database outage | `GET /health/ready` | Anonymous | 503 | High | xUnit + unavailable SQL endpoint | Planned |
| API-27 | Error response never exposes a stack trace | Any failing endpoint | Any | Matching 4xx/5xx | High | xUnit + response inspection | Planned |
| API-28 | Unexpected 500 contains traceId and safe detail | Fault-injected endpoint | Authenticated | 500 | High | xUnit + test double | Planned |
| API-29 | Stateless logout confirms request | `POST /api/auth/logout` | Authenticated | 204 | Medium | xUnit + WebApplicationFactory | Planned |
| API-30 | Change-password path never logs passwords | `POST /api/auth/change-password` | Authenticated | 204/400/401 | High | xUnit + captured logger | Planned |
