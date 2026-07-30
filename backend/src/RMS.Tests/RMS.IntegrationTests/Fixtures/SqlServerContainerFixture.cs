using Microsoft.EntityFrameworkCore;
using RMS.Infrastructure.Data;
using Testcontainers.MsSql;

namespace RMS.IntegrationTests.Fixtures;

public sealed class SqlServerContainerFixture : IAsyncLifetime
{
    private readonly MsSqlContainer _container =
        new MsSqlBuilder(
            "mcr.microsoft.com/mssql/server:2022-CU14-ubuntu-22.04")
            .Build();

    public string ConnectionString => _container.GetConnectionString();

    public async Task InitializeAsync()
    {
        await _container.StartAsync();
        await using var context = CreateDbContext();
        await context.Database.MigrateAsync();
    }

    public async Task DisposeAsync()
    {
        await _container.DisposeAsync();
    }

    public AppDbContext CreateDbContext()
    {
        var options = new DbContextOptionsBuilder<AppDbContext>()
            .UseSqlServer(
                ConnectionString,
                sql => sql.EnableRetryOnFailure())
            .Options;
        return new AppDbContext(options);
    }

    public async Task ResetAsync()
    {
        await using var context = CreateDbContext();

        await context.MaintenanceRequestUpdates.ExecuteDeleteAsync();
        await context.Payments.ExecuteDeleteAsync();
        await context.MaintenanceRequests.ExecuteDeleteAsync();
        await context.Invoices.ExecuteDeleteAsync();
        await context.RentalContracts.ExecuteDeleteAsync();
        await context.Tenants.ExecuteDeleteAsync();
        await context.Rooms.ExecuteDeleteAsync();
        await context.Users.ExecuteDeleteAsync();
    }
}

[CollectionDefinition(Name, DisableParallelization = true)]
public sealed class SqlServerCollection :
    ICollectionFixture<SqlServerContainerFixture>
{
    public const string Name = "SQL Server integration";
}
