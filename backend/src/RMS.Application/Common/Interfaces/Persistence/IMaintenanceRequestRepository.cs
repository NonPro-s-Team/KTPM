using RMS.Application.Common.Models;
using RMS.Domain.Entities;
using RMS.Domain.Enums;

namespace RMS.Application.Common.Interfaces.Persistence;

public interface IMaintenanceRequestRepository
{
    Task<MaintenanceRequest?> GetByIdAsync(
        Guid requestId,
        CancellationToken cancellationToken = default);

    Task<PagedResult<MaintenanceRequest>> GetPagedAsync(
        PagedRequest request,
        MaintenanceRequestStatus? status,
        Guid? tenantId,
        CancellationToken cancellationToken = default);

    void Add(MaintenanceRequest request);
}
