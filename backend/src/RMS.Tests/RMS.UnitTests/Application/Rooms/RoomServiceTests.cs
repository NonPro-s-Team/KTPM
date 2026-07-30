using FluentAssertions;
using Moq;
using RMS.Application.Common.Exceptions;
using RMS.Application.Common.Interfaces.Persistence;
using RMS.Application.Common.Models;
using RMS.Application.Rooms;
using RMS.Application.Rooms.Models;
using RMS.Domain.Constants;
using RMS.Domain.Entities;
using RMS.Domain.Enums;
using RMS.Domain.Exceptions;
using RMS.UnitTests.Application.TestDoubles;

namespace RMS.UnitTests.Application.Rooms;

public class RoomServiceTests
{
    private readonly Mock<IRoomRepository> _rooms = new();
    private readonly Mock<IRentalContractRepository> _contracts = new();
    private readonly Mock<IUnitOfWork> _unitOfWork = new();
    private readonly FakeCurrentUserService _currentUser = new();
    private readonly FakeDateTimeProvider _clock = new();
    private readonly RoomService _service;

    public RoomServiceTests()
    {
        _unitOfWork
            .Setup(unit => unit.SaveChangesAsync(It.IsAny<CancellationToken>()))
            .ReturnsAsync(1);
        _service = new RoomService(
            _rooms.Object,
            _contracts.Object,
            _currentUser,
            _clock,
            _unitOfWork.Object);
    }

    [Fact]
    public async Task CreateRoom_Admin_CreatesAvailableRoom()
    {
        // Arrange
        Room? addedRoom = null;
        _rooms.Setup(repository => repository.Add(It.IsAny<Room>()))
            .Callback<Room>(room => addedRoom = room);

        // Act
        var response = await _service.CreateRoomAsync(CreateRequest());

        // Assert
        addedRoom.Should().NotBeNull();
        addedRoom!.Status.Should().Be(RoomStatus.Available);
        addedRoom.CreatedAt.Should().Be(_clock.UtcNow);
        response.Status.Should().Be(RoomStatus.Available);
        _unitOfWork.Verify(
            unit => unit.SaveChangesAsync(It.IsAny<CancellationToken>()),
            Times.Once);
    }

    [Fact]
    public async Task CreateRoom_Staff_CreatesRoom()
    {
        // Arrange
        _currentUser.Role = UserRole.Staff;

        // Act
        var response = await _service.CreateRoomAsync(CreateRequest());

        // Assert
        response.RoomNumber.Should().Be("B-201");
        _rooms.Verify(
            repository => repository.Add(It.IsAny<Room>()),
            Times.Once);
    }

    [Fact]
    public async Task CreateRoom_Tenant_IsForbidden()
    {
        // Arrange
        _currentUser.Role = UserRole.Tenant;
        _currentUser.UserId = DomainTestFactory.TenantUserId;

        // Act
        Func<Task> act = () => _service.CreateRoomAsync(CreateRequest());

        // Assert
        var exception = await act.Should()
            .ThrowAsync<ForbiddenAccessException>();
        exception.Which.Code.Should()
            .Be(BusinessRuleCodes.RoomManagementPermission);
        _rooms.Verify(
            repository => repository.Add(It.IsAny<Room>()),
            Times.Never);
    }

    [Fact]
    public async Task CreateRoom_DuplicateRoomNumber_ThrowsConflict()
    {
        // Arrange
        _rooms
            .Setup(repository => repository.RoomNumberExistsAsync(
                "B-201",
                null,
                It.IsAny<CancellationToken>()))
            .ReturnsAsync(true);

        // Act
        Func<Task> act = () => _service.CreateRoomAsync(CreateRequest());

        // Assert
        var exception = await act.Should().ThrowAsync<ConflictException>();
        exception.Which.Code.Should().Be(ApplicationErrorCodes.Conflict);
        _rooms.Verify(
            repository => repository.Add(It.IsAny<Room>()),
            Times.Never);
        _unitOfWork.Verify(
            unit => unit.SaveChangesAsync(It.IsAny<CancellationToken>()),
            Times.Never);
    }

    [Fact]
    public async Task UpdateRoom_DoesNotChangeStatus()
    {
        // Arrange
        var room = DomainTestFactory.CreateRoom(RoomStatus.Maintenance);
        _rooms
            .Setup(repository => repository.GetByIdAsync(
                room.Id,
                It.IsAny<CancellationToken>()))
            .ReturnsAsync(room);

        // Act
        var response = await _service.UpdateRoomAsync(
            room.Id,
            new UpdateRoomRequest("A-102", 4_000_000m, "Renovated"));

        // Assert
        room.Status.Should().Be(RoomStatus.Maintenance);
        response.Status.Should().Be(RoomStatus.Maintenance);
        response.RoomNumber.Should().Be("A-102");
    }

