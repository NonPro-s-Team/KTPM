# Authentication (Account Module)

## Entity Design

A single shared `Account` entity handles authentication for both the Landlord and (future phase) self-service Tenant login.

```
Account
- Id            (Guid)
- Email         (string, unique, used as login identifier)
- PasswordHash  (string, BCrypt hash — never store plaintext)
- Role          (enum: Landlord, Tenant)
- TenantId      (Guid?, nullable FK -> Tenant Profile; populated ONLY when Role = Tenant)
- IsActive      (bool, default true)
- CreatedAt     (DateTimeOffset)
- UpdatedAt     (DateTimeOffset)
```

Rules:
- `Role = Landlord` → `TenantId` must be `null`.
- `Role = Tenant` → `TenantId` must reference an existing Tenant Profile (see `@docs/tenant-and-account.md`).
- `Email` is unique across ALL accounts regardless of role (one email = one account).

## MVP Scope

- The only role that actually needs to log in and use the app today is **Landlord** (single user).
- Register / Login / Forgot Password are built for the shared `Account` entity from day one so that enabling Tenant self-service later doesn't require reworking auth — but there's no tenant-facing UI/flow consuming it yet.

## Functional Requirements

### 1. Register
- Input: Email, Password, Role (for MVP, only `Landlord` registration is actually exercised; the field/logic should still support `Tenant` for forward compatibility).
- Validate: email format, email uniqueness, password meets minimum complexity (define a simple baseline: min 8 characters).
- Hash password with **BCrypt** before storing — never store or log the plaintext password.
- On success: create the Account record. Decide (and document in code) whether registration auto-logs-in (returns a token) or just confirms creation — default to **not** auto-issuing a token on register; require a separate login call.

### 2. Login
- Input: Email, Password.
- Look up Account by email, verify password against the BCrypt hash.
- On success: issue a **JWT** containing at minimum: `sub` (Account Id), `email`, `role`. Include an expiry (`exp`) claim.
- On failure (wrong email or wrong password): return a generic "invalid credentials" error — do NOT reveal whether the email exists or the password was wrong (avoids user enumeration).

### 3. Forgot Password
- Input: Email.
- If the email exists, generate a password reset token (random, single-use, time-limited — e.g. 30–60 minutes) and associate it with the Account.
- **Always return the same generic success response** regardless of whether the email exists, to avoid leaking which emails are registered.
- Actual email delivery (SMTP/sending service) is out of scope for this pass — for now, it's acceptable to return the token in the API response for local testing/dev only, clearly marked as a temporary dev-only shortcut, OR log it server-side. This must be revisited before production (real email delivery required).

### 4. Reset Password
- Input: reset token, new password.
- Validate token exists, is not expired, and not already used.
- Hash the new password with BCrypt, update the Account, invalidate the token (mark used / delete it).

## Technical Requirements

- **Password hashing:** BCrypt (e.g. `BCrypt.Net-Next` NuGet package). Never use a reversible encryption or plain SHA hash for passwords.
- **JWT:** issued on login, used as Bearer token for all subsequent authenticated requests. Configure signing key, issuer, audience, and expiry via `appsettings.json` / configuration (not hardcoded).
- **Authorization:** once other modules (Rooms, Contracts, Invoices, Tenants) are built, their endpoints should require a valid JWT (`[Authorize]`). Role-based restriction (e.g. only `Landlord` can access landlord-only endpoints) can use the `Role` claim.

## Non-Goals for This Pass

- Tenant self-service registration/login UI — data model supports it, but no active flow yet.
- Refresh tokens / token revocation — out of scope for MVP; plain JWT with expiry is enough for now.
- Real email delivery for forgot-password — dev-only placeholder is acceptable for MVP.
