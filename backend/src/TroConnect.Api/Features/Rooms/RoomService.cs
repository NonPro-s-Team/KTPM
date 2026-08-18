using Microsoft.EntityFrameworkCore;
using TroConnect.Api.Data;
using TroConnect.Api.Data.Entities;

namespace TroConnect.Api.Features.Rooms;

public class RoomService
{
    private readonly AppDbContext _db;

    public RoomService(AppDbContext db)
    {
        _db = db;
    }

    public async Task<List<RoomListDto>> GetAllAsync(Guid? buildingId)
    {
        var query = _db.Rooms.AsQueryable();
        if (buildingId is not null)
        {
            query = query.Where(r => r.BuildingId == buildingId);
        }

        return await query
            .Join(_db.Buildings, r => r.BuildingId, b => b.Id, (r, b) => new { Room = r, BuildingName = b.Name })
            .OrderBy(x => x.Room.Name)
            .Select(x => new RoomListDto(
                x.Room.Id,
                x.Room.Name,
                x.BuildingName,
                x.Room.BasePrice,
                x.Room.MaxOccupancy))
            .ToListAsync();
    }

    public async Task<RoomDetailDto?> GetByIdAsync(Guid id)
    {
        var room = await _db.Rooms.FindAsync(id);
        if (room is null)
        {
            return null;
        }

        var buildingName = await _db.Buildings
            .Where(b => b.Id == room.BuildingId)
            .Select(b => b.Name)
            .FirstAsync();

        return ToDetailDto(room, buildingName);
    }

    public async Task<RoomMutationResult> CreateAsync(CreateRoomRequest request)
    {
        var building = await _db.Buildings.FindAsync(request.BuildingId);
        if (building is null)
        {
            return new RoomMutationResult(RoomMutationError.BuildingNotFound, null);
        }

        var currentRoomCount = await _db.Rooms.CountAsync(r => r.BuildingId == building.Id);
        if (currentRoomCount >= building.TotalRooms)
        {
            return new RoomMutationResult(RoomMutationError.RoomLimitReached, null, building.TotalRooms);
        }

        var room = new Room
        {
            Id = Guid.NewGuid(),
            BuildingId = request.BuildingId,
            Name = request.Name,
            BasePrice = request.BasePrice,
            ServicePrice = request.ServicePrice,
            MaxOccupancy = request.MaxOccupancy,
            SingleOccupantDiscountAmount = request.SingleOccupantDiscountAmount,
            CreatedAt = DateTimeOffset.UtcNow,
            UpdatedAt = DateTimeOffset.UtcNow
        };

        _db.Rooms.Add(room);
        await _db.SaveChangesAsync();

        return new RoomMutationResult(RoomMutationError.None, ToDetailDto(room, building.Name));
    }

    public async Task<RoomMutationResult?> UpdateAsync(Guid id, UpdateRoomRequest request)
    {
        var room = await _db.Rooms.FindAsync(id);
        if (room is null)
        {
            return null;
        }

        var building = await _db.Buildings.FindAsync(request.BuildingId);
        if (building is null)
        {
            return new RoomMutationResult(RoomMutationError.BuildingNotFound, null);
        }

        // Only re-check the cap when moving the room into a different building.
        if (request.BuildingId != room.BuildingId)
        {
            var currentRoomCount = await _db.Rooms.CountAsync(r => r.BuildingId == request.BuildingId);
            if (currentRoomCount >= building.TotalRooms)
            {
                return new RoomMutationResult(RoomMutationError.RoomLimitReached, null, building.TotalRooms);
            }
        }

        room.BuildingId = request.BuildingId;
        room.Name = request.Name;
        room.BasePrice = request.BasePrice;
        room.ServicePrice = request.ServicePrice;
        room.MaxOccupancy = request.MaxOccupancy;
        room.SingleOccupantDiscountAmount = request.SingleOccupantDiscountAmount;
        room.UpdatedAt = DateTimeOffset.UtcNow;

        await _db.SaveChangesAsync();

        return new RoomMutationResult(RoomMutationError.None, ToDetailDto(room, building.Name));
    }

    public async Task<bool> DeleteAsync(Guid id)
    {
        var room = await _db.Rooms.FindAsync(id);
        if (room is null)
        {
            return false;
        }

        // TODO: once the Contract module exists, block this delete (return a clear error instead)
        // if the room has an active contract — see docs/contract-management.md.
        room.IsDeleted = true;
        room.DeletedAt = DateTimeOffset.UtcNow;
        await _db.SaveChangesAsync();
        return true;
    }

    private static RoomDetailDto ToDetailDto(Room room, string buildingName)
    {
        return new RoomDetailDto(
            room.Id,
            room.BuildingId,
            buildingName,
            room.Name,
            room.BasePrice,
            room.ServicePrice,
            room.MaxOccupancy,
            room.SingleOccupantDiscountAmount,
            room.CreatedAt,
            room.UpdatedAt);
    }
}
