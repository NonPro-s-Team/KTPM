using System.ComponentModel.DataAnnotations;

namespace TroConnect.Api.Features.Rooms;

public record CreateRoomRequest(
    [Required] Guid BuildingId,
    [Required] string Name,
    [Range(0, double.MaxValue)] decimal BasePrice,
    [Range(0, double.MaxValue)] decimal ServicePrice,
    [Range(1, int.MaxValue)] int MaxOccupancy,
    [Range(0, double.MaxValue)] decimal? SingleOccupantDiscountAmount
);

public record UpdateRoomRequest(
    [Required] Guid BuildingId,
    [Required] string Name,
    [Range(0, double.MaxValue)] decimal BasePrice,
    [Range(0, double.MaxValue)] decimal ServicePrice,
    [Range(1, int.MaxValue)] int MaxOccupancy,
    [Range(0, double.MaxValue)] decimal? SingleOccupantDiscountAmount
);

public record RoomListDto(
    Guid Id,
    string Name,
    string BuildingName,
    decimal BasePrice,
    int MaxOccupancy
);

public record RoomDetailDto(
    Guid Id,
    Guid BuildingId,
    string BuildingName,
    string Name,
    decimal BasePrice,
    decimal ServicePrice,
    int MaxOccupancy,
    decimal? SingleOccupantDiscountAmount,
    DateTimeOffset CreatedAt,
    DateTimeOffset UpdatedAt
);

public enum RoomMutationError
{
    None,
    BuildingNotFound,
    RoomLimitReached
}

public record RoomMutationResult(RoomMutationError Error, RoomDetailDto? Room, int RoomLimit = 0)
{
    public bool IsSuccess => Error == RoomMutationError.None;
}
