namespace RMS.Application.Dashboard.Models;

public sealed record DashboardSummaryResponse(
    int TotalRooms,
    int OccupiedRooms,
    int ActiveMaintenanceRequests,
    int UnpaidInvoices);
