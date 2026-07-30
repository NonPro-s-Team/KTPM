using FluentAssertions;
using Microsoft.EntityFrameworkCore;
using RMS.Domain.Entities;
using RMS.Domain.Enums;
using RMS.Infrastructure.Repositories;
using RMS.IntegrationTests.Fixtures;

namespace RMS.IntegrationTests.Repositories;

[Collection(SqlServerCollection.Name)]
public sealed class MaintenanceDashboardTests :
    SqlServerIntegrationTestBase
{
    public MaintenanceDashboardTests(SqlServerContainerFixture fixture)
        : base(fixture)
    {
    }

    [Fact]
    public async Task MaintenanceRequest_AddTransition_PersistsUpdateHistory()
    {
        await using var context = Fixture.CreateDbContext();
        var graph = await TestData.SeedActiveContractGraphAsync(context);
        var updater = TestData.User(UserRole.Staff);
        var request = new MaintenanceRequest(
            graph.Tenant.Id,
            graph.Room.Id,
            "Leaking pipe",
            "Water is leaking.",
            TestData.Now);
        request.StartProgress(
            updater.Id,
            "Assigned",
            TestData.Now.AddMinutes(1));
        context.AddRange(updater, request);

        await context.SaveChangesAsync();
        context.ChangeTracker.Clear();

        var update = await context.MaintenanceRequestUpdates
            .SingleAsync();
        update.MaintenanceRequestId.Should().Be(request.Id);
        update.PreviousStatus.Should()
            .Be(MaintenanceRequestStatus.Submitted);
        update.NewStatus.Should()
            .Be(MaintenanceRequestStatus.InProgress);
    }

    [Fact]
    public async Task MaintenanceRepository_GetById_IncludesUpdates()
    {
        Guid requestId;
        await using (var seedContext = Fixture.CreateDbContext())
        {
            var graph =
                await TestData.SeedActiveContractGraphAsync(seedContext);
            var updater = TestData.User(UserRole.Staff);
            var request = new MaintenanceRequest(
                graph.Tenant.Id,
                graph.Room.Id,
                "Broken light",
                "The ceiling light is broken.",
                TestData.Now);
            request.StartProgress(
                updater.Id,
                "Investigating",
                TestData.Now.AddMinutes(1));
            request.AddProgressNote(
                updater.Id,
                "Replacement ordered",
                TestData.Now.AddMinutes(2));
            seedContext.AddRange(updater, request);
            await seedContext.SaveChangesAsync();
            requestId = request.Id;
        }

        await using var context = Fixture.CreateDbContext();
        var result = await new MaintenanceRequestRepository(context)
            .GetByIdAsync(requestId);

        result.Should().NotBeNull();
        result!.Updates.Should().HaveCount(2);
        result.Updates.Select(update => update.Note)
            .Should()
            .Equal("Investigating", "Replacement ordered");
        context.Entry(result).Collection(request => request.Updates).IsLoaded
            .Should()
            .BeTrue();
    }

    [Theory]
    [InlineData(true)]
    [InlineData(false)]
    public async Task Maintenance_TenantAndRoomForeignKeys_AreEnforced(
        bool invalidTenant)
    {
        await using var context = Fixture.CreateDbContext();
        var user = TestData.User(UserRole.Tenant);
        var tenant = TestData.Tenant(user);
        var room = TestData.Room();
        context.AddRange(user, tenant, room);
        await context.SaveChangesAsync();

        var request = new MaintenanceRequest(
            invalidTenant ? Guid.NewGuid() : tenant.Id,
            invalidTenant ? room.Id : Guid.NewGuid(),
            "Invalid relationship",
            "This request must fail its foreign key.",
            TestData.Now);
        context.MaintenanceRequests.Add(request);

        var action = () => context.SaveChangesAsync();

        await action.Should().ThrowAsync<DbUpdateException>();
    }

    [Fact]
    public async Task DashboardSummary_ReturnsCorrectCounts()
    {
        await using var context = Fixture.CreateDbContext();
        var graph = await TestData.SeedActiveContractGraphAsync(context);
        var availableRoom = TestData.Room("DASHBOARD-AVAILABLE");
        var updater = TestData.User(UserRole.Staff);

        var submitted = new MaintenanceRequest(
            graph.Tenant.Id,
            graph.Room.Id,
            "Submitted",
            "Submitted request.",
            TestData.Now);
        var inProgress = new MaintenanceRequest(
            graph.Tenant.Id,
            graph.Room.Id,
            "In progress",
            "In-progress request.",
            TestData.Now);
        inProgress.StartProgress(
            updater.Id,
            null,
            TestData.Now.AddMinutes(1));
        var resolved = new MaintenanceRequest(
            graph.Tenant.Id,
            graph.Room.Id,
            "Resolved",
            "Resolved request.",
            TestData.Now);
        resolved.StartProgress(
            updater.Id,
            null,
            TestData.Now.AddMinutes(1));
        resolved.Resolve(
            updater.Id,
            "Resolved",
            TestData.Now.AddMinutes(2));

        var issued = TestData.Invoice(
            graph.Contract,
            month: 1,
            issued: true);
        var overdue = TestData.Invoice(
            graph.Contract,
            month: 2,
            issued: true);
        overdue.MarkOverdue(TestData.Now);
        var draft = TestData.Invoice(graph.Contract, month: 3);
        context.AddRange(
            availableRoom,
            updater,
            submitted,
            inProgress,
            resolved,
            issued,
            overdue,
            draft);
        await context.SaveChangesAsync();

        var summary = await new DashboardReadRepository(context)
            .GetSummaryAsync();

        summary.TotalRooms.Should().Be(2);
        summary.OccupiedRooms.Should().Be(1);
        summary.ActiveMaintenanceRequests.Should().Be(2);
        summary.UnpaidInvoices.Should().Be(2);
    }
}
