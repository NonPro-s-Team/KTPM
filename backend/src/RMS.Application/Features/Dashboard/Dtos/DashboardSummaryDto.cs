namespace RMS.Application.Features.Dashboard.Dtos;

public class DashboardSummaryDto
{
    public int TotalRooms { get; set; }
    public int OccupiedRooms { get; set; }
    public int PendingRepairs { get; set; }
    public int UnpaidInvoices { get; set; }
}
