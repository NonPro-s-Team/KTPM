namespace RMS.Infrastructure.Data.Initialization;

public sealed class SeedDataOptions
{
    public const string SectionName = "SeedData";

    public bool Enabled { get; init; }
    public string AdminUsername { get; init; } = "admin";
    public string AdminPassword { get; init; } = string.Empty;
    public string StaffUsername { get; init; } = "staff";
    public string StaffPassword { get; init; } = string.Empty;
    public string TenantUsername { get; init; } = "tenant";
    public string TenantPassword { get; init; } = string.Empty;
}
