namespace RMS.Application.Features.Invoices.Dtos;

public class CreateInvoiceRequest
{
    public Guid ContractId { get; set; }
    public int BillingMonth { get; set; }
    public int BillingYear { get; set; }
}
