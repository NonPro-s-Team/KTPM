using FluentAssertions;
using Moq;
using RMS.Application.Common.Exceptions;
using RMS.Application.Common.Interfaces.Persistence;
using RMS.Application.Common.Models;
using RMS.Application.Contracts;
using RMS.Application.Contracts.Models;
using RMS.Domain.Constants;
using RMS.Domain.Entities;
using RMS.Domain.Enums;
using RMS.UnitTests.Application.TestDoubles;

namespace RMS.UnitTests.Application.Contracts;

public class RentalContractServiceTests
{
    private readonly Mock<IRentalContractRepository> _contracts = new();
    private readonly Mock<IRoomRepository> _rooms = new();
    private readonly Mock<ITenantRepository> _tenants = new();
    private readonly Mock<IUnitOfWork> _unitOfWork = new();
    private readonly FakeCurrentUserService _currentUser = new();
    private readonly FakeDateTimeProvider _clock = new();
    private readonly RentalContractService _service;

    public RentalContractServiceTests()
    {
        _unitOfWork
            .Setup(unit => unit.SaveChangesAsync(It.IsAny<CancellationToken>()))
            .ReturnsAsync(1);
        _service = new RentalContractService(
            _contracts.Object,
            _rooms.Object,
            _tenants.Object,
            _currentUser,
            _clock,
            _unitOfWork.Object);
    }

    [Fact]
    public async Task CreateDraft_AvailableRoom_CreatesDraft()
    {
        // Arrange
        var room = DomainTestFactory.CreateRoom();
        var tenant = DomainTestFactory.CreateTenant();
        SetupRoomAndTenant(room, tenant);
        RentalContract? addedContract = null;
        _contracts
            .Setup(repository => repository.Add(It.IsAny<RentalContract>()))
            .Callback<RentalContract>(
                contract => addedContract = contract);

        // Act
        var response = await _service.CreateDraftAsync(
            CreateRequest(room.Id, tenant.Id));

        // Assert
        addedContract.Should().NotBeNull();
        addedContract!.Status.Should().Be(ContractStatus.Draft);
        response.Status.Should().Be(ContractStatus.Draft);
        response.RoomId.Should().Be(room.Id);
        response.TenantId.Should().Be(tenant.Id);
        _unitOfWork.Verify(
            unit => unit.SaveChangesAsync(It.IsAny<CancellationToken>()),
            Times.Once);
    }

    [Fact]
    public async Task CreateDraft_OccupiedRoom_ThrowsBR03()
    {
        // Arrange
        var room = DomainTestFactory.CreateRoom(RoomStatus.Occupied);
        var tenant = DomainTestFactory.CreateTenant();
        SetupRoomAndTenant(room, tenant);

        // Act
        Func<Task> act = () => _service.CreateDraftAsync(
            CreateRequest(room.Id, tenant.Id));

        // Assert
        var exception = await act.Should().ThrowAsync<ConflictException>();
        exception.Which.Code.Should()
            .Be(BusinessRuleCodes.AvailableRoomRequiredForContract);
        VerifyContractNotPersisted();
    }

    [Fact]
    public async Task CreateDraft_MaintenanceRoom_ThrowsBR03()
    {
        // Arrange
        var room = DomainTestFactory.CreateRoom(RoomStatus.Maintenance);
        var tenant = DomainTestFactory.CreateTenant();
        SetupRoomAndTenant(room, tenant);

        // Act
        Func<Task> act = () => _service.CreateDraftAsync(
            CreateRequest(room.Id, tenant.Id));

        // Assert
        var exception = await act.Should().ThrowAsync<ConflictException>();
        exception.Which.Code.Should()
            .Be(BusinessRuleCodes.AvailableRoomRequiredForContract);
        VerifyContractNotPersisted();
    }

