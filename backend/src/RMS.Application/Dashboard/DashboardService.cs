using RMS.Application.Common.Interfaces.Persistence;
using RMS.Application.Common.Interfaces.Security;
using RMS.Application.Common.Security;
using RMS.Application.Dashboard.Models;

namespace RMS.Application.Dashboard;

public sealed class DashboardService : IDashboardService
{
    private readonly IDashboardReadRepository _dashboardRepository;
    private readonly ICurrentUserService _currentUser;

    public DashboardService(
        IDashboardReadRepository dashboardRepository,
        ICurrentUserService currentUser)
    {
        _dashboardRepository = dashboardRepository;
        _currentUser = currentUser;
    }

    public async Task<DashboardSummaryResponse> GetSummaryAsync(
        CancellationToken cancellationToken = default)
    {
        AuthorizationGuard.EnsureAdminOrStaff(_currentUser);
        var summary = await _dashboardRepository.GetSummaryAsync(
            cancellationToken);

        return new DashboardSummaryResponse(
            summary.TotalRooms,
            summary.OccupiedRooms,
            summary.ActiveMaintenanceRequests,
            summary.UnpaidInvoices);
    }
}