    [Fact]
    public async Task ChangeStatus_NoActiveContract_AllowsAvailableToMaintenance()
    {
        // Arrange
        var room = DomainTestFactory.CreateRoom();
        _rooms
            .Setup(repository => repository.GetByIdAsync(
                room.Id,
                It.IsAny<CancellationToken>()))
            .ReturnsAsync(room);
        _contracts
            .Setup(repository => repository.HasActiveContractForRoomAsync(
                room.Id,
                null,
                It.IsAny<CancellationToken>()))
            .ReturnsAsync(false);

        // Act
        await _service.ChangeRoomStatusAsync(
            room.Id,
            new ChangeRoomStatusRequest(RoomStatus.Maintenance));

        // Assert
        room.Status.Should().Be(RoomStatus.Maintenance);
        room.UpdatedAt.Should().Be(_clock.UtcNow);
        _unitOfWork.Verify(
            unit => unit.SaveChangesAsync(It.IsAny<CancellationToken>()),
            Times.Once);
    }

    [Fact]
    public async Task ChangeStatus_ActiveContract_BlocksLeavingOccupied()
    {
        // Arrange
        var room = DomainTestFactory.CreateRoom(RoomStatus.Occupied);
        _rooms
            .Setup(repository => repository.GetByIdAsync(
                room.Id,
                It.IsAny<CancellationToken>()))
            .ReturnsAsync(room);
        _contracts
            .Setup(repository => repository.HasActiveContractForRoomAsync(
                room.Id,
                null,
                It.IsAny<CancellationToken>()))
            .ReturnsAsync(true);

        // Act
        Func<Task> act = () => _service.ChangeRoomStatusAsync(
            room.Id,
            new ChangeRoomStatusRequest(RoomStatus.Available));

        // Assert
        var exception = await act.Should()
            .ThrowAsync<BusinessRuleViolationException>();
        exception.Which.Code.Should()
            .Be(BusinessRuleCodes.ActiveContractRequiresOccupiedRoom);
        room.Status.Should().Be(RoomStatus.Occupied);
        _unitOfWork.Verify(
            unit => unit.SaveChangesAsync(It.IsAny<CancellationToken>()),
            Times.Never);
    }

    [Fact]
    public async Task ChangeStatus_ToOccupied_RequiresActiveContract()
    {
        // Arrange
        var room = DomainTestFactory.CreateRoom();
        _rooms
            .Setup(repository => repository.GetByIdAsync(
                room.Id,
                It.IsAny<CancellationToken>()))
            .ReturnsAsync(room);
        _contracts
            .Setup(repository => repository.HasActiveContractForRoomAsync(
                room.Id,
                null,
                It.IsAny<CancellationToken>()))
            .ReturnsAsync(false);

        // Act
        Func<Task> act = () => _service.ChangeRoomStatusAsync(
            room.Id,
            new ChangeRoomStatusRequest(RoomStatus.Occupied));

        // Assert
        var exception = await act.Should().ThrowAsync<DomainException>();
        exception.Which.Code.Should().Be(DomainErrorCodes.InvalidState);
        room.Status.Should().Be(RoomStatus.Available);
    }

    [Fact]
    public async Task GetRooms_TenantWithoutFilter_IsAllowed()
    {
        // Arrange
        _currentUser.Role = UserRole.Tenant;
        _currentUser.UserId = DomainTestFactory.TenantUserId;
        var room = DomainTestFactory.CreateRoom();
        _rooms
            .Setup(repository => repository.GetPagedAsync(
                It.IsAny<PagedRequest>(),
                null,
                It.IsAny<CancellationToken>()))
            .ReturnsAsync(new PagedResult<Room>(
                [room],
                pageNumber: 1,
                pageSize: 20,
                totalCount: 1));

        // Act
        var response = await _service.GetRoomsAsync(
            new RoomFilterRequest(1, 20, null));

        // Assert
        response.Items.Should().ContainSingle();
        response.Items[0].Id.Should().Be(room.Id);
        _rooms.Verify(
            repository => repository.GetPagedAsync(
                It.Is<PagedRequest>(page =>
                    page.PageNumber == 1 && page.PageSize == 20),
                null,
                It.IsAny<CancellationToken>()),
            Times.Once);
    }

    [Fact]
    public async Task GetRooms_TenantWithStatusFilter_IsForbidden()
    {
        // Arrange
        _currentUser.Role = UserRole.Tenant;
        _currentUser.UserId = DomainTestFactory.TenantUserId;

        // Act
        Func<Task> act = () => _service.GetRoomsAsync(
            new RoomFilterRequest(1, 20, RoomStatus.Available));

        // Assert
        var exception = await act.Should()
            .ThrowAsync<ForbiddenAccessException>();
        exception.Which.Code.Should()
            .Be(BusinessRuleCodes.RoomManagementPermission);
        _rooms.Verify(
            repository => repository.GetPagedAsync(
                It.IsAny<PagedRequest>(),
                It.IsAny<RoomStatus?>(),
                It.IsAny<CancellationToken>()),
            Times.Never);
    }

    private static CreateRoomRequest CreateRequest()
    {
        return new CreateRoomRequest(
            "B-201",
            4_000_000m,
            "Second floor");
    }
}
