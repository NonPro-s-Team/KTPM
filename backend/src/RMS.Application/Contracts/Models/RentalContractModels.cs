using RMS.Domain.Enums;

namespace RMS.Application.Contracts.Models;

public sealed record CreateRentalContractRequest(
    Guid RoomId,
    Guid TenantId,
    DateOnly StartDate,
    DateOnly EndDate,
    decimal MonthlyRent);

public sealed record UpdateDraftContractRequest(
    DateOnly StartDate,
    DateOnly EndDate,
    decimal MonthlyRent);

public sealed record ContractFilterRequest(
    int PageNumber,
    int PageSize,
    ContractStatus? Status);

public sealed record RentalContractResponse(
    Guid Id,
    Guid RoomId,
    string? RoomNumber,
    Guid TenantId,
    string? TenantName,
    DateOnly StartDate,
    DateOnly EndDate,
    decimal MonthlyRent,
    ContractStatus Status,
    DateTimeOffset? ActivatedAt,
    DateTimeOffset? TerminatedAt,
    DateTimeOffset? CancelledAt,
    DateTimeOffset CreatedAt,
    DateTimeOffset? UpdatedAt);
