using System.ComponentModel.DataAnnotations;

namespace TroConnect.Api.Features.Buildings;

public record CreateBuildingRequest(
    [Required] string Name,
    [Required] string Address,
    [Range(0, int.MaxValue)] int TotalRooms
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
