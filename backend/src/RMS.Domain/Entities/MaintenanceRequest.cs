using RMS.Domain.Common;
using RMS.Domain.Common.Entities;
using RMS.Domain.Constants;
using RMS.Domain.Enums;
using RMS.Domain.Exceptions;

namespace RMS.Domain.Entities;

public class MaintenanceRequest : AuditableEntity
{
    public const int TitleMaxLength = 200;
    public const int DescriptionMaxLength = 2000;
    public const int NoteMaxLength = 2000;

    private readonly List<MaintenanceRequestUpdate> _updates = [];

    public Guid TenantId { get; private set; }
    public Guid RoomId { get; private set; }
    public string Title { get; private set; } = string.Empty;
    public string Description { get; private set; } = string.Empty;
    public MaintenanceRequestStatus Status { get; private set; }
    public DateTimeOffset? StartedAt { get; private set; }
    public DateTimeOffset? ResolvedAt { get; private set; }
    public DateTimeOffset? ClosedAt { get; private set; }
    public Tenant Tenant { get; private set; } = null!;
    public Room Room { get; private set; } = null!;
    public IReadOnlyCollection<MaintenanceRequestUpdate> Updates => _updates.AsReadOnly();

    protected MaintenanceRequest()
    {
    }

    public MaintenanceRequest(
        Guid tenantId,
        Guid roomId,
        string title,
        string description)
        : this(tenantId, roomId, title, description, DateTimeOffset.UtcNow)
    {
    }

    public MaintenanceRequest(
        Guid tenantId,
        Guid roomId,
        string title,
        string description,
        DateTimeOffset createdAt)
        : base(createdAt)
    {
        TenantId = Guard.Required(tenantId, nameof(TenantId));
        RoomId = Guard.Required(roomId, nameof(RoomId));
        Title = Guard.Required(title, nameof(Title), TitleMaxLength);
        Description = Guard.Required(
            description,
            nameof(Description),
            DescriptionMaxLength);
        Status = MaintenanceRequestStatus.Submitted;
    }

    public void StartProgress(
        Guid updatedByUserId,
        string? note,
        DateTimeOffset occurredAt)
    {
        EnsureStatus(
            MaintenanceRequestStatus.Submitted,
            "Only a submitted maintenance request can be started.");

        var actorId = Guard.Required(updatedByUserId, nameof(updatedByUserId));
        var normalizedNote = Guard.Optional(note, nameof(note), NoteMaxLength);
        var previousStatus = Status;

        Status = MaintenanceRequestStatus.InProgress;
        StartedAt = NormalizeTimestamp(occurredAt);
        MarkUpdated(occurredAt);
        AddUpdate(previousStatus, Status, normalizedNote, actorId, occurredAt);
    }

    public void AddProgressNote(
        Guid updatedByUserId,
        string note,
        DateTimeOffset occurredAt)
    {
        if (Status == MaintenanceRequestStatus.Closed)
        {
            throw InvalidState("A closed maintenance request cannot be updated.");
        }

        var actorId = Guard.Required(updatedByUserId, nameof(updatedByUserId));
        var normalizedNote = Guard.Required(note, nameof(note), NoteMaxLength);

        MarkUpdated(occurredAt);
        AddUpdate(Status, Status, normalizedNote, actorId, occurredAt);
    }

    public void Resolve(
        Guid updatedByUserId,
        string resolutionNote,
        DateTimeOffset occurredAt)
    {
        EnsureStatus(
            MaintenanceRequestStatus.InProgress,
            "Only an in-progress maintenance request can be resolved.");

        var actorId = Guard.Required(updatedByUserId, nameof(updatedByUserId));
        var normalizedNote = Guard.Required(
            resolutionNote,
            nameof(resolutionNote),
            NoteMaxLength);
        var previousStatus = Status;

        Status = MaintenanceRequestStatus.Resolved;
        ResolvedAt = NormalizeTimestamp(occurredAt);
        MarkUpdated(occurredAt);
        AddUpdate(previousStatus, Status, normalizedNote, actorId, occurredAt);
    }

    public void Close(
        Guid updatedByUserId,
        string? note,
        DateTimeOffset occurredAt)
    {
        EnsureStatus(
            MaintenanceRequestStatus.Resolved,
            "Only a resolved maintenance request can be closed.");

        var actorId = Guard.Required(updatedByUserId, nameof(updatedByUserId));
        var normalizedNote = Guard.Optional(note, nameof(note), NoteMaxLength);
        var previousStatus = Status;

        Status = MaintenanceRequestStatus.Closed;
        ClosedAt = NormalizeTimestamp(occurredAt);
        MarkUpdated(occurredAt);
        AddUpdate(previousStatus, Status, normalizedNote, actorId, occurredAt);
    }

    private void EnsureStatus(
        MaintenanceRequestStatus expectedStatus,
        string message)
    {
        if (Status != expectedStatus)
        {
            throw InvalidState(message);
        }
    }

    private void AddUpdate(
        MaintenanceRequestStatus previousStatus,
        MaintenanceRequestStatus newStatus,
        string? note,
        Guid updatedByUserId,
        DateTimeOffset occurredAt)
    {
        _updates.Add(MaintenanceRequestUpdate.Create(
            Id,
            previousStatus,
            newStatus,
            note,
            updatedByUserId,
            occurredAt));
    }

    private static DomainException InvalidState(string message) =>
        new(DomainErrorCodes.InvalidState, message);
}

