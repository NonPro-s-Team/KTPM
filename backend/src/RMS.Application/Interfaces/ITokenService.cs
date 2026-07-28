using System.Security.Claims;
using RMS.Domain.Entities;

namespace RMS.Application.Interfaces;

public interface ITokenService
{
    string GenerateToken(User user);
    ClaimsPrincipal? ValidateToken(string token);
}
