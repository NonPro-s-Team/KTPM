# Contract Management

## Contract ↔ Room

- A Contract is linked to **exactly one Room**.
- A Room can have **at most one active Contract at a time**. Before creating a new active contract for a room, any previous contract on that room must no longer be active (ended/terminated).

## Contract ↔ Tenant Profile (many-to-many)

A single Contract can have **multiple tenants living together** under it (e.g. a 3-person room signs one shared contract), not one contract per tenant.

This is modeled as a **many-to-many relationship** through a join entity, e.g. `ContractTenant`:

- `ContractTenant` has a `Role` field distinguishing:
  - **Representative** — the tenant who signed the contract, i.e. the primary/responsible party (thằng đại diện ký).
  - **CoTenant** — other tenants living in the room under the same contract, not the signer.
- **Every Contract must have exactly one Representative** — never zero, never more than one. Enforce this as a hard business rule.
- CoTenants are optional and can be zero or more.

## Ordering Rules

- A **Tenant Profile must already exist** before it can be attached to a Contract (as Representative or CoTenant). See `@docs/tenant-and-account.md`.
- A **Tenant Account is not required** to create a Contract — Contracts reference Tenant Profiles, not Accounts.

## Data Entry

- Contracts can be added either by **scanning the signed paper contract** (image upload) or by **manual data entry** — both paths should result in the same Contract entity/fields being populated.
- Each contract is associated with a tenant (via `ContractTenant`), not directly with an Account.

## CRUD Scope (MVP)

- **Create:** new contract, from image or manual entry
- **Read:** basic (list) and detail views
- **Update:** edit contract info
- **Delete:** remove contract

## Relationship to Invoices

See `@docs/invoice-billing.md` — Invoices are generated against a Room's **currently active Contract**, not directly against a Tenant Profile or Room in isolation.
