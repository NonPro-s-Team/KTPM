# RMS API Overview

## Responsibility

`RMS.API` is the HTTP boundary for the Rental Management System. It accepts
REST requests, binds route/query/body values, invokes canonical Application
Services, and translates results into HTTP responses. Controllers do not use
`AppDbContext`, repositories, domain entities, password hashing, JWT creation,
or `SaveChanges`.

The request flow is:

```text
HTTP request
  -> ASP.NET Core authentication and authorization
  -> Controller
  -> RMS.Application service
  -> Application response DTO
  -> HTTP response
```

Application and Domain exceptions follow one global path:

```text
Exception
  -> ExceptionHandlingMiddleware
  -> RFC 7807 ProblemDetails
  -> application/problem+json response
```

## Authentication

`POST /api/auth/login` validates credentials through `IAuthService` and returns
a JWT access token in the response body. The API does not set an authentication
cookie. JWT validation uses the same required `Jwt` configuration as
`JwtAccessTokenService`: issuer, audience, HMAC-SHA256 signing key, expiration,
`NameIdentifier`, `Name`, and `Role`.

Issuer, audience, key, and token lifetime are validated at startup. The signing
key is supplied through environment variables or a secret store and is never
stored in appsettings. Token clock skew is zero, so an expired token stops being
accepted immediately.

## Authorization

A fallback authorization policy requires an authenticated user for every
endpoint unless `[AllowAnonymous]` is explicit. Anonymous access is limited to:

- `POST /api/auth/login`
- `GET /health/live`
- `GET /health/ready`

HTTP-boundary policies are:

- `AdminOnly`: Admin.
- `AdminOrStaff`: Admin or Staff.
- `TenantOnly`: Tenant.

Application Services also enforce roles and ownership. HTTP policies are an
additional boundary and do not replace Application authorization.

## Errors and validation

All handled failures use RFC 7807 `ProblemDetails` with `type`, `title`,
`status`, `detail`, `instance`, `code`, and `traceId`. Model binding and request
validation use `ValidationProblemDetails` with the same extensions. Responses
never expose stack traces, inner exceptions, SQL text, connection strings,
password hashes, signing keys, or access tokens.

See [api-error-contract.md](api-error-contract.md) for the complete contract and
status mapping.

## JSON serialization

The API uses `System.Text.Json` with:

- camel-case property and dictionary-key names;
- enum values serialized as camel-case strings;
- public properties only (`IncludeFields` is disabled);
- no reference-preservation or cycle-hiding behavior.

Application response DTOs are returned directly. Success responses are not
wrapped in a `success/data` envelope.

## CORS

The named `Frontend` policy reads allowed origins from
`Cors:AllowedOrigins`. It permits the methods and headers required by the React
client, including the `Authorization` header. It does not enable credentials
and never combines wildcard origins with credentials. Non-Development startup
fails when no allowed origin is configured.

## OpenAPI and Swagger

Development exposes:

- Swagger UI: `/swagger`
- OpenAPI JSON: `/swagger/v1/swagger.json`

The document is titled `RMS API`, uses version `v1`, documents controller
summaries and response types, and includes a JWT Bearer security scheme.
Swagger middleware is not enabled outside Development.

## Health checks

- `GET /health/live` checks only that the process and HTTP pipeline are alive.
- `GET /health/ready` checks SQL Server connectivity through
  `AppDbContext.Database.CanConnectAsync`.

Healthy responses use 200; unhealthy readiness uses 503. The JSON response
contains only overall/check names and statuses, never database error details or
configuration.

## Startup behavior

Normal startup does not call `EnsureCreated`, apply migrations, or seed data.
Development seed remains an explicit CLI operation:

```powershell
dotnet run --project backend/src/RMS.API --no-launch-profile -- --seed-development-data
```
