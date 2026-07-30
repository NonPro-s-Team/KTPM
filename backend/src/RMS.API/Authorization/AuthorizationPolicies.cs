namespace RMS.API.Authorization;

public static class AuthorizationPolicies
{
    public const string AdminOnly = nameof(AdminOnly);
    public const string AdminOrStaff = nameof(AdminOrStaff);
    public const string TenantOnly = nameof(TenantOnly);
}
