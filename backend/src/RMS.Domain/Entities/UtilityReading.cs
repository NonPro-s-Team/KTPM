using RMS.Domain.Common.Entities;

namespace RMS.Domain.Entities;

// Kept as a minimal persistence-compatibility type. Invoice is the source of
// truth for utility readings in the domain model.
public sealed class UtilityReading : BaseEntity
{
    public Guid InvoiceId { get; private set; }
    public Invoice Invoice { get; private set; } = null!;
    public decimal ElectricStart { get; private set; }
    public decimal ElectricEnd { get; private set; }
    public decimal WaterStart { get; private set; }
    public decimal WaterEnd { get; private set; }

    private UtilityReading()
    {
    }
}
