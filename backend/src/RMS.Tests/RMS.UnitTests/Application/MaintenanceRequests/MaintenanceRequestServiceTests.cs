using FluentAssertions;
using Moq;
using RMS.Application.Common.Exceptions;
using RMS.Application.Common.Interfaces.Persistence;
using RMS.Application.Common.Models;
using RMS.Application.MaintenanceRequests;
using RMS.Application.MaintenanceRequests.Models;
using RMS.Domain.Constants;
using RMS.Domain.Entities;
using RMS.Domain.Enums;
using RMS.UnitTests.Application.TestDoubles;

namespace RMS.UnitTests.Application.MaintenanceRequests;

public class MaintenanceRequestServiceTests
{
    private readonly Mock<IMaintenanceRequestRepository> _maintenance = new();
    private readonly Mock<IRentalContractRepository> _contracts = new();
    private readonly Mock<ITenantRepository> _tenants = new();
    private readonly Mock<IUnitOfWork> _unitOfWork = new();
    private readonly FakeCurrentUserService _currentUser = new();
    private readonly FakeDateTimeProvider _clock = new();
    private readonly MaintenanceRequestService _service;

    public MaintenanceRequestServiceTests()
    {
        _unitOfWork
            .Setup(unit => unit.SaveChangesAsync(It.IsAny<CancellationToken>()))
            .ReturnsAsync(1);
        _service = new MaintenanceRequestService(
            _maintenance.Object,
            _contracts.Object,
            _tenants.Object,
            _currentUser,
            _clock,
            _unitOfWork.Object);
    }

    [Fact]
    public async Task Create_TenantWithActiveContract_CreatesRequestForActiveRoom()
    {
        // Arrange
        var tenant = SetupCurrentTenant();
        var roomId = Guid.NewGuid();
        var contract = DomainTestFactory.CreateContract(
            roomId,
            tenant.Id,
            ContractStatus.Active);
        _contracts
            .Setup(repository => repository.GetActiveContractByTenantIdAsync(
                tenant.Id,
                It.IsAny<CancellationToken>()))
            .ReturnsAsync(contract);
        MaintenanceRequest? addedRequest = null;
        _maintenance
            .Setup(repository => repository.Add(
                It.IsAny<MaintenanceRequest>()))
            .Callback<MaintenanceRequest>(
                request => addedRequest = request);

        // Act
        var response = await _service.CreateAsync(
            new CreateMaintenanceRequestRequest(
                "Broken air conditioner",
                "The unit does not cool."));

        // Assert
        addedRequest.Should().NotBeNull();
        addedRequest!.TenantId.Should().Be(tenant.Id);
        addedRequest.RoomId.Should().Be(roomId);
        addedRequest.Status.Should().Be(MaintenanceRequestStatus.Submitted);
        response.RoomId.Should().Be(roomId);
        _unitOfWork.Verify(
            unit => unit.SaveChangesAsync(It.IsAny<CancellationToken>()),
            Times.Once);
    }

    [Fact]
    public async Task Create_TenantWithoutActiveContract_ThrowsBR17()
    {
        // Arrange
        var tenant = SetupCurrentTenant();
        _contracts
            .Setup(repository => repository.GetActiveContractByTenantIdAsync(
                tenant.Id,
                It.IsAny<CancellationToken>()))
            .ReturnsAsync((RentalContract?)null);

        // Act
        Func<Task> act = () => _service.CreateAsync(
            new CreateMaintenanceRequestRequest(
                "Broken light",
                "The ceiling light is not working."));

        // Assert
        var exception = await act.Should()
            .ThrowAsync<ForbiddenAccessException>();
        exception.Which.Code.Should()
            .Be(BusinessRuleCodes.TenantMaintenanceRequiresActiveContract);
        _maintenance.Verify(
            repository => repository.Add(
                It.IsAny<MaintenanceRequest>()),
            Times.Never);
        _unitOfWork.Verify(
            unit => unit.SaveChangesAsync(It.IsAny<CancellationToken>()),
            Times.Never);
    }

    [Fact]
    public async Task Create_Admin_IsForbiddenBecauseUseCaseRequiresTenant()
    {
        // Arrange
        _currentUser.Role = UserRole.Admin;

        // Act
        Func<Task> act = () => _service.CreateAsync(
            new CreateMaintenanceRequestRequest(
                "Issue",
                "Description"));

        // Assert
        var exception = await act.Should()
            .ThrowAsync<ForbiddenAccessException>();
        exception.Which.Code.Should().Be(ApplicationErrorCodes.Forbidden);
        _tenants.Verify(
            repository => repository.GetByUserIdAsync(
                It.IsAny<Guid>(),
                It.IsAny<CancellationToken>()),
            Times.Never);
    }

    [Fact]
    public async Task StartProgress_Staff_Succeeds()
    {
        // Arrange
        _currentUser.Role = UserRole.Staff;
        _currentUser.UserId = DomainTestFactory.StaffUserId;
        var maintenanceRequest = CreateRequest();
        SetupRequest(maintenanceRequest);

        // Act
        var response = await _service.StartProgressAsync(
            maintenanceRequest.Id,
            new StartMaintenanceRequestRequest("Assigned"));

        // Assert
        maintenanceRequest.Status.Should()
            .Be(MaintenanceRequestStatus.InProgress);
        maintenanceRequest.StartedAt.Should().Be(_clock.UtcNow);
        response.Updates.Should().ContainSingle();
        _unitOfWork.Verify(
            unit => unit.SaveChangesAsync(It.IsAny<CancellationToken>()),
            Times.Once);
    }

