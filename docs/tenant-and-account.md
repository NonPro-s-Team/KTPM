# Tenant Profile & Tenant Account

## Core Rule

**Tenant Profile** and **Tenant Account** are two **separate entities**. Do not merge them into a single table/entity, and do not model the account as "just a login field on the tenant."

- **Tenant Profile (`Tenant`)**: personal information used for identification and contracts — e.g. full name, ID card/CCCD number, phone number, hometown, etc. This is the entity that Contracts reference.
- **Tenant Account (`Account`)**: login credentials used to access the app (username/password or similar), used in future phases for tenant self-service features.

## Relationship

- **Optional 1-0..1**: one Tenant Profile may have zero or one Tenant Account. One Tenant Account belongs to exactly one Tenant Profile.
- A Tenant Profile can exist and be fully usable (including being attached to Contracts) **without ever having an Account**.
- An Account, when created, must always be linked to an existing Tenant Profile — never created standalone.

## Ordering Rules

- A **Tenant Profile must exist before** it can be attached to a Contract.
- A **Tenant Account is fully optional** — it can be created before, after, or never, relative to when the Contract is created. Contract creation does not depend on the Account existing.

## MVP CRUD Scope

Both entities have full CRUD in MVP, exposed as separate modules/endpoints:
- Tenant Profile: Add / Edit / View (list + detail) / Delete
- Tenant Account: Add / Edit / View / Delete

## Why this separation matters for implementation

Keeping these separate avoids coupling authentication concerns to tenant identity data, and matches the real-world workflow: a landlord can record a new tenant's paperwork (profile) immediately, and only bother creating login credentials (account) later if/when the tenant actually needs app access.
