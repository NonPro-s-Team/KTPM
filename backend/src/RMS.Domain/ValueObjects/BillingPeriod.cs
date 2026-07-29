using RMS.Domain.Constants;
using RMS.Domain.Exceptions;

namespace RMS.Domain.ValueObjects;

public sealed record BillingPeriod
{
    public const int MinimumYear = 2000;
    public const int MaximumYear = 2100;

    public int Month { get; }
    public int Year { get; }

    public BillingPeriod(int month, int year)
    {
        if (month is < 1 or > 12)
        {
            throw new DomainException(
                DomainErrorCodes.InvalidDateRange,
                "Billing period month must be between 1 and 12.");
        }

        if (year is < MinimumYear or > MaximumYear)
        {
            throw new DomainException(
                DomainErrorCodes.InvalidDateRange,
                $"Billing period year must be between {MinimumYear} and {MaximumYear}.");
        }

        Month = month;
        Year = year;
    }

    public override string ToString() => $"{Year:D4}-{Month:D2}";
}
