using Microsoft.EntityFrameworkCore;
using RMS.Application.Common.Interfaces.Persistence;
using RMS.Application.Common.Models;
using RMS.Domain.Entities;
using RMS.Infrastructure.Data;

namespace RMS.Infrastructure.Repositories;

public sealed class TenantRepository : ITenantRepository
{
    private readonly AppDbContext _dbContext;

    public TenantRepository(AppDbContext dbContext)
    {
        _dbContext = dbContext;
    }

    public Task<Tenant?> GetByIdAsync(
        Guid tenantId,
        CancellationToken cancellationToken = default) =>
        _dbContext.Tenants
            .Include(tenant => tenant.User)
            .SingleOrDefaultAsync(
                tenant => tenant.Id == tenantId,
                cancellationToken);

    public Task<Tenant?> GetByUserIdAsync(
        Guid userId,
        CancellationToken cancellationToken = default) =>
        _dbContext.Tenants
            .Include(tenant => tenant.User)
            .SingleOrDefaultAsync(
                tenant => tenant.UserId == userId,
                cancellationToken);

    public async Task<PagedResult<Tenant>> GetPagedAsync(
        PagedRequest request,
        CancellationToken cancellationToken = default)
    {
        ArgumentNullException.ThrowIfNull(request);

        var query = _dbContext.Tenants
            .AsNoTracking()
            .Include(tenant => tenant.User);
        var totalCount = await query.CountAsync(cancellationToken);
        var tenants = await query
            .OrderByDescending(tenant => tenant.CreatedAt)
            .ThenBy(tenant => tenant.Id)
            .Skip((request.PageNumber - 1) * request.PageSize)
            .Take(request.PageSize)
            .ToListAsync(cancellationToken);

        return new PagedResult<Tenant>(
            tenants,
            request.PageNumber,
            request.PageSize,
            totalCount);
    }

    public void Add(Tenant tenant)
    {
        ArgumentNullException.ThrowIfNull(tenant);
        _dbContext.Tenants.Add(tenant);
    }
}
