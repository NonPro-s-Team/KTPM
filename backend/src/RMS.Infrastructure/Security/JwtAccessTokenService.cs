using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Microsoft.Extensions.Options;
using Microsoft.IdentityModel.Tokens;
using RMS.Application.Common.Interfaces.Security;
using RMS.Application.Common.Interfaces.Services;
using RMS.Application.Common.Models;
using RMS.Domain.Entities;

namespace RMS.Infrastructure.Security;

public sealed class JwtAccessTokenService : IAccessTokenService
{
    private readonly JwtOptions _options;
    private readonly IDateTimeProvider _dateTimeProvider;

    public JwtAccessTokenService(
        IOptions<JwtOptions> options,
        IDateTimeProvider dateTimeProvider)
    {
        _options = options.Value;
        _dateTimeProvider = dateTimeProvider;
    }

    public AccessTokenResult Generate(User user)
    {
        ArgumentNullException.ThrowIfNull(user);

        var now = _dateTimeProvider.UtcNow.ToUniversalTime();
        var expiresAt = now.AddMinutes(_options.ExpirationMinutes);
        var claims = new[]
        {
            new Claim(
                ClaimTypes.NameIdentifier,
                user.Id.ToString()),
            new Claim(ClaimTypes.Name, user.Username),
            new Claim(ClaimTypes.Role, user.Role.ToString()),
            new Claim(
                JwtRegisteredClaimNames.Sub,
                user.Id.ToString()),
            new Claim(
                JwtRegisteredClaimNames.Jti,
                Guid.NewGuid().ToString()),
            new Claim(
                JwtRegisteredClaimNames.Iat,
                EpochTime.GetIntDate(now.UtcDateTime).ToString(),
                ClaimValueTypes.Integer64)
        };
        var key = new SymmetricSecurityKey(
            Encoding.UTF8.GetBytes(_options.Key));
        var credentials = new SigningCredentials(
            key,
            SecurityAlgorithms.HmacSha256);
        var token = new JwtSecurityToken(
            issuer: _options.Issuer,
            audience: _options.Audience,
            claims: claims,
            notBefore: now.UtcDateTime,
            expires: expiresAt.UtcDateTime,
            signingCredentials: credentials);
        var tokenHandler = new JwtSecurityTokenHandler();
        tokenHandler.OutboundClaimTypeMap.Clear();
        var encodedToken = tokenHandler.WriteToken(token);

        return new AccessTokenResult(
            encodedToken,
            expiresAt,
            user.Id,
            user.Username,
            user.Role);
    }
}
