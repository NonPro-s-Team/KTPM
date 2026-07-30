using Microsoft.EntityFrameworkCore;
using RMS.Application.Common.Interfaces.Persistence;
using RMS.Application.Common.Models;
using RMS.Domain.Entities;
using RMS.Domain.Enums;
using RMS.Infrastructure.Data;

namespace RMS.Infrastructure.Repositories;

public sealed class RentalContractRepository : IRentalContractRepository
{
    private readonly AppDbContext _dbContext;

    public RentalContractRepository(AppDbContext dbContext)
    {
        _dbContext = dbContext;
    }

    public Task<RentalContract?> GetByIdAsync(
        Guid contractId,
        CancellationToken cancellationToken = default) =>
        _dbContext.RentalContracts
            .Include(contract => contract.Room)
            .Include(contract => contract.Tenant)
                .ThenInclude(tenant => tenant.User)
            .SingleOrDefaultAsync(
                contract => contract.Id == contractId,
                cancellationToken);

    public async Task<PagedResult<RentalContract>> GetPagedAsync(
        PagedRequest request,
        ContractStatus? status,
        Guid? tenantId,
        CancellationToken cancellationToken = default)
    {
        ArgumentNullException.ThrowIfNull(request);

        IQueryable<RentalContract> query = _dbContext.RentalContracts
            .AsNoTracking()
            .Include(contract => contract.Room)
            .Include(contract => contract.Tenant);

        if (status.HasValue)
        {
            query = query.Where(contract => contract.Status == status.Value);
        }

        if (tenantId.HasValue)
        {
            query = query.Where(
                contract => contract.TenantId == tenantId.Value);
        }

        var totalCount = await query.CountAsync(cancellationToken);
        var contracts = await query
            .OrderByDescending(contract => contract.CreatedAt)
            .ThenBy(contract => contract.Id)
            .Skip((request.PageNumber - 1) * request.PageSize)
            .Take(request.PageSize)
            .ToListAsync(cancellationToken);

        return new PagedResult<RentalContract>(
            contracts,
            request.PageNumber,
            request.PageSize,
            totalCount);
    }

    public Task<bool> HasActiveContractForRoomAsync(
        Guid roomId,
        Guid? excludeContractId,
        CancellationToken cancellationToken = default) =>
        _dbContext.RentalContracts.AnyAsync(
            contract =>
                contract.RoomId == roomId
                && contract.Status == ContractStatus.Active
                && (!excludeContractId.HasValue
                    || contract.Id != excludeContractId.Value),
            cancellationToken);

    public Task<RentalContract?> GetActiveContractByTenantIdAsync(
        Guid tenantId,
        CancellationToken cancellationToken = default) =>
        _dbContext.RentalContracts
            .Include(contract => contract.Room)
            .SingleOrDefaultAsync(
                contract =>
                    contract.TenantId == tenantId
                    && contract.Status == ContractStatus.Active,
                cancellationToken);

    public void Add(RentalContract contract)
    {
        ArgumentNullException.ThrowIfNull(contract);
        _dbContext.RentalContracts.Add(contract);
    }
}
