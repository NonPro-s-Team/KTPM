using RMS.Application.Common.Models;
using RMS.Application.Rooms.Models;

namespace RMS.Application.Rooms;

public interface IRoomService
{
    Task<RoomResponse> CreateRoomAsync(
        CreateRoomRequest request,
        CancellationToken cancellationToken = default);

    Task<RoomResponse> UpdateRoomAsync(
        Guid roomId,
        UpdateRoomRequest request,
        CancellationToken cancellationToken = default);

    Task<RoomResponse> ChangeRoomStatusAsync(
        Guid roomId,
        ChangeRoomStatusRequest request,
        CancellationToken cancellationToken = default);

    Task<RoomResponse> GetRoomByIdAsync(
        Guid roomId,
        CancellationToken cancellationToken = default);

    Task<PagedResult<RoomResponse>> GetRoomsAsync(
        RoomFilterRequest request,
        CancellationToken cancellationToken = default);
}
