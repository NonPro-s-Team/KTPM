using Microsoft.EntityFrameworkCore;
using TroConnect.Api.Data;
using TroConnect.Api.Data.Entities;

namespace TroConnect.Api.Features.Buildings;

public class BuildingService
{
    private readonly AppDbContext _db;

    public BuildingService(AppDbContext db)
    {
        _db = db;
    }

    public async Task<List<BuildingListDto>> GetAllAsync()
    {
        return await _db.Buildings
            .OrderBy(b => b.Name)
            .Select(b => new BuildingListDto(
                b.Id,
                b.Name,
                b.Address,
                b.TotalRooms))
            .ToListAsync();
    }

    public async Task<BuildingDetailDto?> GetByIdAsync(Guid id)
    {
        var building = await _db.Buildings.FindAsync(id);
        if (building is null)
        {
            return null;
        }

        return ToDetailDto(building);
    }

    public async Task<CreateBuildingResult> CreateAsync(CreateBuildingRequest request)
    {
        if (!request.ConfirmDuplicate)
        {
            // Soft duplicate check: match on normalized Address only (docs/building-management.md) —
            // Name is deliberately excluded since landlords may legitimately reuse similar names.
            var normalizedAddress = request.Address.Trim().ToLower();
            var existing = await _db.Buildings
                .FirstOrDefaultAsync(b => b.Address.Trim().ToLower() == normalizedAddress);

            if (existing is not null)
            {
                return new CreateBuildingResult(
                    null,
                    new DuplicateBuildingInfo(existing.Id, existing.Name, existing.Address));
            }
        }

        var building = new Building
        {
            Id = Guid.NewGuid(),
            Name = request.Name,
            Address = request.Address,
            TotalRooms = request.TotalRooms,
            CreatedAt = DateTimeOffset.UtcNow,
            UpdatedAt = DateTimeOffset.UtcNow
        };

        _db.Buildings.Add(building);
        await _db.SaveChangesAsync();

        return new CreateBuildingResult(ToDetailDto(building), null);
    }

    public async Task<UpdateBuildingResult?> UpdateAsync(Guid id, UpdateBuildingRequest request)
    {
        var building = await _db.Buildings.FindAsync(id);
        if (building is null)
        {
            return null;
        }

        if (request.TotalRooms < building.TotalRooms)
        {
            var actualRoomCount = await _db.Rooms.CountAsync(r => r.BuildingId == id);
            if (request.TotalRooms < actualRoomCount)
            {
                return UpdateBuildingResult.TotalRoomsBelowActual(actualRoomCount);
            }
        }

        building.Name = request.Name;
        building.Address = request.Address;
        building.TotalRooms = request.TotalRooms;
        building.UpdatedAt = DateTimeOffset.UtcNow;

        await _db.SaveChangesAsync();
        return UpdateBuildingResult.Success(ToDetailDto(building));
    }

    public async Task<DeleteBuildingResult> DeleteAsync(Guid id)
    {
        var building = await _db.Buildings.FindAsync(id);
        if (building is null)
        {
            return DeleteBuildingResult.NotFound;
        }

        var hasRooms = await _db.Rooms.AnyAsync(r => r.BuildingId == id);
        if (hasRooms)
        {
            return DeleteBuildingResult.HasRooms;
        }

        _db.Buildings.Remove(building);
        await _db.SaveChangesAsync();
        return DeleteBuildingResult.Deleted;
    }

    private static BuildingDetailDto ToDetailDto(Building building)
    {
        return new BuildingDetailDto(
            building.Id,
            building.Name,
            building.Address,
            building.CreatedAt,
            building.UpdatedAt,
            building.TotalRooms,
            // TODO: wire up to real Room/Contract query once those modules exist (vacant = no active contract).
            VacantRooms: 0,
            // TODO: wire up to real Room/Contract query once those modules exist (occupied = has active contract).
            OccupiedRooms: 0);
    }
}
