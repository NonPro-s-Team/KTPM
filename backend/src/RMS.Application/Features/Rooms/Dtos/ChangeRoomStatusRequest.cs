using RMS.Domain.Enums;

namespace RMS.Application.Features.Rooms.Dtos;

public class ChangeRoomStatusRequest
{
    public RoomStatus Status { get; set; }
}
