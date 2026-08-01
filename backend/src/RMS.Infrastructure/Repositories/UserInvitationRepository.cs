using Microsoft.EntityFrameworkCore;
using RMS.Application.Common.Interfaces.Persistence;
using RMS.Domain.Entities;
using RMS.Infrastructure.Data;

namespace RMS.Infrastructure.Repositories;

public sealed class UserInvitationRepository : IUserInvitationRepository
{
    private readonly AppDbContext _dbContext;

    public UserInvitationRepository(AppDbContext dbContext)
    {
        _dbContext = dbContext;
    }

    public Task<UserInvitation?> GetByTokenHashAsync(
        string tokenHash,
        CancellationToken cancellationToken = default) =>
        _dbContext.UserInvitations.SingleOrDefaultAsync(
            invitation => invitation.TokenHash == tokenHash,
            cancellationToken);

    public async Task<IReadOnlyList<UserInvitation>> GetActiveByEmailAsync(
        string email,
        CancellationToken cancellationToken = default)
    {
        var normalizedEmail = email.Trim();
        return await _dbContext.UserInvitations
            .Where(invitation =>
                invitation.Email == normalizedEmail
                && invitation.AcceptedAt == null
                && invitation.RevokedAt == null)
            .ToListAsync(cancellationToken);
    }

    public void Add(UserInvitation invitation)
    {
        ArgumentNullException.ThrowIfNull(invitation);
        _dbContext.UserInvitations.Add(invitation);
    }
}
