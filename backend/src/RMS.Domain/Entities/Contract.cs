namespace RMS.Domain.Entities;

public class Contract
{
    public Guid Id { get; set; }
    public Guid RoomId { get; set; }
    public Room Room { get; set; } = null!;
    public Guid TenantId { get; set; }
    public Tenant Tenant { get; set; } = null!;
    public DateTime StartDate { get; set; }
    public DateTime EndDate { get; set; }
    public decimal MonthlyRent { get; set; }
    public Enums.ContractStatus Status { get; set; }
    public DateTime CreatedAt { get; set; }
    public ICollection<Invoice> Invoices { get; set; } = new List<Invoice>();
}
