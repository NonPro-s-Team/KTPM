using Microsoft.EntityFrameworkCore;
using RMS.Application.Common.Interfaces.Persistence;
using RMS.Domain.Enums;
using RMS.Infrastructure.Data;

namespace RMS.Infrastructure.Repositories;

public sealed class DashboardReadRepository : IDashboardReadRepository
{
    private readonly AppDbContext _dbContext;

    public DashboardReadRepository(AppDbContext dbContext)
    {
        _dbContext = dbContext;
    }

    public async Task<DashboardSummaryData> GetSummaryAsync(
        CancellationToken cancellationToken = default)
    {
        var totalRooms = await _dbContext.Rooms
            .AsNoTracking()
            .CountAsync(cancellationToken);
        var occupiedRooms = await _dbContext.Rooms
            .AsNoTracking()
            .CountAsync(
                room => room.Status == RoomStatus.Occupied,
                cancellationToken);
        var activeMaintenanceRequests =
            await _dbContext.MaintenanceRequests
                .AsNoTracking()
                .CountAsync(
                    request =>
                        request.Status == MaintenanceRequestStatus.Submitted
                        || request.Status
                            == MaintenanceRequestStatus.InProgress,
                    cancellationToken);
        var unpaidInvoices = await _dbContext.Invoices
            .AsNoTracking()
            .CountAsync(
                invoice =>
                    invoice.Status == InvoiceStatus.Issued
                    || invoice.Status == InvoiceStatus.PartiallyPaid
                    || invoice.Status == InvoiceStatus.Overdue,
                cancellationToken);

        return new DashboardSummaryData(
            totalRooms,
            occupiedRooms,
            activeMaintenanceRequests,
            unpaidInvoices);
    }
}
