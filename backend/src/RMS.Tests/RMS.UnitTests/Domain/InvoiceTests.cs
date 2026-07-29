using FluentAssertions;
using RMS.Domain.Constants;
using RMS.Domain.Entities;
using RMS.Domain.Enums;
using RMS.Domain.Exceptions;
using RMS.Domain.ValueObjects;

namespace RMS.UnitTests.Domain;

public class InvoiceTests
{
    private const decimal RentAmount = 1_000m;
    private const decimal ElectricityStartReading = 100m;
    private const decimal ElectricityEndReading = 125m;
    private const decimal WaterStartReading = 50m;
    private const decimal WaterEndReading = 58m;
    private const decimal ElectricityUnitPrice = 2.5m;
    private const decimal WaterUnitPrice = 3m;
    private const decimal ExpectedElectricityAmount = 62.5m;
    private const decimal ExpectedWaterAmount = 24m;
    private const decimal ExpectedTotalAmount = 1_086.5m;

    private static readonly Guid ContractId =
        Guid.Parse("40000000-0000-0000-0000-000000000004");

    private static readonly Guid RecordedByUserId =
        Guid.Parse("50000000-0000-0000-0000-000000000005");

    private static readonly DateTimeOffset CreatedAt =
        new(2026, 7, 1, 1, 0, 0, TimeSpan.Zero);

    private static readonly DateTimeOffset IssuedAt =
        new(2026, 7, 1, 2, 0, 0, TimeSpan.Zero);

    private static readonly DateTimeOffset PaidAt =
        new(2026, 7, 1, 3, 0, 0, TimeSpan.Zero);

    [Fact]
    public void Constructor_ValidArguments_CreatesDraftInvoice()
    {
        // Arrange
        var billingPeriod = new BillingPeriod(7, 2026);

        // Act
        var invoice = CreateInvoice(billingPeriod);

        // Assert
        invoice.Id.Should().NotBeEmpty();
        invoice.ContractId.Should().Be(ContractId);
        invoice.BillingPeriod.Should().Be(billingPeriod);
        invoice.RentAmount.Should().Be(RentAmount);
        invoice.Status.Should().Be(InvoiceStatus.Draft);
        invoice.PaidAmount.Should().Be(0m);
        invoice.IssuedAt.Should().BeNull();
        invoice.PaidAt.Should().BeNull();
        invoice.CreatedAt.Should().Be(CreatedAt);
        invoice.Payments.Should().BeEmpty();
    }

    [Fact]
    public void Constructor_ElectricityEndBelowStart_ThrowsBusinessRuleViolationException()
    {
        // Arrange
        var billingPeriod = new BillingPeriod(7, 2026);

        // Act
        Action act = () => CreateInvoice(
            billingPeriod,
            electricityEndReading: ElectricityStartReading - 1m);

        // Assert
        var exception = act.Should()
            .Throw<BusinessRuleViolationException>()
            .Which;
        exception.Code.Should()
            .Be(BusinessRuleCodes.UtilityEndReadingsNotBelowStart);
        exception.Message.Should().ContainEquivalentOf("electricity");
    }

    [Fact]
    public void Constructor_WaterEndBelowStart_ThrowsBusinessRuleViolationException()
    {
        // Arrange
        var billingPeriod = new BillingPeriod(7, 2026);

        // Act
        Action act = () => CreateInvoice(
            billingPeriod,
            waterEndReading: WaterStartReading - 1m);

        // Assert
        var exception = act.Should()
            .Throw<BusinessRuleViolationException>()
            .Which;
        exception.Code.Should()
            .Be(BusinessRuleCodes.UtilityEndReadingsNotBelowStart);
        exception.Message.Should().ContainEquivalentOf("water");
    }

    [Fact]
    public void Constructor_ValidElectricityReadings_CalculatesElectricityAmount()
    {
        // Arrange
        var billingPeriod = new BillingPeriod(7, 2026);

        // Act
        var invoice = CreateInvoice(billingPeriod);

        // Assert
        invoice.ElectricityAmount.Should().Be(ExpectedElectricityAmount);
    }

