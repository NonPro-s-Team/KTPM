using FluentAssertions;
using Moq;
using RMS.Application.Common.Exceptions;
using RMS.Application.Common.Interfaces.Persistence;
using RMS.Application.Common.Interfaces.Security;
using RMS.Application.Tenants;
using RMS.Application.Tenants.Models;
using RMS.Domain.Constants;
using RMS.Domain.Entities;
using RMS.Domain.Enums;
using RMS.UnitTests.Application.TestDoubles;

namespace RMS.UnitTests.Application.Tenants;

public class TenantServiceTests
{
    private readonly Mock<IUserRepository> _users = new();
    private readonly Mock<ITenantRepository> _tenants = new();
    private readonly Mock<IPasswordHasher> _passwordHasher = new();
    private readonly Mock<IUnitOfWork> _unitOfWork = new();
    private readonly FakeCurrentUserService _currentUser = new();
    private readonly FakeDateTimeProvider _clock = new();
    private readonly TenantService _service;

    public TenantServiceTests()
    {
        _passwordHasher
            .Setup(hasher => hasher.Hash(It.IsAny<string>()))
            .Returns("hashed-initial-password");
        _unitOfWork
            .Setup(unit => unit.SaveChangesAsync(It.IsAny<CancellationToken>()))
            .ReturnsAsync(1);
        _service = new TenantService(
            _users.Object,
            _tenants.Object,
            _passwordHasher.Object,
            _currentUser,
            _clock,
            _unitOfWork.Object);
    }

    [Fact]
    public async Task CreateTenant_Admin_CreatesUserAndTenant()
    {
        // Arrange
        User? addedUser = null;
        Tenant? addedTenant = null;
        _users.Setup(repository => repository.Add(It.IsAny<User>()))
            .Callback<User>(user => addedUser = user);
        _tenants.Setup(repository => repository.Add(It.IsAny<Tenant>()))
            .Callback<Tenant>(tenant => addedTenant = tenant);

        // Act
        var response = await _service.CreateTenantAsync(CreateRequest());

        // Assert
        addedUser.Should().NotBeNull();
        addedTenant.Should().NotBeNull();
        addedUser!.Role.Should().Be(UserRole.Tenant);
        addedUser.Status.Should().Be(UserStatus.Active);
        addedTenant!.UserId.Should().Be(addedUser.Id);
        response.UserId.Should().Be(addedUser.Id);
        response.Username.Should().Be("new-tenant");
    }

    [Fact]
    public async Task CreateTenant_Staff_CreatesUserAndTenant()
    {
        // Arrange
        _currentUser.Role = UserRole.Staff;

        // Act
        var response = await _service.CreateTenantAsync(CreateRequest());

        // Assert
        response.FullName.Should().Be("Nguyen Van B");
        _users.Verify(
            repository => repository.Add(
                It.Is<User>(user => user.Role == UserRole.Tenant)),
            Times.Once);
        _tenants.Verify(
            repository => repository.Add(It.IsAny<Tenant>()),
            Times.Once);
    }

    [Fact]
    public async Task CreateTenant_TenantRole_IsForbidden()
    {
        // Arrange
        _currentUser.Role = UserRole.Tenant;
        _currentUser.UserId = DomainTestFactory.TenantUserId;

        // Act
        Func<Task> act = () => _service.CreateTenantAsync(CreateRequest());

        // Assert
        var exception = await act.Should()
            .ThrowAsync<ForbiddenAccessException>();
        exception.Which.Code.Should().Be(ApplicationErrorCodes.Forbidden);
        _users.Verify(
            repository => repository.Add(It.IsAny<User>()),
            Times.Never);
        _unitOfWork.Verify(
            unit => unit.SaveChangesAsync(It.IsAny<CancellationToken>()),
            Times.Never);
    }

