namespace RMS.Application.Features.Rooms.Dtos;

public class UpdateRoomRequest
{
    public string RoomNumber { get; set; } = string.Empty;
    public decimal MonthlyRent { get; set; }
    public string? Description { get; set; }
}
