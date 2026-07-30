using RMS.Domain.Enums;

namespace RMS.API.Authorization;

public static class RoleNames
{
    public const string Admin = nameof(UserRole.Admin);
    public const string Staff = nameof(UserRole.Staff);
    public const string Tenant = nameof(UserRole.Tenant);
}
