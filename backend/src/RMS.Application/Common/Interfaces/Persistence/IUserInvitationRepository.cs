using RMS.Domain.Entities;

namespace RMS.Application.Common.Interfaces.Persistence;

public interface IUserInvitationRepository
{
    Task<UserInvitation?> GetByTokenHashAsync(
        string tokenHash,
        CancellationToken cancellationToken = default);

    Task<IReadOnlyList<UserInvitation>> GetActiveByEmailAsync(
        string email,
        CancellationToken cancellationToken = default);

    void Add(UserInvitation invitation);
}
