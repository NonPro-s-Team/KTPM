using Microsoft.EntityFrameworkCore;
using RMS.Application.Common.Interfaces.Persistence;
using RMS.Domain.Entities;
using RMS.Infrastructure.Data;

namespace RMS.Infrastructure.Repositories;

public sealed class PasswordResetTokenRepository : IPasswordResetTokenRepository
{
    private readonly AppDbContext _dbContext;

    public PasswordResetTokenRepository(AppDbContext dbContext)
    {
        _dbContext = dbContext;
    }

    public Task<PasswordResetToken?> GetByTokenHashAsync(
        string tokenHash,
        CancellationToken cancellationToken = default) =>
        _dbContext.PasswordResetTokens.SingleOrDefaultAsync(
            token => token.TokenHash == tokenHash,
            cancellationToken);

    public async Task<IReadOnlyList<PasswordResetToken>> GetActiveByUserIdAsync(
        Guid userId,
        CancellationToken cancellationToken = default)
    {
        return await _dbContext.PasswordResetTokens
            .Where(token =>
                token.UserId == userId
                && token.UsedAt == null
                && token.InvalidatedAt == null)
            .ToListAsync(cancellationToken);
    }

    public void Add(PasswordResetToken token)
    {
        ArgumentNullException.ThrowIfNull(token);
        _dbContext.PasswordResetTokens.Add(token);
    }
}
