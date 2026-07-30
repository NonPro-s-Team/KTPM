using FluentAssertions;
using Microsoft.EntityFrameworkCore;
using RMS.Application.Common.Exceptions;
using RMS.Application.Common.Models;
using RMS.Domain.Entities;
using RMS.Domain.Enums;
using RMS.Infrastructure.Repositories;
using RMS.Infrastructure.Security;
using RMS.IntegrationTests.Fixtures;

namespace RMS.IntegrationTests.Repositories;

[Collection(SqlServerCollection.Name)]
public sealed class UserTenantRoomRepositoryTests :
    SqlServerIntegrationTestBase
{
    public UserTenantRoomRepositoryTests(SqlServerContainerFixture fixture)
        : base(fixture)
    {
    }

    [Fact]
    public async Task UserRepository_AddAndGetByUsername_RoundTrips()
    {
        await using var context = Fixture.CreateDbContext();
        var repository = new UserRepository(context);
        var user = TestData.User(username: "roundtrip-user");

        repository.Add(user);
        await context.SaveChangesAsync();
        context.ChangeTracker.Clear();

        var result = await repository.GetByUsernameAsync(
            "  roundtrip-user  ");

        result.Should().NotBeNull();
        result!.Id.Should().Be(user.Id);
        context.Entry(result).State.Should().Be(EntityState.Unchanged);
    }

    [Fact]
    public async Task UserRepository_DuplicateUsername_ThrowsConflict()
    {
        await using var context = Fixture.CreateDbContext();
        var repository = new UserRepository(context);
        repository.Add(TestData.User(username: "duplicate-user"));
        await context.SaveChangesAsync();

        repository.Add(TestData.User(username: "duplicate-user"));
        var action = () => context.SaveChangesAsync();

        var exception = await action.Should()
            .ThrowAsync<ConflictException>();
        exception.Which.Code.Should()
            .Be(ApplicationErrorCodes.UsernameAlreadyExists);
        exception.Which.Message.Should().NotContain("UX_Users");
    }

    [Fact]
    public void PasswordHasher_HashAndVerify_Works()
    {
        var hasher = new PasswordHasher();

        var hash = hasher.Hash("integration-test-password");

        hash.Should().NotBe("integration-test-password");
        hasher.Verify("integration-test-password", hash).Should().BeTrue();
        hasher.Verify("wrong", hash).Should().BeFalse();
    }

    [Fact]
    public async Task TenantRepository_GetById_IncludesUser()
    {
        Guid tenantId;
        await using (var seedContext = Fixture.CreateDbContext())
        {
            var user = TestData.User(UserRole.Tenant);
            var tenant = TestData.Tenant(user);
            seedContext.AddRange(user, tenant);
            await seedContext.SaveChangesAsync();
            tenantId = tenant.Id;
        }

        await using var context = Fixture.CreateDbContext();
        var tenantRepository = new TenantRepository(context);

        var result = await tenantRepository.GetByIdAsync(tenantId);

        result.Should().NotBeNull();
        result!.User.Should().NotBeNull();
        result.User.Id.Should().NotBe(Guid.Empty);
        context.Entry(result).Reference(item => item.User).IsLoaded
            .Should()
            .BeTrue();
    }

    [Fact]
    public async Task CreateUserAndTenant_OneSave_PersistsBoth()
    {
        var user = TestData.User(UserRole.Tenant);
        var tenant = TestData.Tenant(user);
        await using (var context = Fixture.CreateDbContext())
        {
            new UserRepository(context).Add(user);
            new TenantRepository(context).Add(tenant);

            await context.SaveChangesAsync();
        }

        await using var verification = Fixture.CreateDbContext();
        (await verification.Users.AnyAsync(item => item.Id == user.Id))
            .Should()
            .BeTrue();
        (await verification.Tenants.AnyAsync(item => item.Id == tenant.Id))
            .Should()
            .BeTrue();
    }

    [Fact]
    public async Task Tenant_UserId_IsUnique()
    {
        await using var context = Fixture.CreateDbContext();
        var user = TestData.User(UserRole.Tenant);
        context.AddRange(user, TestData.Tenant(user));
        await context.SaveChangesAsync();
        context.ChangeTracker.Clear();

        context.Tenants.Add(TestData.Tenant(user));

        var action = () => context.SaveChangesAsync();

        var exception = await action.Should()
            .ThrowAsync<ConflictException>();
        exception.Which.Code.Should().Be(ApplicationErrorCodes.Conflict);
    }

    [Fact]
    public async Task RoomRepository_FilterByStatus_ReturnsCorrectRooms()
    {
        await using var context = Fixture.CreateDbContext();
        var available = TestData.Room("AVAILABLE");
        var maintenance = TestData.Room("MAINTENANCE");
        maintenance.ChangeStatus(
            RoomStatus.Maintenance,
            hasActiveContract: false,
            TestData.Now);
        var inactive = TestData.Room("INACTIVE");
        inactive.ChangeStatus(
            RoomStatus.Inactive,
            hasActiveContract: false,
            TestData.Now);
        context.AddRange(available, maintenance, inactive);
        await context.SaveChangesAsync();
        context.ChangeTracker.Clear();

        var result = await new RoomRepository(context).GetPagedAsync(
            new PagedRequest(1, 10),
            RoomStatus.Maintenance);

        result.Items.Should().ContainSingle();
        result.Items[0].Id.Should().Be(maintenance.Id);
    }

    [Fact]
    public async Task RoomRepository_Pagination_IsStable()
    {
        await using var context = Fixture.CreateDbContext();
        context.AddRange(
            Enumerable.Range(1, 5)
                .Select(number => TestData.Room($"P-{number}")));
        await context.SaveChangesAsync();
        context.ChangeTracker.Clear();
        var repository = new RoomRepository(context);

        var firstRead = await repository.GetPagedAsync(
            new PagedRequest(1, 2),
            null);
        var repeatedRead = await repository.GetPagedAsync(
            new PagedRequest(1, 2),
            null);
        var secondPage = await repository.GetPagedAsync(
            new PagedRequest(2, 2),
            null);

        repeatedRead.Items.Select(room => room.Id)
            .Should()
            .Equal(firstRead.Items.Select(room => room.Id));
        secondPage.Items.Select(room => room.Id)
            .Should()
            .NotIntersectWith(firstRead.Items.Select(room => room.Id));
        firstRead.TotalCount.Should().Be(5);
    }

    [Fact]
    public async Task RoomRepository_DuplicateRoomNumber_ThrowsConflict()
    {
        await using var context = Fixture.CreateDbContext();
        var repository = new RoomRepository(context);
        repository.Add(TestData.Room("DUPLICATE-ROOM"));
        await context.SaveChangesAsync();
        repository.Add(TestData.Room("DUPLICATE-ROOM"));

        var action = () => context.SaveChangesAsync();

        var exception = await action.Should()
            .ThrowAsync<ConflictException>();
        exception.Which.Code.Should()
            .Be(ApplicationErrorCodes.RoomNumberAlreadyExists);
    }

    [Fact]
    public async Task FailedConstraintSave_IsAtomic()
    {
        await using (var seedContext = Fixture.CreateDbContext())
        {
            seedContext.Users.Add(
                TestData.User(username: "atomic-duplicate"));
            await seedContext.SaveChangesAsync();
        }

        var roomId = Guid.Empty;
        await using (var context = Fixture.CreateDbContext())
        {
            var room = TestData.Room("ATOMIC-ROOM");
            roomId = room.Id;
            context.AddRange(
                room,
                TestData.User(username: "atomic-duplicate"));

            await FluentActions.Invoking(() => context.SaveChangesAsync())
                .Should()
                .ThrowAsync<ConflictException>();
        }

        await using var verification = Fixture.CreateDbContext();
        (await verification.Rooms.AnyAsync(room => room.Id == roomId))
            .Should()
            .BeFalse();
    }
}