    [Fact]
    public async Task CreateTenant_DuplicateUsername_ThrowsConflict()
    {
        // Arrange
        _users
            .Setup(repository => repository.UsernameExistsAsync(
                "new-tenant",
                null,
                It.IsAny<CancellationToken>()))
            .ReturnsAsync(true);

        // Act
        Func<Task> act = () => _service.CreateTenantAsync(CreateRequest());

        // Assert
        var exception = await act.Should().ThrowAsync<ConflictException>();
        exception.Which.Code.Should().Be(ApplicationErrorCodes.Conflict);
        _users.Verify(
            repository => repository.Add(It.IsAny<User>()),
            Times.Never);
        _tenants.Verify(
            repository => repository.Add(It.IsAny<Tenant>()),
            Times.Never);
        _unitOfWork.Verify(
            unit => unit.SaveChangesAsync(It.IsAny<CancellationToken>()),
            Times.Never);
    }

    [Fact]
    public async Task CreateTenant_HashesInitialPassword()
    {
        // Arrange
        var request = CreateRequest();

        // Act
        await _service.CreateTenantAsync(request);

        // Assert
        _passwordHasher.Verify(
            hasher => hasher.Hash(request.InitialPassword),
            Times.Once);
        _users.Verify(
            repository => repository.Add(
                It.Is<User>(user =>
                    user.PasswordHash == "hashed-initial-password")),
            Times.Once);
    }

    [Fact]
    public async Task CreateTenant_SavesOnce()
    {
        // Arrange
        var request = CreateRequest();

        // Act
        await _service.CreateTenantAsync(request);

        // Assert
        _unitOfWork.Verify(
            unit => unit.SaveChangesAsync(It.IsAny<CancellationToken>()),
            Times.Once);
    }

    [Fact]
    public async Task GetTenant_TenantOwnProfile_ReturnsData()
    {
        // Arrange
        var tenant = DomainTestFactory.CreateTenant();
        _currentUser.Role = UserRole.Tenant;
        _currentUser.UserId = tenant.UserId;
        _tenants
            .Setup(repository => repository.GetByIdAsync(
                tenant.Id,
                It.IsAny<CancellationToken>()))
            .ReturnsAsync(tenant);

        // Act
        var response = await _service.GetTenantByIdAsync(tenant.Id);

        // Assert
        response.Id.Should().Be(tenant.Id);
        response.UserId.Should().Be(_currentUser.UserId);
    }

    [Fact]
    public async Task GetTenant_OtherTenant_IsForbidden()
    {
        // Arrange
        var tenant = DomainTestFactory.CreateTenant(
            DomainTestFactory.OtherTenantUserId);
        _currentUser.Role = UserRole.Tenant;
        _currentUser.UserId = DomainTestFactory.TenantUserId;
        _tenants
            .Setup(repository => repository.GetByIdAsync(
                tenant.Id,
                It.IsAny<CancellationToken>()))
            .ReturnsAsync(tenant);

        // Act
        Func<Task> act = () => _service.GetTenantByIdAsync(tenant.Id);

        // Assert
        var exception = await act.Should()
            .ThrowAsync<ForbiddenAccessException>();
        exception.Which.Code.Should()
            .Be(BusinessRuleCodes.TenantOwnDataOnly);
    }

    [Fact]
    public async Task UpdateTenant_Admin_UpdatesProfile()
    {
        // Arrange
        var tenant = DomainTestFactory.CreateTenant();
        _tenants
            .Setup(repository => repository.GetByIdAsync(
                tenant.Id,
                It.IsAny<CancellationToken>()))
            .ReturnsAsync(tenant);
        var request = new UpdateTenantRequest(
            "Tran Thi C",
            "0911111111",
            "079000000099");

        // Act
        var response = await _service.UpdateTenantAsync(tenant.Id, request);

        // Assert
        tenant.FullName.Should().Be(request.FullName);
        tenant.PhoneNumber.Should().Be(request.PhoneNumber);
        tenant.CitizenId.Should().Be(request.CitizenId);
        tenant.UpdatedAt.Should().Be(_clock.UtcNow);
        response.FullName.Should().Be(request.FullName);
        _unitOfWork.Verify(
            unit => unit.SaveChangesAsync(It.IsAny<CancellationToken>()),
            Times.Once);
    }

    private static CreateTenantRequest CreateRequest()
    {
        return new CreateTenantRequest(
            "new-tenant",
            "initial-password",
            "Nguyen Van B",
            "0901234567",
            "079000000002");
    }
}
