namespace RMS.Application.Features.Payments.Dtos;

public class PaymentDto
{
    public Guid Id { get; set; }
    public Guid InvoiceId { get; set; }
    public decimal Amount { get; set; }
    public DateTime PaidAt { get; set; }
    public string? Note { get; set; }
}
