using RMS.Domain.Common;
using RMS.Domain.Common.Entities;
using RMS.Domain.Constants;
using RMS.Domain.Exceptions;

namespace RMS.Domain.Entities;

public sealed class Payment : BaseEntity
{
    public Guid InvoiceId { get; private set; }
    public Invoice Invoice { get; private set; } = null!;
    public decimal Amount { get; private set; }
    public DateTimeOffset PaidAt { get; private set; }
    public string? Note { get; private set; }
    public Guid RecordedByUserId { get; private set; }
    public DateTimeOffset CreatedAt { get; private set; }

    private Payment()
    {
    }

    private Payment(
        Invoice invoice,
        decimal amount,
        string? note,
        Guid recordedByUserId,
        DateTimeOffset paidAt)
        : base(Guid.NewGuid())
    {
        Invoice = invoice;
        InvoiceId = Guard.Required(invoice.Id, nameof(InvoiceId));
        Amount = ValidateAmount(amount);
        Note = NormalizeNote(note);
        RecordedByUserId = Guard.Required(
            recordedByUserId,
            nameof(RecordedByUserId));
        PaidAt = paidAt.ToUniversalTime();
        CreatedAt = PaidAt;
    }

    internal static Payment Create(
        Invoice invoice,
        decimal amount,
        string? note,
        Guid recordedByUserId,
        DateTimeOffset paidAt)
    {
        ArgumentNullException.ThrowIfNull(invoice);

        return new Payment(
            invoice,
            amount,
            note,
            recordedByUserId,
            paidAt);
    }

    private static string? NormalizeNote(string? note) =>
        string.IsNullOrWhiteSpace(note) ? null : note.Trim();

    private static decimal ValidateAmount(decimal amount)
    {
        var normalizedAmount = decimal.Round(
            amount,
            2,
            MidpointRounding.AwayFromZero);

        if (normalizedAmount <= 0m)
        {
            throw new BusinessRuleViolationException(
                BusinessRuleCodes.PaymentAmountMustBePositive,
                "Payment amount must be greater than zero.");
        }

        return normalizedAmount;
    }
}
