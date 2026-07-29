using FluentAssertions;
using RMS.Domain.Constants;
using RMS.Domain.Entities;
using RMS.Domain.Enums;
using RMS.Domain.Exceptions;

namespace RMS.UnitTests.Domain;

public class RentalContractTests
{
    private static readonly Guid RoomId =
        Guid.Parse("11111111-1111-1111-1111-111111111111");
    private static readonly Guid TenantId =
        Guid.Parse("22222222-2222-2222-2222-222222222222");
    private static readonly DateOnly StartDate = new(2026, 3, 1);
    private static readonly DateOnly EndDate = new(2027, 3, 1);
    private static readonly DateTimeOffset CreatedAt =
        new(2026, 2, 15, 7, 30, 0, TimeSpan.Zero);

    [Fact]
    public void Constructor_ValidArguments_CreatesDraftContract()
    {
        // Arrange
        const decimal monthlyRent = 3_500_000m;

        // Act
        var contract = new RentalContract(
            RoomId,
            TenantId,
            StartDate,
            EndDate,
            monthlyRent,
            CreatedAt);

        // Assert
        contract.Id.Should().NotBeEmpty();
        contract.RoomId.Should().Be(RoomId);
        contract.TenantId.Should().Be(TenantId);
        contract.StartDate.Should().Be(StartDate);
        contract.EndDate.Should().Be(EndDate);
        contract.MonthlyRent.Should().Be(monthlyRent);
        contract.Status.Should().Be(ContractStatus.Draft);
        contract.ActivatedAt.Should().BeNull();
        contract.TerminatedAt.Should().BeNull();
        contract.CancelledAt.Should().BeNull();
        contract.CreatedAt.Should().Be(CreatedAt);
        contract.UpdatedAt.Should().BeNull();
        contract.Invoices.Should().BeEmpty();
    }

    [Theory]
    [InlineData(0)]
    [InlineData(-1)]
    public void Constructor_EndDateNotAfterStartDate_ThrowsBusinessRuleViolation(
        int endDateOffset)
    {
        // Arrange
        var invalidEndDate = StartDate.AddDays(endDateOffset);

        // Act
        Action act = () => new RentalContract(
            RoomId,
            TenantId,
            StartDate,
            invalidEndDate,
            3_500_000m,
            CreatedAt);

        // Assert
        var exception = act.Should()
            .Throw<BusinessRuleViolationException>()
            .Which;
        exception.Code.Should()
            .Be(BusinessRuleCodes.ContractEndDateAfterStartDate);
        exception.Message.Should().Contain("end date");
    }

    [Fact]
    public void Constructor_NegativeMonthlyRent_ThrowsDomainException()
    {
        // Arrange
        const decimal negativeMonthlyRent = -0.01m;

        // Act
        Action act = () => new RentalContract(
            RoomId,
            TenantId,
            StartDate,
            EndDate,
            negativeMonthlyRent,
            CreatedAt);

        // Assert
        var exception = act.Should().Throw<DomainException>().Which;
        exception.Code.Should().Be(DomainErrorCodes.InvalidAmount);
        exception.Message.Should().Contain("MonthlyRent");
    }

    [Fact]
    public void Activate_DraftContract_ChangesStatusToActive()
    {
        // Arrange
        var contract = CreateContract();
        var activatedAt = CreatedAt.AddDays(1);

        // Act
        contract.Activate(activatedAt);

        // Assert
        contract.Status.Should().Be(ContractStatus.Active);
        contract.ActivatedAt.Should().Be(activatedAt);
        contract.UpdatedAt.Should().Be(activatedAt);
    }

    [Fact]
    public void Cancel_DraftContract_ChangesStatusToCancelled()
    {
        // Arrange
        var contract = CreateContract();
        var cancelledAt = CreatedAt.AddDays(1);

        // Act
        contract.Cancel(cancelledAt);

        // Assert
        contract.Status.Should().Be(ContractStatus.Cancelled);
        contract.CancelledAt.Should().Be(cancelledAt);
        contract.UpdatedAt.Should().Be(cancelledAt);
    }

    [Fact]
    public void Terminate_ActiveContract_ChangesStatusToTerminated()
    {
        // Arrange
        var contract = CreateContract();
        contract.Activate(CreatedAt.AddDays(1));
        var terminatedAt = CreatedAt.AddDays(30);

        // Act
        contract.Terminate(terminatedAt);

        // Assert
        contract.Status.Should().Be(ContractStatus.Terminated);
        contract.TerminatedAt.Should().Be(terminatedAt);
        contract.UpdatedAt.Should().Be(terminatedAt);
    }

    [Fact]
    public void Cancel_ActiveContract_ThrowsDomainException()
    {
        // Arrange
        var contract = CreateContract();
        contract.Activate(CreatedAt.AddDays(1));

        // Act
        Action act = () => contract.Cancel(CreatedAt.AddDays(2));

        // Assert
        var exception = act.Should().Throw<DomainException>().Which;
        exception.Code.Should().Be(DomainErrorCodes.InvalidState);
        exception.Message.Should().Contain("draft");
        contract.Status.Should().Be(ContractStatus.Active);
    }

    [Fact]
    public void Activate_TerminatedContract_ThrowsDomainException()
    {
        // Arrange
        var contract = CreateContract();
        contract.Activate(CreatedAt.AddDays(1));
        contract.Terminate(CreatedAt.AddDays(2));

        // Act
        Action act = () => contract.Activate(CreatedAt.AddDays(3));

        // Assert
        var exception = act.Should().Throw<DomainException>().Which;
        exception.Code.Should().Be(DomainErrorCodes.InvalidState);
        exception.Message.Should().Contain("draft");
        contract.Status.Should().Be(ContractStatus.Terminated);
    }

    [Fact]
    public void UpdateDraftTerms_ActiveContract_ThrowsDomainException()
    {
        // Arrange
        var contract = CreateContract();
        contract.Activate(CreatedAt.AddDays(1));
        var originalStartDate = contract.StartDate;
        var originalEndDate = contract.EndDate;
        var originalMonthlyRent = contract.MonthlyRent;

        // Act
        Action act = () => contract.UpdateDraftTerms(
            StartDate.AddMonths(1),
            EndDate.AddMonths(1),
            4_000_000m,
            CreatedAt.AddDays(2));

        // Assert
        var exception = act.Should().Throw<DomainException>().Which;
        exception.Code.Should().Be(DomainErrorCodes.InvalidState);
        exception.Message.Should().Contain("draft");
        contract.StartDate.Should().Be(originalStartDate);
        contract.EndDate.Should().Be(originalEndDate);
        contract.MonthlyRent.Should().Be(originalMonthlyRent);
        contract.Status.Should().Be(ContractStatus.Active);
    }

    private static RentalContract CreateContract() =>
        new(
            RoomId,
            TenantId,
            StartDate,
            EndDate,
            3_500_000m,
            CreatedAt);
}
