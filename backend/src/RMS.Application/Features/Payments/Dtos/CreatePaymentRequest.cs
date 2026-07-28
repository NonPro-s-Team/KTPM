namespace RMS.Application.Features.Payments.Dtos;

public class CreatePaymentRequest
{
    public Guid InvoiceId { get; set; }
    public decimal Amount { get; set; }
    public string? Note { get; set; }
}