    [Fact]
    public async Task CreateDraft_ExistingActiveContract_ThrowsBR04()
    {
        // Arrange
        var room = DomainTestFactory.CreateRoom();
        var tenant = DomainTestFactory.CreateTenant();
        SetupRoomAndTenant(room, tenant);
        _contracts
            .Setup(repository => repository.HasActiveContractForRoomAsync(
                room.Id,
                null,
                It.IsAny<CancellationToken>()))
            .ReturnsAsync(true);

        // Act
        Func<Task> act = () => _service.CreateDraftAsync(
            CreateRequest(room.Id, tenant.Id));

        // Assert
        var exception = await act.Should().ThrowAsync<ConflictException>();
        exception.Which.Code.Should()
            .Be(BusinessRuleCodes.SingleActiveContractPerRoom);
        VerifyContractNotPersisted();
    }

    [Fact]
    public async Task CreateDraft_MissingRoom_ThrowsNotFound()
    {
        // Arrange
        var roomId = Guid.NewGuid();
        _rooms
            .Setup(repository => repository.GetByIdAsync(
                roomId,
                It.IsAny<CancellationToken>()))
            .ReturnsAsync((Room?)null);

        // Act
        Func<Task> act = () => _service.CreateDraftAsync(
            CreateRequest(roomId, Guid.NewGuid()));

        // Assert
        var exception = await act.Should().ThrowAsync<NotFoundException>();
        exception.Which.Code.Should().Be(ApplicationErrorCodes.NotFound);
        VerifyContractNotPersisted();
    }

    [Fact]
    public async Task CreateDraft_MissingTenant_ThrowsNotFound()
    {
        // Arrange
        var room = DomainTestFactory.CreateRoom();
        var tenantId = Guid.NewGuid();
        _rooms
            .Setup(repository => repository.GetByIdAsync(
                room.Id,
                It.IsAny<CancellationToken>()))
            .ReturnsAsync(room);
        _tenants
            .Setup(repository => repository.GetByIdAsync(
                tenantId,
                It.IsAny<CancellationToken>()))
            .ReturnsAsync((Tenant?)null);

        // Act
        Func<Task> act = () => _service.CreateDraftAsync(
            CreateRequest(room.Id, tenantId));

        // Assert
        var exception = await act.Should().ThrowAsync<NotFoundException>();
        exception.Which.Code.Should().Be(ApplicationErrorCodes.NotFound);
        VerifyContractNotPersisted();
    }

    [Fact]
    public async Task Activate_ValidContract_ActivatesAndOccupiesRoom()
    {
        // Arrange
        var room = DomainTestFactory.CreateRoom();
        var tenant = DomainTestFactory.CreateTenant();
        var contract = DomainTestFactory.CreateContract(room.Id, tenant.Id);
        SetupContractAndRoom(contract, room);

        // Act
        var response = await _service.ActivateAsync(contract.Id);

        // Assert
        contract.Status.Should().Be(ContractStatus.Active);
        contract.ActivatedAt.Should().Be(_clock.UtcNow);
        room.Status.Should().Be(RoomStatus.Occupied);
        room.UpdatedAt.Should().Be(_clock.UtcNow);
        response.Status.Should().Be(ContractStatus.Active);
    }

    [Fact]
    public async Task Activate_SavesContractAndRoomOnce()
    {
        // Arrange
        var room = DomainTestFactory.CreateRoom();
        var tenant = DomainTestFactory.CreateTenant();
        var contract = DomainTestFactory.CreateContract(room.Id, tenant.Id);
        SetupContractAndRoom(contract, room);

        // Act
        await _service.ActivateAsync(contract.Id);

        // Assert
        contract.Status.Should().Be(ContractStatus.Active);
        room.Status.Should().Be(RoomStatus.Occupied);
        _unitOfWork.Verify(
            unit => unit.SaveChangesAsync(It.IsAny<CancellationToken>()),
            Times.Once);
    }

