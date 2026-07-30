using FluentAssertions;
using Microsoft.EntityFrameworkCore;
using RMS.Application.Common.Exceptions;
using RMS.Domain.Constants;
using RMS.Domain.Enums;
using RMS.Infrastructure.Repositories;
using RMS.IntegrationTests.Fixtures;

namespace RMS.IntegrationTests.Repositories;

[Collection(SqlServerCollection.Name)]
public sealed class RentalContractRepositoryTests :
    SqlServerIntegrationTestBase
{
    public RentalContractRepositoryTests(
        SqlServerContainerFixture fixture)
        : base(fixture)
    {
    }

    [Fact]
    public async Task RentalContractRepository_GetById_IncludesRoomAndTenant()
    {
        Guid contractId;
        await using (var seedContext = Fixture.CreateDbContext())
        {
            var graph =
                await TestData.SeedActiveContractGraphAsync(seedContext);
            contractId = graph.Contract.Id;
        }

        await using var context = Fixture.CreateDbContext();
        var result = await new RentalContractRepository(context)
            .GetByIdAsync(contractId);

        result.Should().NotBeNull();
        result!.Room.Should().NotBeNull();
        result.Tenant.Should().NotBeNull();
        result.Tenant.User.Should().NotBeNull();
        context.Entry(result).Reference(item => item.Room).IsLoaded
            .Should()
            .BeTrue();
        context.Entry(result).Reference(item => item.Tenant).IsLoaded
            .Should()
            .BeTrue();
    }

    [Fact]
    public async Task ActiveContract_FirstForRoom_Succeeds()
    {
        await using var context = Fixture.CreateDbContext();
        var graph = await TestData.SeedActiveContractGraphAsync(context);

        (await context.RentalContracts.AnyAsync(
                contract =>
                    contract.Id == graph.Contract.Id
                    && contract.Status == ContractStatus.Active))
            .Should()
            .BeTrue();
    }

    [Fact]
    public async Task ActiveContract_SecondForSameRoom_ThrowsBR04()
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
        var user = TestData.User(UserRole.Tenant);
        var tenant = TestData.Tenant(user);
        var secondContract = TestData.Contract(
            room,
            tenant,
            active: true);
        context.AddRange(user, tenant, secondContract);

        var action = () => context.SaveChangesAsync();

        var exception = await action.Should()
            .ThrowAsync<ConflictException>();
        exception.Which.Code.Should()
            .Be(BusinessRuleCodes.SingleActiveContractPerRoom);
        exception.Which.Message.Should()
            .NotContain("UX_RentalContracts");
    }

    [Fact]
    public async Task DraftContracts_ForSameRoom_AreAllowed()
    {
        await using var context = Fixture.CreateDbContext();
        var room = TestData.Room();
        var firstUser = TestData.User(UserRole.Tenant);
        var firstTenant = TestData.Tenant(firstUser);
        var secondUser = TestData.User(UserRole.Tenant);
        var secondTenant = TestData.Tenant(secondUser);
        var first = TestData.Contract(room, firstTenant);
        var second = TestData.Contract(room, secondTenant);
        context.AddRange(
            room,
            firstUser,
            firstTenant,
            secondUser,
            secondTenant,
            first,
            second);

        await context.SaveChangesAsync();

        (await context.RentalContracts.CountAsync(
                contract => contract.RoomId == room.Id))
            .Should()
            .Be(2);
    }

    [Fact]
    public async Task ActiveContracts_ForDifferentRooms_AreAllowed()
    {
        await using var context = Fixture.CreateDbContext();

        var first = await TestData.SeedActiveContractGraphAsync(
            context,
            "ACTIVE-1");
        var second = await TestData.SeedActiveContractGraphAsync(
            context,
            "ACTIVE-2");

        (await context.RentalContracts.CountAsync(
                contract =>
                    contract.Id == first.Contract.Id
                    || contract.Id == second.Contract.Id))
            .Should()
            .Be(2);
    }
}
