namespace RMS.Application.Features.Rooms.Dtos;

public class CreateRoomRequest
{
    public string RoomNumber { get; set; } = string.Empty;
    public decimal MonthlyRent { get; set; }
    public string? Description { get; set; }
}
