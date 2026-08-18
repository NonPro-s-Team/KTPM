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

public enum AcceptInviteStatus
{
    Success,
    NotFound,
    InvalidOrExpired
}

public record AcceptInviteResult(AcceptInviteStatus Status, AcceptInviteResponse? Response);

public class AccountService
{
    private static readonly TimeSpan ResetTokenLifetime = TimeSpan.FromMinutes(45);

    private readonly AppDbContext _db;
    private readonly JwtOptions _jwtOptions;
    private readonly InviteOptions _inviteOptions;

    public AccountService(AppDbContext db, IOptions<JwtOptions> jwtOptions, IOptions<InviteOptions> inviteOptions)
    {
        _db = db;
        _jwtOptions = jwtOptions.Value;
        _inviteOptions = inviteOptions.Value;
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

    public async Task<InviteUserResponse?> InviteAsync(InviteUserRequest request, Guid invitedByAccountId)
    {
        var emailHasAccount = await _db.Accounts.AnyAsync(a => a.Email == request.Email);
        if (emailHasAccount)
        {
            return null;
        }

        var now = DateTimeOffset.UtcNow;

        var invitation = await _db.Invitations.SingleOrDefaultAsync(i =>
            i.Email == request.Email && i.Status == InvitationStatus.Pending);

        if (invitation is not null && invitation.ExpiresAt <= now)
        {
            invitation.Status = InvitationStatus.Expired;
            invitation = null;
        }

        var rawToken = GenerateRawToken();
        var expiresAt = now.AddHours(_inviteOptions.ExpirationHours);

        if (invitation is not null)
        {
            invitation.Role = request.Role;
            invitation.TokenHash = HashToken(rawToken);
            invitation.ExpiresAt = expiresAt;
        }
        else
        {
            invitation = new Invitation
            {
                Id = Guid.NewGuid(),
                Email = request.Email,
                Role = request.Role,
                TokenHash = HashToken(rawToken),
                Status = InvitationStatus.Pending,
                InvitedByAccountId = invitedByAccountId,
                ExpiresAt = expiresAt,
                CreatedAt = now
            };
            _db.Invitations.Add(invitation);
        }

        await _db.SaveChangesAsync();

        // TODO: local/dev only — once a real email service is wired up (post-deploy), send the
        // invite link via email instead of returning it directly in the response.
        var inviteLink = $"{_inviteOptions.FrontendBaseUrl}/accept-invite?token={rawToken}";
        return new InviteUserResponse(invitation.Email, invitation.Role, inviteLink, invitation.ExpiresAt);
    }

    public async Task<AcceptInviteResult> AcceptInviteAsync(AcceptInviteRequest request)
    {
        var tokenHash = HashToken(request.Token);
        var now = DateTimeOffset.UtcNow;

        var invitation = await _db.Invitations.SingleOrDefaultAsync(i => i.TokenHash == tokenHash);
        if (invitation is null)
        {
            return new AcceptInviteResult(AcceptInviteStatus.NotFound, null);
        }

        if (invitation.Status != InvitationStatus.Pending || invitation.ExpiresAt <= now)
        {
            if (invitation.Status == InvitationStatus.Pending && invitation.ExpiresAt <= now)
            {
                invitation.Status = InvitationStatus.Expired;
                await _db.SaveChangesAsync();
            }

            return new AcceptInviteResult(AcceptInviteStatus.InvalidOrExpired, null);
        }

        var account = new Account
        {
            Id = Guid.NewGuid(),
            Email = invitation.Email,
            PasswordHash = BCrypt.Net.BCrypt.HashPassword(request.Password),
            Role = invitation.Role,
            IsActive = true,
            CreatedAt = now,
            UpdatedAt = now
        };
        _db.Accounts.Add(account);

        invitation.Status = InvitationStatus.Accepted;
        invitation.AcceptedAt = now;

        await _db.SaveChangesAsync();

        var expiresAt = now.AddMinutes(_jwtOptions.ExpiryMinutes);
        var token = CreateJwt(account, expiresAt);

        return new AcceptInviteResult(
            AcceptInviteStatus.Success,
            new AcceptInviteResponse(token, expiresAt, account.Email, account.Role));
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
