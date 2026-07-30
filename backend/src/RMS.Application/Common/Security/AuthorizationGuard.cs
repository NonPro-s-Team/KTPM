using RMS.Application.Common.Exceptions;
using RMS.Application.Common.Interfaces.Security;
using RMS.Domain.Enums;

namespace RMS.Application.Common.Security;

public static class AuthorizationGuard
{
    public static void EnsureAuthenticated(ICurrentUserService currentUser)
    {
        ArgumentNullException.ThrowIfNull(currentUser);

        if (!currentUser.IsAuthenticated
            || currentUser.UserId == Guid.Empty
            || !Enum.IsDefined(currentUser.Role))
        {
            throw new AuthenticationException(
                ApplicationErrorCodes.Unauthenticated,
                "The current user is not authenticated.");
        }
    }

    public static void EnsureAdmin(ICurrentUserService currentUser)
    {
        EnsureAuthenticated(currentUser);

        if (currentUser.Role != UserRole.Admin)
        {
            throw new ForbiddenAccessException(
                ApplicationErrorCodes.Forbidden,
                "Administrator access is required.");
        }
    }

    public static void EnsureAdminOrStaff(
        ICurrentUserService currentUser,
        string businessRuleCode = ApplicationErrorCodes.Forbidden)
    {
        EnsureAuthenticated(currentUser);

        if (currentUser.Role is not UserRole.Admin and not UserRole.Staff)
        {
            throw new ForbiddenAccessException(
                businessRuleCode,
                "Administrator or staff access is required.");
        }
    }

    public static void EnsureTenant(ICurrentUserService currentUser)
    {
        EnsureAuthenticated(currentUser);

        if (currentUser.Role != UserRole.Tenant)
        {
            throw new ForbiddenAccessException(
                ApplicationErrorCodes.Forbidden,
                "Tenant access is required.");
        }
    }

    public static void EnsureTenantOwnership(
        Guid resourceTenantId,
        Guid currentTenantId,
        string businessRuleCode)
    {
        if (resourceTenantId == Guid.Empty
            || currentTenantId == Guid.Empty
            || resourceTenantId != currentTenantId)
        {
            throw new ForbiddenAccessException(
                businessRuleCode,
                "Tenants may access only their own data.");
        }
    }
}
