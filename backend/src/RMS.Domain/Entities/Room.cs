using RMS.Domain.Common;
using RMS.Domain.Common.Entities;
using RMS.Domain.Constants;
using RMS.Domain.Enums;
using RMS.Domain.Exceptions;

namespace RMS.Domain.Entities;

public class Room : AuditableEntity
{
    public const int RoomNumberMaxLength = 50;
    public const int DescriptionMaxLength = 1_000;

    private readonly List<RentalContract> _contracts = new();
    private readonly List<MaintenanceRequest> _maintenanceRequests = new();

    private Room()
    {
        RoomNumber = string.Empty;
    }

    public Room(
        string roomNumber,
        decimal monthlyRent,
        string? description,
        DateTimeOffset createdAt)
        : base(createdAt)
    {
        RoomNumber = Guard.Required(
            roomNumber,
            nameof(RoomNumber),
            RoomNumberMaxLength);
        MonthlyRent = Guard.NonNegative(monthlyRent, nameof(MonthlyRent));
        Description = Guard.Optional(
            description,
            nameof(Description),
            DescriptionMaxLength);
        Status = RoomStatus.Available;
    }

    public Room(
        string roomNumber,
        decimal monthlyRent,
        string? description = null)
        : this(
            roomNumber,
            monthlyRent,
            description,
            DateTimeOffset.UtcNow)
    {
    }

    public string RoomNumber { get; private set; }
    public decimal MonthlyRent { get; private set; }
    public string? Description { get; private set; }
    public RoomStatus Status { get; private set; }
    public IReadOnlyCollection<RentalContract> Contracts =>
        _contracts.AsReadOnly();
    public IReadOnlyCollection<MaintenanceRequest> MaintenanceRequests =>
        _maintenanceRequests.AsReadOnly();

    public void UpdateDetails(
        string roomNumber,
        decimal monthlyRent,
        string? description,
        DateTimeOffset updatedAt)
    {
        var validatedRoomNumber = Guard.Required(
            roomNumber,
            nameof(roomNumber),
            RoomNumberMaxLength);
        var validatedMonthlyRent = Guard.NonNegative(
            monthlyRent,
            nameof(monthlyRent));
        var validatedDescription = Guard.Optional(
            description,
            nameof(description),
            DescriptionMaxLength);

        RoomNumber = validatedRoomNumber;
        MonthlyRent = validatedMonthlyRent;
        Description = validatedDescription;
        MarkUpdated(updatedAt);
    }

    public void ChangeStatus(
        RoomStatus targetStatus,
        bool hasActiveContract,
        DateTimeOffset changedAt)
    {
        targetStatus = Guard.DefinedEnum(targetStatus, nameof(targetStatus));

        if (targetStatus == Status)
        {
            throw InvalidState(
                "Room status cannot transition to the same status.");
        }

        if (hasActiveContract && targetStatus != RoomStatus.Occupied)
        {
            throw new BusinessRuleViolationException(
                BusinessRuleCodes.ActiveContractRequiresOccupiedRoom,
                "A room with an active contract must remain occupied.");
        }

        if (targetStatus == RoomStatus.Occupied && !hasActiveContract)
        {
            throw InvalidState(
                "A room can become occupied only when it has an active contract.");
        }

        if (!CanTransitionTo(targetStatus))
        {
            throw InvalidState(
                $"Room status transition from {Status} to {targetStatus} is not allowed.");
        }

        Status = targetStatus;
        MarkUpdated(changedAt);
    }

    private bool CanTransitionTo(RoomStatus targetStatus) =>
        Status switch
        {
            RoomStatus.Available =>
                targetStatus is RoomStatus.Occupied
                    or RoomStatus.Maintenance
                    or RoomStatus.Inactive,
            RoomStatus.Occupied =>
                targetStatus == RoomStatus.Available,
            RoomStatus.Maintenance =>
                targetStatus is RoomStatus.Available
                    or RoomStatus.Inactive,
            RoomStatus.Inactive =>
                targetStatus == RoomStatus.Available,
            _ => false
        };

    private static DomainException InvalidState(string message) =>
        new(DomainErrorCodes.InvalidState, message);
}
