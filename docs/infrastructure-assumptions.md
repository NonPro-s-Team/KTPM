# RMS Infrastructure Assumptions

1. The solution remains on `net10.0`; Infrastructure does not change target
   frameworks.
2. SQL Server 2022 is the relational database for development and integration
   tests.
3. `BillingPeriod` is persisted as a scalar `YYYYMM` integer named
   `BillingPeriodKey`.
4. Username is unique.
5. Room number is unique.
6. A Tenant `UserId` is unique, enforcing one Tenant profile per user.
7. Phone number and citizen ID are not unique because SRS 1.0 does not require
   it.
8. Core relationships use `Restrict` to preserve business and audit history.
9. RowVersion is a required shadow property on the six mutable aggregates.
10. JWT access-token lifetime is positive and cannot exceed 24 hours.
11. Bcrypt uses work factor 12.
12. Seed data is disabled by default, can be invoked only in Development, and
    requires passwords from configuration/environment.
13. Production and migration code never call `EnsureCreated`.
14. Relational integration tests use a real SQL Server 2022 Testcontainers
    instance, not EF InMemory.
15. Compatibility entities and legacy repository interfaces were removed
    after repository-wide reference analysis; none are part of the EF model.
16. Automatic overdue scheduling is not implemented.
17. Refresh tokens and token blacklisting are not implemented.
18. Mapping Application exceptions to HTTP responses remains an API-layer
    task.
19. The configured SQL Server collation controls username and room-number
    case sensitivity. The expected default deployment collation is
    case-insensitive; the unique indexes remain the authoritative behavior.
20. `GetActiveContractByTenantIdAsync` uses `SingleOrDefaultAsync`, deliberately
    surfacing corrupt data rather than silently selecting one active contract.
21. Payment notes have no Domain max-length constant, so they remain
    `nvarchar(max)`; maintenance notes use the Domain 2000-character limit.
22. The initial migration is generated with Infrastructure as both target and
    startup project because its design-time factory and Design package are
    self-contained.
