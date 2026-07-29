using FluentAssertions;
using RMS.Domain.Constants;
using RMS.Domain.Entities;
using RMS.Domain.Enums;
using RMS.Domain.Exceptions;

namespace RMS.UnitTests.Domain;

public class RoomTests
{
    private static readonly DateTimeOffset CreatedAt =
        new(2026, 2, 1, 0, 0, 0, TimeSpan.Zero);

    [Fact]
    public void Constructor_ValidArguments_CreatesAvailableRoom()
    {
        // Arrange
        const string roomNumber = "A-101";
        const decimal monthlyRent = 3_500_000m;
        const string description = "Near the main entrance";

        // Act
        var room = new Room(
            roomNumber,
            monthlyRent,
            description,
            CreatedAt);

        // Assert
        room.Id.Should().NotBeEmpty();
        room.RoomNumber.Should().Be(roomNumber);
        room.MonthlyRent.Should().Be(monthlyRent);
        room.Description.Should().Be(description);
        room.Status.Should().Be(RoomStatus.Available);
        room.CreatedAt.Should().Be(CreatedAt);
        room.UpdatedAt.Should().BeNull();
        room.Contracts.Should().BeEmpty();
        room.MaintenanceRequests.Should().BeEmpty();
    }

    [Fact]
    public void Constructor_NegativeMonthlyRent_ThrowsDomainException()
    {
        // Arrange
        const decimal negativeMonthlyRent = -1m;

        // Act
        Action act = () => new Room(
            "A-101",
            negativeMonthlyRent,
            null,
            CreatedAt);

        // Assert
        var exception = act.Should().Throw<DomainException>().Which;
        exception.Code.Should().Be(DomainErrorCodes.InvalidAmount);
        exception.Message.Should().Contain("MonthlyRent");
    }

    [Fact]
    public void Constructor_EmptyRoomNumber_ThrowsDomainException()
    {
        // Arrange
        const string emptyRoomNumber = " ";

        // Act
        Action act = () => new Room(
            emptyRoomNumber,
            3_500_000m,
            null,
            CreatedAt);

        // Assert
        var exception = act.Should().Throw<DomainException>().Which;
        exception.Code.Should().Be(DomainErrorCodes.RequiredField);
        exception.Message.Should().Contain("RoomNumber");
    }

    [Fact]
    public void ChangeStatus_AvailableToMaintenance_ChangesStatus()
    {
        // Arrange
        var room = CreateRoom();
        var changedAt = CreatedAt.AddHours(1);

        // Act
        room.ChangeStatus(
            RoomStatus.Maintenance,
            hasActiveContract: false,
            changedAt);

        // Assert
        room.Status.Should().Be(RoomStatus.Maintenance);
        room.UpdatedAt.Should().Be(changedAt);
    }

    [Fact]
    public void ChangeStatus_AvailableToInactive_ChangesStatus()
    {
        // Arrange
        var room = CreateRoom();
        var changedAt = CreatedAt.AddHours(1);

        // Act
        room.ChangeStatus(
            RoomStatus.Inactive,
            hasActiveContract: false,
            changedAt);

        // Assert
        room.Status.Should().Be(RoomStatus.Inactive);
        room.UpdatedAt.Should().Be(changedAt);
    }

    [Fact]
    public void ChangeStatus_OccupiedRoomWithActiveContract_ThrowsBusinessRuleViolation()
    {
        // Arrange
        var room = CreateRoom();
        room.ChangeStatus(
            RoomStatus.Occupied,
            hasActiveContract: true,
            CreatedAt.AddHours(1));

        // Act
        Action act = () => room.ChangeStatus(
            RoomStatus.Available,
            hasActiveContract: true,
            CreatedAt.AddHours(2));

        // Assert
        var exception = act.Should()
            .Throw<BusinessRuleViolationException>()
            .Which;
        exception.Code.Should()
            .Be(BusinessRuleCodes.ActiveContractRequiresOccupiedRoom);
        exception.Message.Should().Contain("active contract");
        room.Status.Should().Be(RoomStatus.Occupied);
    }

    [Fact]
    public void UpdateDetails_MaintenanceRoom_UpdatesDetailsWithoutChangingStatus()
    {
        // Arrange
        var room = CreateRoom();
        room.ChangeStatus(
            RoomStatus.Maintenance,
            hasActiveContract: false,
            CreatedAt.AddHours(1));
        var updatedAt = CreatedAt.AddHours(2);

        // Act
        room.UpdateDetails(
            "A-102",
            4_000_000m,
            "Renovated room",
            updatedAt);

        // Assert
        room.RoomNumber.Should().Be("A-102");
        room.MonthlyRent.Should().Be(4_000_000m);
        room.Description.Should().Be("Renovated room");
        room.Status.Should().Be(RoomStatus.Maintenance);
        room.UpdatedAt.Should().Be(updatedAt);
    }

    private static Room CreateRoom() =>
        new("A-101", 3_500_000m, "Original room", CreatedAt);
}
