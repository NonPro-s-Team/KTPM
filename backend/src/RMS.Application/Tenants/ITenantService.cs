using RMS.Application.Common.Models;
using RMS.Application.Tenants.Models;

namespace RMS.Application.Tenants;

public interface ITenantService
{
    Task<TenantResponse> CreateTenantAsync(
        CreateTenantRequest request,
        CancellationToken cancellationToken = default);

    Task<TenantResponse> UpdateTenantAsync(
        Guid tenantId,
        UpdateTenantRequest request,
        CancellationToken cancellationToken = default);

    Task<TenantResponse> GetTenantByIdAsync(
        Guid tenantId,
        CancellationToken cancellationToken = default);

    Task<TenantResponse> GetCurrentTenantAsync(
        CancellationToken cancellationToken = default);

    Task<PagedResult<TenantResponse>> GetTenantsAsync(
        TenantFilterRequest request,
        CancellationToken cancellationToken = default);
}
