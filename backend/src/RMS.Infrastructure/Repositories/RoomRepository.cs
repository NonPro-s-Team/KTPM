using Microsoft.EntityFrameworkCore;
using RMS.Application.Common.Interfaces.Persistence;
using RMS.Application.Common.Models;
using RMS.Domain.Entities;
using RMS.Domain.Enums;
using RMS.Infrastructure.Data;

namespace RMS.Infrastructure.Repositories;

public sealed class RoomRepository : IRoomRepository
{
    private readonly AppDbContext _dbContext;

    public RoomRepository(AppDbContext dbContext)
    {
        _dbContext = dbContext;
    }

    public Task<Room?> GetByIdAsync(
        Guid roomId,
        CancellationToken cancellationToken = default) =>
        _dbContext.Rooms.SingleOrDefaultAsync(
            room => room.Id == roomId,
            cancellationToken);

    public async Task<PagedResult<Room>> GetPagedAsync(
        PagedRequest request,
        RoomStatus? status,
        CancellationToken cancellationToken = default)
    {
        ArgumentNullException.ThrowIfNull(request);

        IQueryable<Room> query = _dbContext.Rooms.AsNoTracking();
        if (status.HasValue)
        {
            query = query.Where(room => room.Status == status.Value);
        }

        var totalCount = await query.CountAsync(cancellationToken);
        var rooms = await query
            .OrderByDescending(room => room.CreatedAt)
            .ThenBy(room => room.Id)
            .Skip((request.PageNumber - 1) * request.PageSize)
            .Take(request.PageSize)
            .ToListAsync(cancellationToken);

        return new PagedResult<Room>(
            rooms,
            request.PageNumber,
            request.PageSize,
            totalCount);
    }

    public Task<bool> RoomNumberExistsAsync(
        string roomNumber,
        Guid? excludeRoomId,
        CancellationToken cancellationToken = default)
    {
        var normalizedRoomNumber = roomNumber.Trim();
        return _dbContext.Rooms.AnyAsync(
            room =>
                room.RoomNumber == normalizedRoomNumber
                && (!excludeRoomId.HasValue || room.Id != excludeRoomId.Value),
            cancellationToken);
    }

    public void Add(Room room)
    {
        ArgumentNullException.ThrowIfNull(room);
        _dbContext.Rooms.Add(room);
    }
}