    [Fact]
    public async Task Activate_RoomNoLongerAvailable_IsRejected()
    {
        // Arrange
        var room = DomainTestFactory.CreateRoom(RoomStatus.Maintenance);
        var tenant = DomainTestFactory.CreateTenant();
        var contract = DomainTestFactory.CreateContract(room.Id, tenant.Id);
        SetupContractAndRoom(contract, room);

        // Act
        Func<Task> act = () => _service.ActivateAsync(contract.Id);

        // Assert
        var exception = await act.Should().ThrowAsync<ConflictException>();
        exception.Which.Code.Should()
            .Be(BusinessRuleCodes.AvailableRoomRequiredForContract);
        contract.Status.Should().Be(ContractStatus.Draft);
        _unitOfWork.Verify(
            unit => unit.SaveChangesAsync(It.IsAny<CancellationToken>()),
            Times.Never);
    }

    [Fact]
    public async Task Activate_AnotherActiveContractExists_IsRejected()
    {
        // Arrange
        var room = DomainTestFactory.CreateRoom();
        var tenant = DomainTestFactory.CreateTenant();
        var contract = DomainTestFactory.CreateContract(room.Id, tenant.Id);
        SetupContractAndRoom(contract, room);
        _contracts
            .Setup(repository => repository.HasActiveContractForRoomAsync(
                room.Id,
                contract.Id,
                It.IsAny<CancellationToken>()))
            .ReturnsAsync(true);

        // Act
        Func<Task> act = () => _service.ActivateAsync(contract.Id);

        // Assert
        var exception = await act.Should().ThrowAsync<ConflictException>();
        exception.Which.Code.Should()
            .Be(BusinessRuleCodes.SingleActiveContractPerRoom);
        contract.Status.Should().Be(ContractStatus.Draft);
        room.Status.Should().Be(RoomStatus.Available);
        _unitOfWork.Verify(
            unit => unit.SaveChangesAsync(It.IsAny<CancellationToken>()),
            Times.Never);
    }

    [Fact]
    public async Task Terminate_ActiveContract_TerminatesAndReleasesRoom()
    {
        // Arrange
        var room = DomainTestFactory.CreateRoom(RoomStatus.Occupied);
        var tenant = DomainTestFactory.CreateTenant();
        var contract = DomainTestFactory.CreateContract(
            room.Id,
            tenant.Id,
            ContractStatus.Active);
        SetupContractAndRoom(contract, room);

        // Act
        var response = await _service.TerminateAsync(contract.Id);

        // Assert
        contract.Status.Should().Be(ContractStatus.Terminated);
        contract.TerminatedAt.Should().Be(_clock.UtcNow);
        room.Status.Should().Be(RoomStatus.Available);
        response.Status.Should().Be(ContractStatus.Terminated);
        _unitOfWork.Verify(
            unit => unit.SaveChangesAsync(It.IsAny<CancellationToken>()),
            Times.Once);
    }

    [Fact]
    public async Task CancelDraft_DoesNotChangeRoomStatus()
    {
        // Arrange
        var room = DomainTestFactory.CreateRoom();
        var tenant = DomainTestFactory.CreateTenant();
        var contract = DomainTestFactory.CreateContract(room.Id, tenant.Id);
        _contracts
            .Setup(repository => repository.GetByIdAsync(
                contract.Id,
                It.IsAny<CancellationToken>()))
            .ReturnsAsync(contract);

        // Act
        await _service.CancelDraftAsync(contract.Id);

        // Assert
        contract.Status.Should().Be(ContractStatus.Cancelled);
        room.Status.Should().Be(RoomStatus.Available);
        _rooms.Verify(
            repository => repository.GetByIdAsync(
                It.IsAny<Guid>(),
                It.IsAny<CancellationToken>()),
            Times.Never);
    }

    [Fact]
    public async Task GetContract_TenantOwnContract_IsAllowed()
    {
        // Arrange
        var room = DomainTestFactory.CreateRoom();
        var tenant = DomainTestFactory.CreateTenant();
        var contract = DomainTestFactory.CreateContract(room.Id, tenant.Id);
        SetupTenantAccess(tenant, contract);

        // Act
        var response = await _service.GetContractAsync(contract.Id);

        // Assert
        response.Id.Should().Be(contract.Id);
        response.TenantId.Should().Be(tenant.Id);
    }

