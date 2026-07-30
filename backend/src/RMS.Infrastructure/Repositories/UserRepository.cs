using Microsoft.EntityFrameworkCore;
using RMS.Application.Common.Interfaces.Persistence;
using RMS.Domain.Entities;
using RMS.Infrastructure.Data;

namespace RMS.Infrastructure.Repositories;

public sealed class UserRepository : IUserRepository
{
    private readonly AppDbContext _dbContext;

    public UserRepository(AppDbContext dbContext)
    {
        _dbContext = dbContext;
    }

    public Task<User?> GetByIdAsync(
        Guid userId,
        CancellationToken cancellationToken = default) =>
        _dbContext.Users.SingleOrDefaultAsync(
            user => user.Id == userId,
            cancellationToken);

    public Task<User?> GetByUsernameAsync(
        string username,
        CancellationToken cancellationToken = default)
    {
        var normalizedUsername = username.Trim();
        return _dbContext.Users.SingleOrDefaultAsync(
            user => user.Username == normalizedUsername,
            cancellationToken);
    }

    public Task<bool> UsernameExistsAsync(
        string username,
        Guid? excludeUserId,
        CancellationToken cancellationToken = default)
    {
        var normalizedUsername = username.Trim();
        return _dbContext.Users.AnyAsync(
            user =>
                user.Username == normalizedUsername
                && (!excludeUserId.HasValue || user.Id != excludeUserId.Value),
            cancellationToken);
    }

    public void Add(User user)
    {
        ArgumentNullException.ThrowIfNull(user);
        _dbContext.Users.Add(user);
    }
}
