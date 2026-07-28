namespace RMS.Application.Features.Contracts.Dtos;

public class CreateContractRequest
{
    public Guid RoomId { get; set; }
    public Guid TenantId { get; set; }
    public DateTime StartDate { get; set; }
    public DateTime EndDate { get; set; }
    public decimal MonthlyRent { get; set; }
}
