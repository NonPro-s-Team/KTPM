using RMS.Application.Common.Models;
using RMS.Domain.Entities;
using RMS.Domain.Enums;

namespace RMS.Application.Common.Interfaces.Persistence;

public interface IRoomRepository
{
    Task<Room?> GetByIdAsync(
        Guid roomId,
        CancellationToken cancellationToken = default);

    Task<PagedResult<Room>> GetPagedAsync(
        PagedRequest request,
        RoomStatus? status,
        CancellationToken cancellationToken = default);

    Task<bool> RoomNumberExistsAsync(
        string roomNumber,
        Guid? excludeRoomId,
        CancellationToken cancellationToken = default);

    void Add(Room room);
}
