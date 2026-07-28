using System.Security.Claims;
using RMS.Application.Interfaces;
using RMS.Domain.Entities;

namespace RMS.Infrastructure.Services;

public class TokenService : ITokenService
{
    public string GenerateToken(User user)
    {
        // TODO: Implement JWT token generation
        throw new NotImplementedException();
    }

    public ClaimsPrincipal? ValidateToken(string token)
    {
        // TODO: Implement JWT token validation
        throw new NotImplementedException();
    }
}