    [Fact]
    public async Task StartProgress_Tenant_ThrowsBR18()
    {
        // Arrange
        _currentUser.Role = UserRole.Tenant;
        _currentUser.UserId = DomainTestFactory.TenantUserId;

        // Act
        Func<Task> act = () => _service.StartProgressAsync(
            Guid.NewGuid(),
            new StartMaintenanceRequestRequest(null));

        // Assert
        var exception = await act.Should()
            .ThrowAsync<ForbiddenAccessException>();
        exception.Which.Code.Should()
            .Be(BusinessRuleCodes.MaintenanceUpdatePermission);
        _maintenance.Verify(
            repository => repository.GetByIdAsync(
                It.IsAny<Guid>(),
                It.IsAny<CancellationToken>()),
            Times.Never);
    }

    [Fact]
    public async Task Resolve_Staff_Succeeds()
    {
        // Arrange
        _currentUser.Role = UserRole.Staff;
        _currentUser.UserId = DomainTestFactory.StaffUserId;
        var maintenanceRequest = DomainTestFactory.CreateMaintenanceRequest(
            Guid.NewGuid(),
            Guid.NewGuid(),
            MaintenanceRequestStatus.InProgress);
        SetupRequest(maintenanceRequest);

        // Act
        var response = await _service.ResolveAsync(
            maintenanceRequest.Id,
            new ResolveMaintenanceRequestRequest("Replaced the valve."));

        // Assert
        maintenanceRequest.Status.Should()
            .Be(MaintenanceRequestStatus.Resolved);
        maintenanceRequest.ResolvedAt.Should().Be(_clock.UtcNow);
        response.Status.Should().Be(MaintenanceRequestStatus.Resolved);
    }

    [Fact]
    public async Task Close_Admin_Succeeds()
    {
        // Arrange
        _currentUser.Role = UserRole.Admin;
        var maintenanceRequest = DomainTestFactory.CreateMaintenanceRequest(
            Guid.NewGuid(),
            Guid.NewGuid(),
            MaintenanceRequestStatus.Resolved);
        SetupRequest(maintenanceRequest);

        // Act
        var response = await _service.CloseAsync(
            maintenanceRequest.Id,
            new CloseMaintenanceRequestRequest("Verified"));

        // Assert
        maintenanceRequest.Status.Should()
            .Be(MaintenanceRequestStatus.Closed);
        maintenanceRequest.ClosedAt.Should().Be(_clock.UtcNow);
        response.Status.Should().Be(MaintenanceRequestStatus.Closed);
    }

    [Fact]
    public async Task GetById_TenantOwnRequest_IsAllowed()
    {
        // Arrange
        var tenant = SetupCurrentTenant();
        var maintenanceRequest = DomainTestFactory.CreateMaintenanceRequest(
            tenant.Id,
            Guid.NewGuid());
        SetupRequest(maintenanceRequest);

        // Act
        var response = await _service.GetByIdAsync(maintenanceRequest.Id);

        // Assert
        response.Id.Should().Be(maintenanceRequest.Id);
        response.TenantId.Should().Be(tenant.Id);
    }

    [Fact]
    public async Task GetById_OtherTenantRequest_IsForbidden()
    {
        // Arrange
        var tenant = SetupCurrentTenant();
        var maintenanceRequest = DomainTestFactory.CreateMaintenanceRequest(
            Guid.NewGuid(),
            Guid.NewGuid());
        SetupRequest(maintenanceRequest);

        // Act
        Func<Task> act = () => _service.GetByIdAsync(
            maintenanceRequest.Id);

        // Assert
        var exception = await act.Should()
            .ThrowAsync<ForbiddenAccessException>();
        exception.Which.Code.Should()
            .Be(BusinessRuleCodes.TenantOwnDataOnly);
        tenant.Id.Should().NotBe(maintenanceRequest.TenantId);
    }

    [Fact]
    public async Task GetPaged_TenantQueryUsesTenantId()
    {
        // Arrange
        var tenant = SetupCurrentTenant();
        _maintenance
            .Setup(repository => repository.GetPagedAsync(
                It.IsAny<PagedRequest>(),
                null,
                tenant.Id,
                It.IsAny<CancellationToken>()))
            .ReturnsAsync(new PagedResult<MaintenanceRequest>(
                [],
                pageNumber: 1,
                pageSize: 20,
                totalCount: 0));

        // Act
        await _service.GetPagedAsync(
            new MaintenanceRequestFilterRequest(1, 20, null));

        // Assert
        _maintenance.Verify(
            repository => repository.GetPagedAsync(
                It.Is<PagedRequest>(page =>
                    page.PageNumber == 1 && page.PageSize == 20),
                null,
                tenant.Id,
                It.IsAny<CancellationToken>()),
            Times.Once);
    }

    private Tenant SetupCurrentTenant()
    {
        var tenant = DomainTestFactory.CreateTenant();
        _currentUser.Role = UserRole.Tenant;
        _currentUser.UserId = tenant.UserId;
        _tenants
            .Setup(repository => repository.GetByUserIdAsync(
                tenant.UserId,
                It.IsAny<CancellationToken>()))
            .ReturnsAsync(tenant);
        return tenant;
    }

    private void SetupRequest(MaintenanceRequest request)
    {
        _maintenance
            .Setup(repository => repository.GetByIdAsync(
                request.Id,
                It.IsAny<CancellationToken>()))
            .ReturnsAsync(request);
    }

    private static MaintenanceRequest CreateRequest()
    {
        return DomainTestFactory.CreateMaintenanceRequest(
            Guid.NewGuid(),
            Guid.NewGuid());
    }
}
