using System.Security.Claims;
using Microsoft.AspNetCore.Http;
using RMS.Application.Common.Interfaces.Security;
using RMS.Domain.Enums;

namespace RMS.Infrastructure.Services;

public class CurrentUserService : ICurrentUserService
{
    private readonly IHttpContextAccessor _httpContextAccessor;

    public CurrentUserService(IHttpContextAccessor httpContextAccessor)
    {
        _httpContextAccessor = httpContextAccessor;
    }

    public Guid UserId =>
        Guid.TryParse(_httpContextAccessor.HttpContext?.User?.FindFirstValue(ClaimTypes.NameIdentifier), out var id)
            ? id
            : Guid.Empty;

    public UserRole Role
    {
        get
        {
            var roleClaim = _httpContextAccessor.HttpContext?.User?
                .FindFirstValue(ClaimTypes.Role);

            return Enum.TryParse<UserRole>(
                roleClaim,
                ignoreCase: true,
                out var role)
                ? role
                : default;
        }
    }

    public bool IsAuthenticated =>
        _httpContextAccessor.HttpContext?.User?.Identity?.IsAuthenticated ?? false;
}
