# RMS API Error Contract

RMS uses RFC 7807 Problem Details for every handled HTTP error. The response
content type is `application/problem+json`.

## ProblemDetails

```json
{
  "type": "https://httpstatuses.com/409",
  "title": "Conflict",
  "status": 409,
  "detail": "A room already has an active contract.",
  "instance": "/api/contracts/00000000-0000-0000-0000-000000000001/activate",
  "code": "BR-04",
  "traceId": "00-example-trace-id"
}
```

Fields:

- `type`: stable HTTP-status reference.
- `title`: short status category.
- `status`: HTTP status code.
- `detail`: safe, user-facing description.
- `instance`: request path.
- `code`: stable Application/Domain/API error code.
- `traceId`: distributed activity ID when available, otherwise the ASP.NET
  request trace identifier.

## ValidationProblemDetails

Model binding, missing body properties, invalid JSON values, and type/enum
conversion failures use:

```json
{
  "type": "https://httpstatuses.com/400",
  "title": "Validation failed",
  "status": 400,
  "detail": "One or more validation errors occurred.",
  "instance": "/api/auth/login",
  "code": "VALIDATION_ERROR",
  "traceId": "00-example-trace-id",
  "errors": {
    "username": [
      "The Username field is required."
    ]
  }
}
```

## Status and exception mapping

| Source | Status | Code |
| --- | --- | --- |
| JWT challenge / `AuthenticationException` | 401 | `UNAUTHENTICATED` or exception code |
| Authorization failure / `ForbiddenAccessException` | 403 | `FORBIDDEN` or exception code |
| `NotFoundException` | 404 | `NOT_FOUND` |
| `ConflictException` | 409 | Exception code, such as `BR-04`, `BR-10`, or `CONFLICT` |
| `ValidationException` | 400 | `VALIDATION_ERROR` |
| `BusinessRuleException` / `BusinessRuleViolationException` | 400 | Domain rule code |
| Other `DomainException` | 400 | Domain code |
| Malformed JSON / invalid HTTP request | 400 | `VALIDATION_ERROR` |
| Unmatched route | 404 | `NOT_FOUND` |
| Unsupported HTTP method | 405 | `HTTP_405` |
| Unknown exception | 500 | `INTERNAL_ERROR` |

Because the fallback policy protects the pipeline, an unauthenticated request
to an unknown `/api` route can receive 401 before a route-level 404 is emitted.
After successful authentication, an unmatched route uses the 404 mapping above.

## Examples

400 business/validation:

```json
{
  "type": "https://httpstatuses.com/400",
  "title": "Bad Request",
  "status": 400,
  "detail": "Payment amount must be greater than zero.",
  "instance": "/api/invoices/00000000-0000-0000-0000-000000000001/payments",
  "code": "BR-12",
  "traceId": "00-example"
}
```

401 authentication:

```json
{
  "type": "https://httpstatuses.com/401",
  "title": "Unauthorized",
  "status": 401,
  "detail": "Authentication is required or the access token is invalid.",
  "instance": "/api/rooms",
  "code": "UNAUTHENTICATED",
  "traceId": "00-example"
}
```

403 authorization:

```json
{
  "type": "https://httpstatuses.com/403",
  "title": "Forbidden",
  "status": 403,
  "detail": "You do not have permission to access this resource.",
  "instance": "/api/dashboard/summary",
  "code": "FORBIDDEN",
  "traceId": "00-example"
}
```

404 missing resource:

```json
{
  "type": "https://httpstatuses.com/404",
  "title": "Not Found",
  "status": 404,
  "detail": "Room with ID '00000000-0000-0000-0000-000000000001' was not found.",
  "instance": "/api/rooms/00000000-0000-0000-0000-000000000001",
  "code": "NOT_FOUND",
  "traceId": "00-example"
}
```

409 conflict:

```json
{
  "type": "https://httpstatuses.com/409",
  "title": "Conflict",
  "status": 409,
  "detail": "An invoice already exists for this contract and billing period.",
  "instance": "/api/invoices",
  "code": "BR-10",
  "traceId": "00-example"
}
```

500 unexpected failure:

```json
{
  "type": "https://httpstatuses.com/500",
  "title": "Internal Server Error",
  "status": 500,
  "detail": "An unexpected error occurred.",
  "instance": "/api/rooms",
  "code": "INTERNAL_ERROR",
  "traceId": "00-example"
}
```

No response contains stack traces, inner exceptions, SQL statements, database
or connection details, passwords, password hashes, JWT keys, or tokens.
