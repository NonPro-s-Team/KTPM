# RMS API Setup

## Prerequisites

- .NET SDK 10
- SQL Server 2022, normally through the repository Docker Compose service
- Applied RMS EF Core migration
- Development seed only when login-ready demo data is needed

## Configuration

Copy `.env.example` to an ignored local `.env` or set equivalent environment
variables. Required runtime values are:

```text
ConnectionStrings__DefaultConnection
Jwt__Issuer
Jwt__Audience
Jwt__Key
Jwt__ExpirationMinutes
Cors__AllowedOrigins__0
```

`Jwt__Key` must contain at least 32 UTF-8 bytes. Token lifetime must be between
1 and 1440 minutes. Do not commit `.env`, passwords, connection credentials,
seed passwords, or signing keys.

Development allows `http://localhost:5173` through
`appsettings.Development.json`. Configure production origins through
environment/configuration; startup rejects an empty production origin list.

## Database

Start local SQL Server:

```powershell
docker compose --env-file .env up -d sqlserver
docker compose ps
```

Apply the committed migration:

```powershell
$env:ASPNETCORE_ENVIRONMENT = "Development"
./scripts/database-update.ps1
```

Normal API startup never migrates or seeds the database.

## Development seed

Set `SeedData__Enabled=true` and all seed passwords through local environment
variables, then run the explicit CLI mode:

```powershell
dotnet run --project backend/src/RMS.API `
  --no-launch-profile -- --seed-development-data
```

The command is Development-only. It does not run during normal startup.

## Run

With configuration available:

```powershell
dotnet run --project backend/src/RMS.API --launch-profile http
```

Default Development URLs:

- API: `http://localhost:5000`
- Swagger UI: `http://localhost:5000/swagger`
- OpenAPI JSON: `http://localhost:5000/swagger/v1/swagger.json`
- Live health: `http://localhost:5000/health/live`
- Ready health: `http://localhost:5000/health/ready`

Swagger is enabled only in Development.

## JWT login

Send credentials in a JSON request body:

```http
POST /api/auth/login
Content-Type: application/json

{
  "username": "admin",
  "password": "<local-seed-password>"
}
```

Use the returned access token on protected requests:

```http
Authorization: Bearer <access-token>
```

Do not place passwords or tokens in query strings, source files, logs, or
committed HTTP files.

## Manual smoke requests

Open `backend/src/RMS.API/RMS.API.http`, fill local password/token/ID variables,
and run requests in order. The file covers health, three roles, rooms, tenants,
contracts, invoices/payments, maintenance workflow, and dashboard. It contains
no real credential or JWT.

## Common failures

- Startup reports `ConnectionStrings:DefaultConnection is required`: set the
  runtime connection string.
- Startup reports JWT validation errors: set issuer, audience, a 32-byte-or-
  longer key, and a lifetime from 1 to 1440 minutes.
- Ready health returns 503: start SQL Server, verify the connection string, and
  apply migrations.
- API returns 401: include a current JWT with the `Bearer` scheme.
- API returns 403: the JWT role or tenant ownership does not permit the action.
- Browser CORS failure: add the exact frontend origin (scheme, host, and port)
  to `Cors:AllowedOrigins`; do not add a path.
- `/swagger` is unavailable outside Development. An unauthenticated request can
  receive the global 401 response before route matching; an authenticated
  request receives 404.
