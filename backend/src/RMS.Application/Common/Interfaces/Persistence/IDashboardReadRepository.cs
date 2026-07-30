namespace RMS.Application.Common.Interfaces.Persistence;

public sealed record DashboardSummaryData(
    int TotalRooms,
    int OccupiedRooms,
    int ActiveMaintenanceRequests,
    int UnpaidInvoices);

public interface IDashboardReadRepository
{
    Task<DashboardSummaryData> GetSummaryAsync(
        CancellationToken cancellationToken = default);
}
