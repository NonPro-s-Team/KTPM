using Microsoft.EntityFrameworkCore;
using RMS.Application.Common.Interfaces.Persistence;
using RMS.Application.Common.Models;
using RMS.Domain.Entities;
using RMS.Domain.Enums;
using RMS.Infrastructure.Data;

namespace RMS.Infrastructure.Repositories;

public sealed class MaintenanceRequestRepository :
    IMaintenanceRequestRepository
{
    private readonly AppDbContext _dbContext;

    public MaintenanceRequestRepository(AppDbContext dbContext)
    {
        _dbContext = dbContext;
    }

    public Task<MaintenanceRequest?> GetByIdAsync(
        Guid requestId,
        CancellationToken cancellationToken = default) =>
        _dbContext.MaintenanceRequests
            .Include(request => request.Tenant)
            .Include(request => request.Room)
            .Include(request => request.Updates
                .OrderBy(update => update.OccurredAt)
                .ThenBy(update => update.Id))
            .SingleOrDefaultAsync(
                request => request.Id == requestId,
                cancellationToken);

    public async Task<PagedResult<MaintenanceRequest>> GetPagedAsync(
        PagedRequest request,
        MaintenanceRequestStatus? status,
        Guid? tenantId,
        CancellationToken cancellationToken = default)
    {
        ArgumentNullException.ThrowIfNull(request);

        IQueryable<MaintenanceRequest> query =
            _dbContext.MaintenanceRequests
                .AsNoTracking()
                .Include(item => item.Tenant)
                .Include(item => item.Room);

        if (status.HasValue)
        {
            query = query.Where(item => item.Status == status.Value);
        }

        if (tenantId.HasValue)
        {
            query = query.Where(item => item.TenantId == tenantId.Value);
        }

        var totalCount = await query.CountAsync(cancellationToken);
        var requests = await query
            .OrderByDescending(item => item.CreatedAt)
            .ThenBy(item => item.Id)
            .Skip((request.PageNumber - 1) * request.PageSize)
            .Take(request.PageSize)
            .ToListAsync(cancellationToken);

        return new PagedResult<MaintenanceRequest>(
            requests,
            request.PageNumber,
            request.PageSize,
            totalCount);
    }

    public void Add(MaintenanceRequest request)
    {
        ArgumentNullException.ThrowIfNull(request);
        _dbContext.MaintenanceRequests.Add(request);
    }
}
