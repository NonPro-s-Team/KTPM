using RMS.Domain.Common;
using RMS.Domain.Common.Entities;
using RMS.Domain.Constants;
using RMS.Domain.Enums;
using RMS.Domain.Exceptions;
using RMS.Domain.ValueObjects;

namespace RMS.Domain.Entities;

public class Invoice : AuditableEntity
{
    private readonly List<Payment> _payments = new();

    public Guid ContractId { get; private set; }
    public RentalContract Contract { get; private set; } = null!;
    public BillingPeriod BillingPeriod { get; private set; } = null!;
    public decimal RentAmount { get; private set; }
    public decimal ElectricityStartReading { get; private set; }
    public decimal ElectricityEndReading { get; private set; }
    public decimal WaterStartReading { get; private set; }
    public decimal WaterEndReading { get; private set; }
    public decimal ElectricityUnitPrice { get; private set; }
    public decimal WaterUnitPrice { get; private set; }
    public decimal ElectricityAmount { get; private set; }
    public decimal WaterAmount { get; private set; }
    public decimal TotalAmount { get; private set; }
    public decimal PaidAmount { get; private set; }
    public InvoiceStatus Status { get; private set; }
    public DateTimeOffset? IssuedAt { get; private set; }
    public DateTimeOffset? PaidAt { get; private set; }
    public DateTimeOffset? CancelledAt { get; private set; }
    public IReadOnlyCollection<Payment> Payments => _payments.AsReadOnly();

    protected Invoice()
    {
    }

    public Invoice(
        Guid contractId,
        BillingPeriod billingPeriod,
        decimal rentAmount,
        decimal electricityStartReading,
        decimal electricityEndReading,
        decimal waterStartReading,
        decimal waterEndReading,
        decimal electricityUnitPrice,
        decimal waterUnitPrice,
        DateTimeOffset createdAt)
        : base(createdAt)
    {
        ContractId = Guard.Required(contractId, nameof(ContractId));
        BillingPeriod = billingPeriod
            ?? throw new DomainException(
                DomainErrorCodes.RequiredField,
                "Billing period is required.");

        ApplyBillingDetails(
            rentAmount,
            electricityStartReading,
            electricityEndReading,
            waterStartReading,
            waterEndReading,
            electricityUnitPrice,
            waterUnitPrice);

        PaidAmount = 0m;
        Status = InvoiceStatus.Draft;
    }

    public void UpdateDraftReadingsAndPrices(
        decimal rentAmount,
        decimal electricityStartReading,
        decimal electricityEndReading,
        decimal waterStartReading,
        decimal waterEndReading,
        decimal electricityUnitPrice,
        decimal waterUnitPrice,
        DateTimeOffset updatedAt)
    {
        if (Status != InvoiceStatus.Draft)
        {
            throw new BusinessRuleViolationException(
                BusinessRuleCodes.PaidInvoiceImmutable,
                Status == InvoiceStatus.Paid
                    ? "A paid invoice cannot have its billing details changed."
                    : "Only a draft invoice can have its billing details changed.");
        }

        ApplyBillingDetails(
            rentAmount,
            electricityStartReading,
            electricityEndReading,
            waterStartReading,
            waterEndReading,
            electricityUnitPrice,
            waterUnitPrice);

        MarkUpdated(updatedAt);
    }

    public void Issue(DateTimeOffset issuedAt)
    {
        EnsureStatus(
            InvoiceStatus.Draft,
            "Only a draft invoice can be issued.");

        Status = InvoiceStatus.Issued;
        IssuedAt = NormalizeTimestamp(issuedAt);
        MarkUpdated(issuedAt);
    }

    public Payment RegisterPayment(
        decimal amount,
        string? note,
        Guid recordedByUserId,
        DateTimeOffset paidAt)
    {
        if (Status is not InvoiceStatus.Issued
            and not InvoiceStatus.PartiallyPaid)
        {
            throw new DomainException(
                DomainErrorCodes.InvalidState,
                "Payments can only be registered for an issued or partially paid invoice.");
        }

        var normalizedAmount = RoundMoney(amount);
        if (normalizedAmount <= 0m)
        {
            throw new BusinessRuleViolationException(
                BusinessRuleCodes.PaymentAmountMustBePositive,
                "Payment amount must be greater than zero.");
        }

        var outstandingAmount = GetOutstandingAmount();
        if (normalizedAmount > outstandingAmount)
        {
            throw new BusinessRuleViolationException(
                BusinessRuleCodes.PaymentCannotExceedInvoiceTotal,
                "Payment amount cannot exceed the invoice's outstanding amount.");
        }

        var payment = Payment.Create(
            this,
            normalizedAmount,
            note,
            recordedByUserId,
            paidAt);

        _payments.Add(payment);
        PaidAmount = RoundMoney(PaidAmount + normalizedAmount);

        if (PaidAmount == TotalAmount)
        {
            Status = InvoiceStatus.Paid;
            PaidAt = NormalizeTimestamp(paidAt);
        }
        else
        {
            Status = InvoiceStatus.PartiallyPaid;
        }

        MarkUpdated(paidAt);
        return payment;
    }

