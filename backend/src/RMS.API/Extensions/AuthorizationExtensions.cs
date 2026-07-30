using Microsoft.AspNetCore.Authorization;
using RMS.API.Authorization;

namespace RMS.API.Extensions;

public static class AuthorizationExtensions
{
    public static IServiceCollection AddApiAuthorization(
        this IServiceCollection services)
    {
        services.AddAuthorization(options =>
        {
            options.FallbackPolicy = new AuthorizationPolicyBuilder()
                .RequireAuthenticatedUser()
                .Build();

            options.AddPolicy(
                AuthorizationPolicies.AdminOnly,
                policy => policy.RequireRole(RoleNames.Admin));
            options.AddPolicy(
                AuthorizationPolicies.AdminOrStaff,
                policy => policy.RequireRole(
                    RoleNames.Admin,
                    RoleNames.Staff));
            options.AddPolicy(
                AuthorizationPolicies.TenantOnly,
                policy => policy.RequireRole(RoleNames.Tenant));
        });

        return services;
    }
}
