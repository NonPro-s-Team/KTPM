using FluentAssertions;
using Microsoft.EntityFrameworkCore;
using RMS.Application.Common.Exceptions;
using RMS.Domain.Constants;
using RMS.Domain.Enums;
using RMS.Infrastructure.Repositories;
using RMS.IntegrationTests.Fixtures;

namespace RMS.IntegrationTests.Concurrency;

[Collection(SqlServerCollection.Name)]
public sealed class ConcurrencyAndDeleteBehaviorTests :
    SqlServerIntegrationTestBase
{
    public ConcurrencyAndDeleteBehaviorTests(
        SqlServerContainerFixture fixture)
        : base(fixture)
    {
    }

    [Fact]
    public async Task ConcurrentInvoiceUpdates_SecondSaveThrowsConflict()
    {
        Guid invoiceId;
        Guid recorderId;
        await using (var seedContext = Fixture.CreateDbContext())
        {
            var graph =
                await TestData.SeedIssuedInvoiceGraphAsync(seedContext);
            invoiceId = graph.Invoice.Id;
            recorderId = graph.Recorder.Id;
        }

        await using var firstContext = Fixture.CreateDbContext();
        await using var secondContext = Fixture.CreateDbContext();
        var first = await new InvoiceRepository(firstContext)
            .GetByIdAsync(invoiceId);
        var second = await new InvoiceRepository(secondContext)
            .GetByIdAsync(invoiceId);
        first!.RegisterPayment(
            100_000m,
            "First writer",
            recorderId,
            TestData.Now);
        second!.RegisterPayment(
            100_000m,
            "Stale writer",
            recorderId,
            TestData.Now);

        await firstContext.SaveChangesAsync();
        var action = () => secondContext.SaveChangesAsync();

        var exception = await action.Should()
            .ThrowAsync<ConflictException>();
        exception.Which.Code.Should()
            .Be(ApplicationErrorCodes.ConcurrencyConflict);

        await using var verification = Fixture.CreateDbContext();
        var persisted = await verification.Invoices
            .SingleAsync(invoice => invoice.Id == invoiceId);
        persisted.PaidAmount.Should().Be(100_000m);
        (await verification.Payments.CountAsync(
                payment => payment.InvoiceId == invoiceId))
            .Should()
            .Be(1);
    }

    [Fact]
    public async Task ConcurrentRoomUpdates_SecondSaveThrowsConflict()
    {
        Guid roomId;
        await using (var seedContext = Fixture.CreateDbContext())
        {
            var room = TestData.Room("CONCURRENT-ROOM");
            seedContext.Rooms.Add(room);
            await seedContext.SaveChangesAsync();
            roomId = room.Id;
        }

        await using var firstContext = Fixture.CreateDbContext();
        await using var secondContext = Fixture.CreateDbContext();
        var first = await new RoomRepository(firstContext)
            .GetByIdAsync(roomId);
        var second = await new RoomRepository(secondContext)
            .GetByIdAsync(roomId);
        first!.UpdateDetails(
            "CONCURRENT-ROOM-A",
            3_600_000m,
            null,
            TestData.Now);
        second!.UpdateDetails(
            "CONCURRENT-ROOM-B",
            3_700_000m,
            null,
            TestData.Now);

        await firstContext.SaveChangesAsync();
        var action = () => secondContext.SaveChangesAsync();

        var exception = await action.Should()
            .ThrowAsync<ConflictException>();
        exception.Which.Code.Should()
            .Be(ApplicationErrorCodes.ConcurrencyConflict);
    }

    [Fact]
    public async Task ConcurrentActiveContractCreation_OnlyOneSucceeds()
    {
        Guid roomId;
        Guid firstTenantId;
        Guid secondTenantId;
        await using (var seedContext = Fixture.CreateDbContext())
        {
            var room = TestData.Room("RACE-CONTRACT");
            var firstUser = TestData.User(UserRole.Tenant);
            var firstTenantSeed = TestData.Tenant(firstUser);
            var secondUser = TestData.User(UserRole.Tenant);
            var secondTenantSeed = TestData.Tenant(secondUser);
            seedContext.AddRange(
                room,
                firstUser,
                firstTenantSeed,
                secondUser,
                secondTenantSeed);
            await seedContext.SaveChangesAsync();
            roomId = room.Id;
            firstTenantId = firstTenantSeed.Id;
            secondTenantId = secondTenantSeed.Id;
        }

        await using var firstContext = Fixture.CreateDbContext();
        await using var secondContext = Fixture.CreateDbContext();
        var firstRoom = await firstContext.Rooms.FindAsync(roomId);
        var firstTenant = await firstContext.Tenants.FindAsync(firstTenantId);
        var secondRoom = await secondContext.Rooms.FindAsync(roomId);
        var secondTenant = await secondContext.Tenants.FindAsync(secondTenantId);
        firstContext.RentalContracts.Add(
            TestData.Contract(
                firstRoom!,
                firstTenant!,
                active: true,
                occupyRoom: false));
        secondContext.RentalContracts.Add(
            TestData.Contract(
                secondRoom!,
                secondTenant!,
                active: true,
                occupyRoom: false));

        var outcomes = await Task.WhenAll(
            CaptureAsync(() => firstContext.SaveChangesAsync()),
            CaptureAsync(() => secondContext.SaveChangesAsync()));

        outcomes.Count(outcome => outcome is null).Should().Be(1);
        outcomes.OfType<ConflictException>()
            .Should()
            .ContainSingle(exception =>
                exception.Code
                == BusinessRuleCodes.SingleActiveContractPerRoom);
        await using var verification = Fixture.CreateDbContext();
        (await verification.RentalContracts.CountAsync(
                contract =>
                    contract.RoomId == roomId
                    && contract.Status == ContractStatus.Active))
            .Should()
            .Be(1);
    }

    [Fact]
    public async Task ConcurrentDuplicateInvoiceCreation_OnlyOneSucceeds()
    {
        Guid contractId;
        await using (var seedContext = Fixture.CreateDbContext())
        {
            var graph =
                await TestData.SeedActiveContractGraphAsync(seedContext);
            contractId = graph.Contract.Id;
        }

        await using var firstContext = Fixture.CreateDbContext();
        await using var secondContext = Fixture.CreateDbContext();
        var firstContract = await firstContext.RentalContracts
            .SingleAsync(contract => contract.Id == contractId);
        var secondContract = await secondContext.RentalContracts
            .SingleAsync(contract => contract.Id == contractId);
        firstContext.Invoices.Add(TestData.Invoice(firstContract));
        secondContext.Invoices.Add(TestData.Invoice(secondContract));

        var outcomes = await Task.WhenAll(
            CaptureAsync(() => firstContext.SaveChangesAsync()),
            CaptureAsync(() => secondContext.SaveChangesAsync()));

        outcomes.Count(outcome => outcome is null).Should().Be(1);
        outcomes.OfType<ConflictException>()
            .Should()
            .ContainSingle(exception =>
                exception.Code
                == BusinessRuleCodes.SingleInvoicePerBillingPeriod);
        await using var verification = Fixture.CreateDbContext();
        (await verification.Invoices.CountAsync(
                invoice => invoice.ContractId == contractId))
            .Should()
            .Be(1);
    }

    [Fact]
    public async Task DeletingRoomWithContract_IsRestricted()
    {
        Guid roomId;
        await using (var seedContext = Fixture.CreateDbContext())
        {
            var graph =
                await TestData.SeedActiveContractGraphAsync(seedContext);
            roomId = graph.Room.Id;
        }

        await using var context = Fixture.CreateDbContext();
        var room = await context.Rooms.SingleAsync(item => item.Id == roomId);
        context.Rooms.Remove(room);

        await FluentActions.Invoking(() => context.SaveChangesAsync())
            .Should()
            .ThrowAsync<DbUpdateException>();
    }

    [Fact]
    public async Task DeletingInvoiceWithPayments_IsRestricted()
    {
        Guid invoiceId;
        await using (var seedContext = Fixture.CreateDbContext())
        {
            var graph =
                await TestData.SeedIssuedInvoiceGraphAsync(seedContext);
            graph.Invoice.RegisterPayment(
                100_000m,
                null,
                graph.Recorder.Id,
                TestData.Now);
            await seedContext.SaveChangesAsync();
            invoiceId = graph.Invoice.Id;
        }

        await using var context = Fixture.CreateDbContext();
        var invoice = await context.Invoices.SingleAsync(
            item => item.Id == invoiceId);
        context.Invoices.Remove(invoice);

        await FluentActions.Invoking(() => context.SaveChangesAsync())
            .Should()
            .ThrowAsync<DbUpdateException>();
    }

    [Fact]
    public async Task DeletingUserReferencedByTenant_IsRestricted()
    {
        Guid userId;
        await using (var seedContext = Fixture.CreateDbContext())
        {
            var graph =
                await TestData.SeedActiveContractGraphAsync(seedContext);
            userId = graph.TenantUser.Id;
        }

        await using var context = Fixture.CreateDbContext();
        var user = await context.Users.SingleAsync(item => item.Id == userId);
        context.Users.Remove(user);

        await FluentActions.Invoking(() => context.SaveChangesAsync())
            .Should()
            .ThrowAsync<DbUpdateException>();
    }

    private static async Task<Exception?> CaptureAsync(Func<Task> action)
    {
        try
        {
            await action();
            return null;
        }
        catch (Exception exception)
        {
            return exception;
        }
    }
}
