namespace RMS.Domain.Entities;

// Compatibility type for the existing Infrastructure project. New domain code
// should use RentalContract directly.
public sealed class Contract : RentalContract
{
    private Contract()
    {
    }
}
