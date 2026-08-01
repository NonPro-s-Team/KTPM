using RMS.Domain.Entities;

namespace RMS.Application.Common.Interfaces.Persistence;

public interface IPasswordResetTokenRepository
{
    Task<PasswordResetToken?> GetByTokenHashAsync(
        string tokenHash,
        CancellationToken cancellationToken = default);

    Task<IReadOnlyList<PasswordResetToken>> GetActiveByUserIdAsync(
        Guid userId,
        CancellationToken cancellationToken = default);

    void Add(PasswordResetToken token);
}
