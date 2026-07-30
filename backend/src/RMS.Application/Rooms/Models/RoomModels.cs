using RMS.Domain.Enums;

namespace RMS.Application.Rooms.Models;

public sealed record CreateRoomRequest(
    string RoomNumber,
    decimal MonthlyRent,
    string? Description);

public sealed record UpdateRoomRequest(
    string RoomNumber,
    decimal MonthlyRent,
    string? Description);

public sealed record ChangeRoomStatusRequest(RoomStatus TargetStatus);

public sealed record RoomFilterRequest(
    int PageNumber,
    int PageSize,
    RoomStatus? Status);

public sealed record RoomResponse(
    Guid Id,
    string RoomNumber,
    decimal MonthlyRent,
    string? Description,
    RoomStatus Status,
    DateTimeOffset CreatedAt,
    DateTimeOffset? UpdatedAt);
