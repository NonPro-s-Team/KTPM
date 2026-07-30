using RMS.Domain.Entities;

namespace RMS.Application.Common.Interfaces.Persistence;

public interface IUserRepository
{
    Task<User?> GetByIdAsync(
        Guid userId,
        CancellationToken cancellationToken = default);

    Task<User?> GetByUsernameAsync(
        string username,
        CancellationToken cancellationToken = default);

    Task<bool> UsernameExistsAsync(
        string username,
        Guid? excludeUserId,
        CancellationToken cancellationToken = default);

    void Add(User user);
}
