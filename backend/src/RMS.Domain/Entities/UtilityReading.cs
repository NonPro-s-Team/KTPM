namespace RMS.Domain.Entities;

public class UtilityReading
{
    public Guid Id { get; set; }
    public Guid InvoiceId { get; set; }
    public Invoice Invoice { get; set; } = null!;
    public decimal ElectricStart { get; set; }
    public decimal ElectricEnd { get; set; }
    public decimal WaterStart { get; set; }
    public decimal WaterEnd { get; set; }
}
