namespace RMS.Application.Features.Invoices.Dtos;

public class UtilityReadingRequest
{
    public decimal ElectricStart { get; set; }
    public decimal ElectricEnd { get; set; }
    public decimal WaterStart { get; set; }
    public decimal WaterEnd { get; set; }
}
