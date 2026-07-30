using RMS.Application.Dashboard.Models;

namespace RMS.Application.Dashboard;

public interface IDashboardService
{
    Task<DashboardSummaryResponse> GetSummaryAsync(
        CancellationToken cancellationToken = default);
}
