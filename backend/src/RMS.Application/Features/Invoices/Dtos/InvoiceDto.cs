using RMS.Domain.Enums;

namespace RMS.Application.Features.Invoices.Dtos;

public class InvoiceDto
{
    public Guid Id { get; set; }
    public Guid ContractId { get; set; }
    public int BillingMonth { get; set; }
    public int BillingYear { get; set; }
    public decimal RentAmount { get; set; }
    public decimal ElectricAmount { get; set; }
    public decimal WaterAmount { get; set; }
    public decimal TotalAmount { get; set; }
    public decimal PaidAmount { get; set; }
    public InvoiceStatus Status { get; set; }
    public DateTime CreatedAt { get; set; }
}
