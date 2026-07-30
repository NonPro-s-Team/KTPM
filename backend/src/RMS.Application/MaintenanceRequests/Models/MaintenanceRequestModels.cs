using RMS.Domain.Enums;

namespace RMS.Application.MaintenanceRequests.Models;

public sealed record CreateMaintenanceRequestRequest(
    string Title,
    string Description);

public sealed record StartMaintenanceRequestRequest(string? Note);

public sealed record AddMaintenanceProgressRequest(string Note);

public sealed record ResolveMaintenanceRequestRequest(string ResolutionNote);

public sealed record CloseMaintenanceRequestRequest(string? Note);

public sealed record MaintenanceRequestFilterRequest(
    int PageNumber,
    int PageSize,
    MaintenanceRequestStatus? Status);

public sealed record MaintenanceUpdateResponse(
    MaintenanceRequestStatus PreviousStatus,
    MaintenanceRequestStatus NewStatus,
    string? Note,
    Guid UpdatedByUserId,
    DateTimeOffset OccurredAt);

public sealed record MaintenanceRequestResponse(
    Guid Id,
    Guid TenantId,
    Guid RoomId,
    string Title,
    string Description,
    MaintenanceRequestStatus Status,
    DateTimeOffset? StartedAt,
    DateTimeOffset? ResolvedAt,
    DateTimeOffset? ClosedAt,
    DateTimeOffset CreatedAt,
    IReadOnlyList<MaintenanceUpdateResponse> Updates);