    [Fact]
    public async Task GetContract_OtherTenantContract_IsForbidden()
    {
        // Arrange
        var room = DomainTestFactory.CreateRoom();
        var currentTenant = DomainTestFactory.CreateTenant();
        var otherTenant = DomainTestFactory.CreateTenant(
            DomainTestFactory.OtherTenantUserId);
        var contract = DomainTestFactory.CreateContract(
            room.Id,
            otherTenant.Id);
        SetupTenantAccess(currentTenant, contract);

        // Act
        Func<Task> act = () => _service.GetContractAsync(contract.Id);

        // Assert
        var exception = await act.Should()
            .ThrowAsync<ForbiddenAccessException>();
        exception.Which.Code.Should()
            .Be(BusinessRuleCodes.TenantOwnDataOnly);
    }

    [Fact]
    public async Task GetContracts_TenantRepositoryQueryUsesTenantId()
    {
        // Arrange
        var tenant = DomainTestFactory.CreateTenant();
        _currentUser.Role = UserRole.Tenant;
        _currentUser.UserId = tenant.UserId;
        _tenants
            .Setup(repository => repository.GetByUserIdAsync(
                tenant.UserId,
                It.IsAny<CancellationToken>()))
            .ReturnsAsync(tenant);
        _contracts
            .Setup(repository => repository.GetPagedAsync(
                It.IsAny<PagedRequest>(),
                null,
                tenant.Id,
                It.IsAny<CancellationToken>()))
            .ReturnsAsync(new PagedResult<RentalContract>(
                [],
                pageNumber: 1,
                pageSize: 20,
                totalCount: 0));

        // Act
        await _service.GetContractsAsync(
            new ContractFilterRequest(1, 20, null));

        // Assert
        _contracts.Verify(
            repository => repository.GetPagedAsync(
                It.Is<PagedRequest>(page =>
                    page.PageNumber == 1 && page.PageSize == 20),
                null,
                tenant.Id,
                It.IsAny<CancellationToken>()),
            Times.Once);
    }

    private void SetupRoomAndTenant(Room room, Tenant tenant)
    {
        _rooms
            .Setup(repository => repository.GetByIdAsync(
                room.Id,
                It.IsAny<CancellationToken>()))
            .ReturnsAsync(room);
        _tenants
            .Setup(repository => repository.GetByIdAsync(
                tenant.Id,
                It.IsAny<CancellationToken>()))
            .ReturnsAsync(tenant);
    }

    private void SetupContractAndRoom(
        RentalContract contract,
        Room room)
    {
        _contracts
            .Setup(repository => repository.GetByIdAsync(
                contract.Id,
                It.IsAny<CancellationToken>()))
            .ReturnsAsync(contract);
        _rooms
            .Setup(repository => repository.GetByIdAsync(
                room.Id,
                It.IsAny<CancellationToken>()))
            .ReturnsAsync(room);
    }

    private void SetupTenantAccess(
        Tenant currentTenant,
        RentalContract contract)
    {
        _currentUser.Role = UserRole.Tenant;
        _currentUser.UserId = currentTenant.UserId;
        _contracts
            .Setup(repository => repository.GetByIdAsync(
                contract.Id,
                It.IsAny<CancellationToken>()))
            .ReturnsAsync(contract);
        _tenants
            .Setup(repository => repository.GetByUserIdAsync(
                currentTenant.UserId,
                It.IsAny<CancellationToken>()))
            .ReturnsAsync(currentTenant);
    }

    private void VerifyContractNotPersisted()
    {
        _contracts.Verify(
            repository => repository.Add(It.IsAny<RentalContract>()),
            Times.Never);
        _unitOfWork.Verify(
            unit => unit.SaveChangesAsync(It.IsAny<CancellationToken>()),
            Times.Never);
    }

    private static CreateRentalContractRequest CreateRequest(
        Guid roomId,
        Guid tenantId)
    {
        return new CreateRentalContractRequest(
            roomId,
            tenantId,
            new DateOnly(2026, 8, 1),
            new DateOnly(2027, 8, 1),
            3_500_000m);
    }
}
