namespace TroConnect.Api.Data.Entities;

public class Tenant
{
    public Guid Id { get; set; }
    public string FullName { get; set; } = string.Empty;

    // CCCD/CMND number — unique across all tenant profiles (see docs/tenant-and-account.md).
    public string IdNumber { get; set; } = string.Empty;

    public string PhoneNumber { get; set; } = string.Empty;
    public string Hometown { get; set; } = string.Empty;
    public DateOnly? DateOfBirth { get; set; }
    public TenantGender? Gender { get; set; }

    // Contact info only — not used for login (that's Account.Email).
    public string? Email { get; set; }

    public DateTimeOffset CreatedAt { get; set; }
    public DateTimeOffset UpdatedAt { get; set; }
}
