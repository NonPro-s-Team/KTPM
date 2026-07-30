# RMS API Smoke Result

- Date: 2026-07-30
- Environment: Windows, .NET SDK 10.0.302, Development, temporary SQL Server
  2022 CU14 container
- Database setup: committed migration applied; Development seed invoked
  explicitly through `--seed-development-data`

No password, access token, signing key, or connection string is recorded here.
The temporary API process, SQL Server container, and its ephemeral database
were removed after the run.

| Request/check | Actual | Expected | Result | Notes |
| --- | --- | --- | --- | --- |
| `GET /health/live` | 200 | 200 | Pass | Process health JSON returned |
| `GET /health/ready` | 200 | 200 | Pass | Database check healthy |
| `GET /swagger/index.html` | 200 | 200 | Pass | Development Swagger UI available at `/swagger` |
| OpenAPI Bearer scheme | Present | Present | Pass | JWT HTTP Bearer definition found |
| `POST /api/auth/login` as Admin | 200 | 200 | Pass | Token value not recorded |
| `POST /api/auth/login` as Staff | 200 | 200 | Pass | Token value not recorded |
| `POST /api/auth/login` as Tenant | 200 | 200 | Pass | Token value not recorded |
| `GET /api/rooms` without token | 401 | 401 | Pass | `application/problem+json`; code and traceId present |
| `POST /api/rooms` with Tenant JWT | 403 | 403 | Pass | `application/problem+json`; code and traceId present |
| `POST /api/rooms` with Admin JWT | 201 | 201 | Pass | Location header present |
| `GET /api/rooms/{createdId}` | 200 | 200 | Pass | Created room returned |
| `GET /api/rooms/{missingId}` | 404 | 404 | Pass | `application/problem+json`; code and traceId present |
| Malformed JSON to `POST /api/rooms` | 400 | 400 | Pass | ValidationProblemDetails, errors, code, and traceId present |
| Duplicate RoomNumber | 409 | 409 | Pass | Conflict ProblemDetails returned |
| `POST /api/tenants` safe response | 201 | 201 | Pass | No `PasswordHash` or `InitialPassword` field |
| CORS preflight from configured Vite origin | Allowed | Allowed | Pass | `http://localhost:5173` returned |

## Existing automated tests

The solution test run completed after Docker access was enabled:

- Unit tests: 165 passed, 0 failed, 0 skipped.
- SQL Server integration tests: 41 passed, 0 failed, 0 skipped.

The broad API automation scenarios remain `Planned` in
`docs/test-backlog.md`; this smoke record does not mark those deferred tests as
passed.
