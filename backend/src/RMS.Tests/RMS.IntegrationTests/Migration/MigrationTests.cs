using FluentAssertions;
using Microsoft.Data.SqlClient;
using Microsoft.EntityFrameworkCore;
using RMS.IntegrationTests.Fixtures;

namespace RMS.IntegrationTests.Migration;

[Collection(SqlServerCollection.Name)]
public sealed class MigrationTests : SqlServerIntegrationTestBase
{
    private static readonly string[] ExpectedTables =
    [
        "Invoices",
        "MaintenanceRequests",
        "MaintenanceRequestUpdates",
        "Payments",
        "RentalContracts",
        "Rooms",
        "Tenants",
        "Users"
    ];

    public MigrationTests(SqlServerContainerFixture fixture)
        : base(fixture)
    {
    }

    [Fact]
    public async Task Migration_EmptyDatabase_CreatesExpectedTables()
    {
        var tables = await ReadTableNamesAsync();

        tables.Should().BeEquivalentTo(ExpectedTables);
    }

    [Fact]
    public async Task Migration_EmptyDatabase_CreatesExpectedIndexes()
    {
        var indexes = await ReadIndexesAsync();

        indexes.Keys.Should().Contain(
            [
                "UX_Users_Username",
                "UX_Tenants_UserId",
                "UX_Rooms_RoomNumber",
                "IX_RentalContracts_RoomId",
                "UX_RentalContracts_Room_Active",
                "UX_Invoices_Contract_BillingPeriod",
                "IX_Payments_InvoiceId_PaidAt",
                "IX_MaintenanceRequestUpdates_Request_OccurredAt"
            ]);
        indexes["UX_RentalContracts_Room_Active"].IsUnique
            .Should()
            .BeTrue();
        indexes["UX_RentalContracts_Room_Active"].Filter
            .Should()
            .Contain("Status")
            .And.Contain("2");
        indexes["UX_Invoices_Contract_BillingPeriod"].IsUnique
            .Should()
            .BeTrue();
    }

    [Fact]
    public async Task Migration_CanBeAppliedTwiceWithoutPendingChanges()
    {
        await using var context = Fixture.CreateDbContext();

        await context.Database.MigrateAsync();
        await context.Database.MigrateAsync();
        var pending = await context.Database.GetPendingMigrationsAsync();

        pending.Should().BeEmpty();
    }

    [Fact]
    public async Task Migration_ModelHasNoLegacyTables()
    {
        var tables = await ReadTableNamesAsync();

        tables.Should().NotContain(
            [
                "Contracts",
                "UtilityReadings",
                "RepairRequests",
                "Dashboard"
            ]);
    }

    private async Task<string[]> ReadTableNamesAsync()
    {
        await using var connection =
            new SqlConnection(Fixture.ConnectionString);
        await connection.OpenAsync();
        await using var command = connection.CreateCommand();
        command.CommandText =
            """
            SELECT [TABLE_NAME]
            FROM [INFORMATION_SCHEMA].[TABLES]
            WHERE [TABLE_TYPE] = 'BASE TABLE'
              AND [TABLE_NAME] <> '__EFMigrationsHistory'
            ORDER BY [TABLE_NAME];
            """;
        await using var reader = await command.ExecuteReaderAsync();
        var names = new List<string>();
        while (await reader.ReadAsync())
        {
            names.Add(reader.GetString(0));
        }

        return names.ToArray();
    }

    private async Task<Dictionary<string, IndexInfo>> ReadIndexesAsync()
    {
        await using var connection =
            new SqlConnection(Fixture.ConnectionString);
        await connection.OpenAsync();
        await using var command = connection.CreateCommand();
        command.CommandText =
            """
            SELECT [i].[name], [i].[is_unique], [i].[filter_definition]
            FROM [sys].[indexes] AS [i]
            INNER JOIN [sys].[tables] AS [t]
                ON [t].[object_id] = [i].[object_id]
            WHERE [i].[name] IS NOT NULL;
            """;
        await using var reader = await command.ExecuteReaderAsync();
        var indexes = new Dictionary<string, IndexInfo>(
            StringComparer.Ordinal);
        while (await reader.ReadAsync())
        {
            indexes[reader.GetString(0)] = new IndexInfo(
                reader.GetBoolean(1),
                reader.IsDBNull(2) ? string.Empty : reader.GetString(2));
        }

        return indexes;
    }

    private sealed record IndexInfo(bool IsUnique, string Filter);
}
