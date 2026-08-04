using System.ComponentModel.DataAnnotations;

namespace TroConnect.Api.Features.Buildings;

public record CreateBuildingRequest(
    [Required] string Name,
    [Required] string Address,
    [Range(0, int.MaxValue)] int TotalRooms,
    bool ConfirmDuplicate = false
);

public record UpdateBuildingRequest(
    [Required] string Name,
    [Required] string Address,
    [Range(0, int.MaxValue)] int TotalRooms
);

public record BuildingListDto(
    Guid Id,
    string Name,
    string Address,
    int TotalRooms
);

public record DuplicateBuildingInfo(Guid Id, string Name, string Address);

public record BuildingDetailDto(
    Guid Id,
    string Name,
    string Address,
    DateTimeOffset CreatedAt,
    DateTimeOffset UpdatedAt,
    int TotalRooms,
    int VacantRooms,
    int OccupiedRooms
);

public record CreateBuildingResult(BuildingDetailDto? Building, DuplicateBuildingInfo? Duplicate)
{
    public bool IsDuplicate => Duplicate is not null;
}

public record UpdateBuildingResult(BuildingDetailDto? Building, int? ActualRoomCount)
{
    public bool IsTotalRoomsBelowActual => ActualRoomCount is not null;

    public static UpdateBuildingResult Success(BuildingDetailDto building) => new(building, null);
    public static UpdateBuildingResult TotalRoomsBelowActual(int actualRoomCount) => new(null, actualRoomCount);
}

public enum DeleteBuildingResult
{
    Deleted,
    NotFound,
    HasRooms
}
