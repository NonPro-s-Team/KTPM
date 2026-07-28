using RMS.Domain.Enums;

namespace RMS.Application.Features.Rooms.Dtos;

public class RoomDto
{
    public Guid Id { get; set; }
    public string RoomNumber { get; set; } = string.Empty;
    public decimal MonthlyRent { get; set; }
    public RoomStatus Status { get; set; }
    public string? Description { get; set; }
    public DateTime CreatedAt { get; set; }
}
