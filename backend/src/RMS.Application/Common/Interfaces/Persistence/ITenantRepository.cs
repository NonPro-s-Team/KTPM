using RMS.Application.Common.Models;
using RMS.Domain.Entities;

namespace RMS.Application.Common.Interfaces.Persistence;

public interface ITenantRepository
{
    Task<Tenant?> GetByIdAsync(
        Guid tenantId,
        CancellationToken cancellationToken = default);

    Task<Tenant?> GetByUserIdAsync(
        Guid userId,
        CancellationToken cancellationToken = default);

    Task<PagedResult<Tenant>> GetPagedAsync(
        PagedRequest request,
        CancellationToken cancellationToken = default);

    void Add(Tenant tenant);
}