    [Fact]
    public void Constructor_ValidWaterReadings_CalculatesWaterAmount()
    {
        // Arrange
        var billingPeriod = new BillingPeriod(7, 2026);

        // Act
        var invoice = CreateInvoice(billingPeriod);

        // Assert
        invoice.WaterAmount.Should().Be(ExpectedWaterAmount);
    }

    [Fact]
    public void Constructor_ValidAmounts_CalculatesTotalAmount()
    {
        // Arrange
        var billingPeriod = new BillingPeriod(7, 2026);

        // Act
        var invoice = CreateInvoice(billingPeriod);

        // Assert
        invoice.TotalAmount.Should().Be(ExpectedTotalAmount);
    }

    [Fact]
    public void Issue_DraftInvoice_ChangesStatus()
    {
        // Arrange
        var invoice = CreateInvoice();

        // Act
        invoice.Issue(IssuedAt);

        // Assert
        invoice.Status.Should().Be(InvoiceStatus.Issued);
        invoice.IssuedAt.Should().Be(IssuedAt);
        invoice.UpdatedAt.Should().Be(IssuedAt);
    }

    [Fact]
    public void RegisterPayment_DraftInvoice_ThrowsDomainException()
    {
        // Arrange
        var invoice = CreateInvoice();

        // Act
        Action act = () =>
            invoice.RegisterPayment(100m, null, RecordedByUserId, PaidAt);

        // Assert
        var exception = act.Should().Throw<DomainException>().Which;
        exception.Code.Should().Be(DomainErrorCodes.InvalidState);
        exception.Message.Should().ContainEquivalentOf("issued");
    }

    [Fact]
    public void RegisterPayment_ZeroAmount_ThrowsBusinessRuleViolationException()
    {
        // Arrange
        var invoice = CreateIssuedInvoice();

        // Act
        Action act = () =>
            invoice.RegisterPayment(0m, null, RecordedByUserId, PaidAt);

        // Assert
        var exception = act.Should()
            .Throw<BusinessRuleViolationException>()
            .Which;
        exception.Code.Should()
            .Be(BusinessRuleCodes.PaymentAmountMustBePositive);
        exception.Message.Should().ContainEquivalentOf("greater than zero");
    }

    [Fact]
    public void RegisterPayment_NegativeAmount_ThrowsBusinessRuleViolationException()
    {
        // Arrange
        var invoice = CreateIssuedInvoice();

        // Act
        Action act = () =>
            invoice.RegisterPayment(-1m, null, RecordedByUserId, PaidAt);

        // Assert
        var exception = act.Should()
            .Throw<BusinessRuleViolationException>()
            .Which;
        exception.Code.Should()
            .Be(BusinessRuleCodes.PaymentAmountMustBePositive);
        exception.Message.Should().ContainEquivalentOf("greater than zero");
    }

    [Fact]
    public void RegisterPayment_AmountAboveOutstanding_ThrowsBusinessRuleViolationException()
    {
        // Arrange
        var invoice = CreateIssuedInvoice();
        var amount = invoice.GetOutstandingAmount() + 0.01m;

        // Act
        Action act = () =>
            invoice.RegisterPayment(amount, null, RecordedByUserId, PaidAt);

        // Assert
        var exception = act.Should()
            .Throw<BusinessRuleViolationException>()
            .Which;
        exception.Code.Should()
            .Be(BusinessRuleCodes.PaymentCannotExceedInvoiceTotal);
        exception.Message.Should().ContainEquivalentOf("outstanding");
    }

    [Fact]
    public void RegisterPayment_PartialAmount_ChangesStatusToPartiallyPaid()
    {
        // Arrange
        var invoice = CreateIssuedInvoice();
        const decimal partialAmount = 400m;

        // Act
        invoice.RegisterPayment(
            partialAmount,
            "First installment",
            RecordedByUserId,
            PaidAt);

        // Assert
        invoice.Status.Should().Be(InvoiceStatus.PartiallyPaid);
        invoice.PaidAmount.Should().Be(partialAmount);
        invoice.GetOutstandingAmount().Should()
            .Be(ExpectedTotalAmount - partialAmount);
        invoice.PaidAt.Should().BeNull();
    }

