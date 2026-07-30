using RMS.Application.Common.Models;
using RMS.Application.MaintenanceRequests.Models;

namespace RMS.Application.MaintenanceRequests;

public interface IMaintenanceRequestService
{
    Task<MaintenanceRequestResponse> CreateAsync(
        CreateMaintenanceRequestRequest request,
        CancellationToken cancellationToken = default);

    Task<MaintenanceRequestResponse> StartProgressAsync(
        Guid requestId,
        StartMaintenanceRequestRequest request,
        CancellationToken cancellationToken = default);

    Task<MaintenanceRequestResponse> AddProgressNoteAsync(
        Guid requestId,
        AddMaintenanceProgressRequest request,
        CancellationToken cancellationToken = default);

    Task<MaintenanceRequestResponse> ResolveAsync(
        Guid requestId,
        ResolveMaintenanceRequestRequest request,
        CancellationToken cancellationToken = default);

    Task<MaintenanceRequestResponse> CloseAsync(
        Guid requestId,
        CloseMaintenanceRequestRequest request,
        CancellationToken cancellationToken = default);

    Task<MaintenanceRequestResponse> GetByIdAsync(
        Guid requestId,
        CancellationToken cancellationToken = default);

    Task<PagedResult<MaintenanceRequestResponse>> GetPagedAsync(
        MaintenanceRequestFilterRequest request,
        CancellationToken cancellationToken = default);
}