    public void MarkOverdue(DateTimeOffset occurredAt)
    {
        if (Status is not InvoiceStatus.Issued
            and not InvoiceStatus.PartiallyPaid)
        {
            throw new DomainException(
                DomainErrorCodes.InvalidState,
                "Only an issued or partially paid invoice can be marked overdue.");
        }

        Status = InvoiceStatus.Overdue;
        MarkUpdated(occurredAt);
    }

    public void Cancel(DateTimeOffset cancelledAt)
    {
        if (_payments.Count > 0 || PaidAmount > 0m)
        {
            throw new DomainException(
                DomainErrorCodes.InvalidState,
                "An invoice with payment history cannot be cancelled.");
        }

        if (Status is InvoiceStatus.Paid or InvoiceStatus.Cancelled)
        {
            throw new DomainException(
                DomainErrorCodes.InvalidState,
                "A paid or cancelled invoice cannot be cancelled.");
        }

        Status = InvoiceStatus.Cancelled;
        CancelledAt = NormalizeTimestamp(cancelledAt);
        MarkUpdated(cancelledAt);
    }

    public decimal GetOutstandingAmount() =>
        Math.Max(0m, RoundMoney(TotalAmount - PaidAmount));

    private void ApplyBillingDetails(
        decimal rentAmount,
        decimal electricityStartReading,
        decimal electricityEndReading,
        decimal waterStartReading,
        decimal waterEndReading,
        decimal electricityUnitPrice,
        decimal waterUnitPrice)
    {
        ValidateReadings(
            electricityStartReading,
            electricityEndReading,
            waterStartReading,
            waterEndReading);

        var normalizedRentAmount = RoundMoney(
            Guard.NonNegative(rentAmount, nameof(RentAmount)));
        var normalizedElectricityUnitPrice = RoundMoney(
            Guard.NonNegative(
                electricityUnitPrice,
                nameof(ElectricityUnitPrice)));
        var normalizedWaterUnitPrice = RoundMoney(
            Guard.NonNegative(waterUnitPrice, nameof(WaterUnitPrice)));
        var electricityAmount = RoundMoney(
            (electricityEndReading - electricityStartReading)
            * normalizedElectricityUnitPrice);
        var waterAmount = RoundMoney(
            (waterEndReading - waterStartReading) * normalizedWaterUnitPrice);

        RentAmount = normalizedRentAmount;
        ElectricityStartReading = electricityStartReading;
        ElectricityEndReading = electricityEndReading;
        WaterStartReading = waterStartReading;
        WaterEndReading = waterEndReading;
        ElectricityUnitPrice = normalizedElectricityUnitPrice;
        WaterUnitPrice = normalizedWaterUnitPrice;
        ElectricityAmount = electricityAmount;
        WaterAmount = waterAmount;
        TotalAmount = RoundMoney(
            normalizedRentAmount + electricityAmount + waterAmount);
    }

    private static void ValidateReadings(
        decimal electricityStartReading,
        decimal electricityEndReading,
        decimal waterStartReading,
        decimal waterEndReading)
    {
        if (electricityEndReading < electricityStartReading)
        {
            throw new BusinessRuleViolationException(
                BusinessRuleCodes.UtilityEndReadingsNotBelowStart,
                "Electricity end reading cannot be below its start reading.");
        }

        if (waterEndReading < waterStartReading)
        {
            throw new BusinessRuleViolationException(
                BusinessRuleCodes.UtilityEndReadingsNotBelowStart,
                "Water end reading cannot be below its start reading.");
        }
    }

    private void EnsureStatus(InvoiceStatus expectedStatus, string message)
    {
        if (Status != expectedStatus)
        {
            throw new DomainException(DomainErrorCodes.InvalidState, message);
        }
    }

    private static decimal RoundMoney(decimal value) =>
        decimal.Round(value, 2, MidpointRounding.AwayFromZero);
}