    [Fact]
    public void RegisterPayment_FullOutstandingAmount_ChangesStatusToPaid()
    {
        // Arrange
        var invoice = CreateIssuedInvoice();
        var outstandingAmount = invoice.GetOutstandingAmount();

        // Act
        invoice.RegisterPayment(
            outstandingAmount,
            "Paid in full",
            RecordedByUserId,
            PaidAt);

        // Assert
        invoice.Status.Should().Be(InvoiceStatus.Paid);
        invoice.PaidAmount.Should().Be(ExpectedTotalAmount);
        invoice.GetOutstandingAmount().Should().Be(0m);
    }

    [Fact]
    public void RegisterPayment_FullOutstandingAmount_RecordsPaidAt()
    {
        // Arrange
        var invoice = CreateIssuedInvoice();

        // Act
        invoice.RegisterPayment(
            invoice.GetOutstandingAmount(),
            null,
            RecordedByUserId,
            PaidAt);

        // Assert
        invoice.PaidAt.Should().Be(PaidAt);
        invoice.UpdatedAt.Should().Be(PaidAt);
    }

    [Fact]
    public void RegisterPayment_ValidAmount_AddsPaymentToHistory()
    {
        // Arrange
        var invoice = CreateIssuedInvoice();
        const decimal amount = 400m;
        const string note = "First installment";

        // Act
        invoice.RegisterPayment(
            amount,
            note,
            RecordedByUserId,
            PaidAt);

        // Assert
        invoice.Payments.Should().ContainSingle();
        var payment = invoice.Payments.Single();
        payment.InvoiceId.Should().Be(invoice.Id);
        payment.Amount.Should().Be(amount);
        payment.Note.Should().Be(note);
        payment.RecordedByUserId.Should().Be(RecordedByUserId);
        payment.PaidAt.Should().Be(PaidAt);
        payment.CreatedAt.Should().Be(PaidAt);
    }

    [Fact]
    public void UpdateDraftReadingsAndPrices_PaidInvoice_ThrowsBusinessRuleViolationException()
    {
        // Arrange
        var invoice = CreatePaidInvoice();

        // Act
        Action act = () => invoice.UpdateDraftReadingsAndPrices(
            RentAmount,
            ElectricityStartReading,
            ElectricityEndReading + 1m,
            WaterStartReading,
            WaterEndReading + 1m,
            ElectricityUnitPrice,
            WaterUnitPrice,
            PaidAt.AddMinutes(30));

        // Assert
        var exception = act.Should()
            .Throw<BusinessRuleViolationException>()
            .Which;
        exception.Code.Should().Be(BusinessRuleCodes.PaidInvoiceImmutable);
        exception.Message.Should().ContainEquivalentOf("paid");
    }

    [Fact]
    public void RegisterPayment_PaidInvoice_ThrowsDomainException()
    {
        // Arrange
        var invoice = CreatePaidInvoice();

        // Act
        Action act = () =>
            invoice.RegisterPayment(1m, null, RecordedByUserId, PaidAt.AddHours(1));

        // Assert
        var exception = act.Should().Throw<DomainException>().Which;
        exception.Code.Should().Be(DomainErrorCodes.InvalidState);
        exception.Message.Should().ContainEquivalentOf("paid");
    }

    private static Invoice CreateInvoice(
        BillingPeriod? billingPeriod = null,
        decimal electricityEndReading = ElectricityEndReading,
        decimal waterEndReading = WaterEndReading) =>
        new(
            ContractId,
            billingPeriod ?? new BillingPeriod(7, 2026),
            RentAmount,
            ElectricityStartReading,
            electricityEndReading,
            WaterStartReading,
            waterEndReading,
            ElectricityUnitPrice,
            WaterUnitPrice,
            CreatedAt);

    private static Invoice CreateIssuedInvoice()
    {
        var invoice = CreateInvoice();
        invoice.Issue(IssuedAt);
        return invoice;
    }

    private static Invoice CreatePaidInvoice()
    {
        var invoice = CreateIssuedInvoice();
        invoice.RegisterPayment(
            invoice.GetOutstandingAmount(),
            "Paid in full",
            RecordedByUserId,
            PaidAt);
        return invoice;
    }
}
