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

    public async Task<BuildingDetailDto> CreateAsync(CreateBuildingRequest request)
    {
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

        return ToDetailDto(building);
    }

    public async Task<BuildingDetailDto?> UpdateAsync(Guid id, UpdateBuildingRequest request)
    {
        var building = await _db.Buildings.FindAsync(id);
        if (building is null)
        {
            return null;
        }

        building.Name = request.Name;
        building.Address = request.Address;
        building.TotalRooms = request.TotalRooms;
        building.UpdatedAt = DateTimeOffset.UtcNow;

        await _db.SaveChangesAsync();
        return ToDetailDto(building);
    }

    public async Task<bool> DeleteAsync(Guid id)
    {
        var building = await _db.Buildings.FindAsync(id);
        if (building is null)
        {
            return false;
        }

        // TODO: once the Room module exists, block this delete (return a clear error instead)
        // if the building still has any rooms attached — see docs/building-management.md's delete rule.
        _db.Buildings.Remove(building);
        await _db.SaveChangesAsync();
        return true;
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
