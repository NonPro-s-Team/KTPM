namespace RMS.Domain.Entities;

public class Invoice
{
    public Guid Id { get; set; }
    public Guid ContractId { get; set; }
    public Contract Contract { get; set; } = null!;
    public int BillingMonth { get; set; }
    public int BillingYear { get; set; }
    public decimal RentAmount { get; set; }
    public decimal ElectricAmount { get; set; }
    public decimal WaterAmount { get; set; }
    public decimal TotalAmount { get; set; }
    public decimal PaidAmount { get; set; }
    public Enums.InvoiceStatus Status { get; set; }
    public DateTime CreatedAt { get; set; }
    public ICollection<Payment> Payments { get; set; } = new List<Payment>();
    public UtilityReading? UtilityReading { get; set; }
}
