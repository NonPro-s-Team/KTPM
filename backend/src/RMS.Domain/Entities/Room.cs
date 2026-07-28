namespace RMS.Domain.Entities;

public class Room
{
    public Guid Id { get; set; }
    public string RoomNumber { get; set; } = string.Empty;
    public decimal MonthlyRent { get; set; }
    public Enums.RoomStatus Status { get; set; }
    public string? Description { get; set; }
    public DateTime CreatedAt { get; set; }
    public ICollection<Contract> Contracts { get; set; } = new List<Contract>();
    public ICollection<RepairRequest> RepairRequests { get; set; } = new List<RepairRequest>();
}
