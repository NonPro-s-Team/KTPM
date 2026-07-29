using RMS.Domain.Common;
using RMS.Domain.Common.Entities;
using RMS.Domain.Enums;

namespace RMS.Domain.Entities;

public sealed class MaintenanceRequestUpdate : BaseEntity
{
    public Guid MaintenanceRequestId { get; private set; }
    public MaintenanceRequestStatus PreviousStatus { get; private set; }
    public MaintenanceRequestStatus NewStatus { get; private set; }
    public string? Note { get; private set; }
    public Guid UpdatedByUserId { get; private set; }
    public DateTimeOffset OccurredAt { get; private set; }
    public DateTimeOffset CreatedAt { get; private set; }

    private MaintenanceRequestUpdate()
    {
    }

    private MaintenanceRequestUpdate(
        Guid maintenanceRequestId,
        MaintenanceRequestStatus previousStatus,
        MaintenanceRequestStatus newStatus,
        string? note,
        Guid updatedByUserId,
        DateTimeOffset occurredAt)
        : base(Guid.NewGuid())
    {
        MaintenanceRequestId = Guard.Required(
            maintenanceRequestId,
            nameof(MaintenanceRequestId));
        PreviousStatus = Guard.DefinedEnum(
            previousStatus,
            nameof(PreviousStatus));
        NewStatus = Guard.DefinedEnum(newStatus, nameof(NewStatus));
        Note = Guard.Optional(
            note,
            nameof(Note),
            MaintenanceRequest.NoteMaxLength);
        UpdatedByUserId = Guard.Required(
            updatedByUserId,
            nameof(UpdatedByUserId));
        OccurredAt = occurredAt.ToUniversalTime();
        CreatedAt = OccurredAt;
    }

    internal static MaintenanceRequestUpdate Create(
        Guid maintenanceRequestId,
        MaintenanceRequestStatus previousStatus,
        MaintenanceRequestStatus newStatus,
        string? note,
        Guid updatedByUserId,
        DateTimeOffset occurredAt) =>
        new(
            maintenanceRequestId,
            previousStatus,
            newStatus,
            note,
            updatedByUserId,
            occurredAt);
}

