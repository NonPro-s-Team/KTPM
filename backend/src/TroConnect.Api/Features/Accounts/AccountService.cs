using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;
using Microsoft.IdentityModel.Tokens;
using TroConnect.Api.Common;
using TroConnect.Api.Data;
using TroConnect.Api.Data.Entities;

namespace TroConnect.Api.Features.Accounts;

public class AccountService
{
    private static readonly TimeSpan ResetTokenLifetime = TimeSpan.FromMinutes(45);

    private readonly AppDbContext _db;
    private readonly JwtOptions _jwtOptions;

    public AccountService(AppDbContext db, IOptions<JwtOptions> jwtOptions)
    {
        _db = db;
        _jwtOptions = jwtOptions.Value;
    }

    public async Task<RegisterResponse?> RegisterAsync(RegisterRequest request)
    {
        var emailExists = await _db.Accounts.AnyAsync(a => a.Email == request.Email);
        if (emailExists)
        {
            return null;
        }

        var account = new Account
        {
            Id = Guid.NewGuid(),
            Email = request.Email,
            PasswordHash = BCrypt.Net.BCrypt.HashPassword(request.Password),
            Role = request.Role,
            IsActive = true,
            CreatedAt = DateTimeOffset.UtcNow,
            UpdatedAt = DateTimeOffset.UtcNow
        };

        _db.Accounts.Add(account);
        await _db.SaveChangesAsync();

        return new RegisterResponse(account.Id, account.Email, account.Role);
    }

    public async Task<LoginResponse?> LoginAsync(LoginRequest request)
    {
        var account = await _db.Accounts.SingleOrDefaultAsync(a => a.Email == request.Email);

        // Same generic failure whether the email doesn't exist or the password is wrong —
        // never let the caller tell the two apart (see docs/authentication.md).
        if (account is null || !account.IsActive || !BCrypt.Net.BCrypt.Verify(request.Password, account.PasswordHash))
        {
            return null;
        }

        var expiresAt = DateTimeOffset.UtcNow.AddMinutes(_jwtOptions.ExpiryMinutes);
        var token = CreateJwt(account, expiresAt);
        return new LoginResponse(token, expiresAt);
    }

    public async Task<string?> ForgotPasswordAsync(ForgotPasswordRequest request)
    {
        var account = await _db.Accounts.SingleOrDefaultAsync(a => a.Email == request.Email);
        if (account is null || !account.IsActive)
        {
            return null;
        }

        var rawToken = GenerateRawToken();

        _db.PasswordResetTokens.Add(new PasswordResetToken
        {
            Id = Guid.NewGuid(),
            AccountId = account.Id,
            TokenHash = HashToken(rawToken),
            ExpiresAt = DateTimeOffset.UtcNow.Add(ResetTokenLifetime),
            CreatedAt = DateTimeOffset.UtcNow
        });
        await _db.SaveChangesAsync();

        return rawToken;
    }

    public async Task<bool> ResetPasswordAsync(ResetPasswordRequest request)
    {
        var tokenHash = HashToken(request.Token);
        var now = DateTimeOffset.UtcNow;

        var resetToken = await _db.PasswordResetTokens
            .Include(t => t.Account)
            .SingleOrDefaultAsync(t => t.TokenHash == tokenHash);

        if (resetToken is null || resetToken.UsedAt is not null || resetToken.ExpiresAt <= now)
        {
            return false;
        }

        resetToken.Account.PasswordHash = BCrypt.Net.BCrypt.HashPassword(request.NewPassword);
        resetToken.Account.UpdatedAt = now;
        resetToken.UsedAt = now;

        await _db.SaveChangesAsync();
        return true;
    }

    private string CreateJwt(Account account, DateTimeOffset expiresAt)
    {
        var claims = new[]
        {
            new Claim(JwtRegisteredClaimNames.Sub, account.Id.ToString()),
            new Claim(JwtRegisteredClaimNames.Email, account.Email),
            new Claim(ClaimTypes.Role, account.Role.ToString())
        };

        var signingKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_jwtOptions.Secret));
        var credentials = new SigningCredentials(signingKey, SecurityAlgorithms.HmacSha256);

        var token = new JwtSecurityToken(
            issuer: _jwtOptions.Issuer,
            audience: _jwtOptions.Audience,
            claims: claims,
            expires: expiresAt.UtcDateTime,
            signingCredentials: credentials);

        return new JwtSecurityTokenHandler().WriteToken(token);
    }

    private static string GenerateRawToken() =>
        Convert.ToBase64String(RandomNumberGenerator.GetBytes(32));

    private static string HashToken(string rawToken) =>
        Convert.ToBase64String(SHA256.HashData(Encoding.UTF8.GetBytes(rawToken)));
}
