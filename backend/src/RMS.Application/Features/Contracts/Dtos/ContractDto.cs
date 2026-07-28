using RMS.Domain.Enums;

namespace RMS.Application.Features.Contracts.Dtos;

public class ContractDto
{
    public Guid Id { get; set; }
    public Guid RoomId { get; set; }
    public string RoomNumber { get; set; } = string.Empty;
    public Guid TenantId { get; set; }
    public string TenantName { get; set; } = string.Empty;
    public DateTime StartDate { get; set; }
    public DateTime EndDate { get; set; }
    public decimal MonthlyRent { get; set; }
    public ContractStatus Status { get; set; }
    public DateTime CreatedAt { get; set; }
}
