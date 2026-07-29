using RMS.Domain.Common;
using RMS.Domain.Common.Entities;
using RMS.Domain.Constants;
using RMS.Domain.Enums;
using RMS.Domain.Exceptions;

namespace RMS.Domain.Entities;

public class RentalContract : AuditableEntity
{
    private readonly List<Invoice> _invoices = new();

    public Guid RoomId { get; private set; }
    public Room Room { get; private set; } = null!;
    public Guid TenantId { get; private set; }
    public Tenant Tenant { get; private set; } = null!;
    public DateOnly StartDate { get; private set; }
    public DateOnly EndDate { get; private set; }
    public decimal MonthlyRent { get; private set; }
    public ContractStatus Status { get; private set; }
    public DateTimeOffset? ActivatedAt { get; private set; }
    public DateTimeOffset? TerminatedAt { get; private set; }
    public DateTimeOffset? CancelledAt { get; private set; }
    public IReadOnlyCollection<Invoice> Invoices => _invoices.AsReadOnly();

    protected RentalContract()
    {
    }

    public RentalContract(
        Guid roomId,
        Guid tenantId,
        DateOnly startDate,
        DateOnly endDate,
        decimal monthlyRent,
        DateTimeOffset createdAt)
        : base(createdAt)
    {
        RoomId = Guard.Required(roomId, nameof(RoomId));
        TenantId = Guard.Required(tenantId, nameof(TenantId));
        ValidateDateRange(startDate, endDate);

        StartDate = startDate;
        EndDate = endDate;
        MonthlyRent = Guard.NonNegative(monthlyRent, nameof(MonthlyRent));
        Status = ContractStatus.Draft;
    }

    public void UpdateDraftTerms(
        DateOnly startDate,
        DateOnly endDate,
        decimal monthlyRent,
        DateTimeOffset updatedAt)
    {
        EnsureStatus(
            ContractStatus.Draft,
            "Only a draft contract can have its terms updated.");
        ValidateDateRange(startDate, endDate);
        var validatedMonthlyRent = Guard.NonNegative(
            monthlyRent,
            nameof(MonthlyRent));

        StartDate = startDate;
        EndDate = endDate;
        MonthlyRent = validatedMonthlyRent;
        MarkUpdated(updatedAt);
    }

    public void Activate(DateTimeOffset activatedAt)
    {
        EnsureStatus(
            ContractStatus.Draft,
            "Only a draft contract can be activated.");

        Status = ContractStatus.Active;
        ActivatedAt = NormalizeTimestamp(activatedAt);
        MarkUpdated(activatedAt);
    }

    public void Terminate(DateTimeOffset terminatedAt)
    {
        EnsureStatus(
            ContractStatus.Active,
            "Only an active contract can be terminated.");

        Status = ContractStatus.Terminated;
        TerminatedAt = NormalizeTimestamp(terminatedAt);
        MarkUpdated(terminatedAt);
    }

    public void Cancel(DateTimeOffset cancelledAt)
    {
        EnsureStatus(
            ContractStatus.Draft,
            "Only a draft contract can be cancelled.");

        Status = ContractStatus.Cancelled;
        CancelledAt = NormalizeTimestamp(cancelledAt);
        MarkUpdated(cancelledAt);
    }

    private static void ValidateDateRange(DateOnly startDate, DateOnly endDate)
    {
        if (endDate <= startDate)
        {
            throw new BusinessRuleViolationException(
                BusinessRuleCodes.ContractEndDateAfterStartDate,
                "Contract end date must be at least one day after its start date.");
        }
    }

    private void EnsureStatus(ContractStatus expectedStatus, string message)
    {
        if (Status != expectedStatus)
        {
            throw new DomainException(DomainErrorCodes.InvalidState, message);
        }
    }
}
