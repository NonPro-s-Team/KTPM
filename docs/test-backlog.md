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
