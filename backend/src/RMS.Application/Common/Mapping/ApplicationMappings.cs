using RMS.Application.Contracts.Models;
using RMS.Application.Invoices.Models;
using RMS.Application.MaintenanceRequests.Models;
using RMS.Application.Rooms.Models;
using RMS.Application.Tenants.Models;
using RMS.Domain.Entities;

namespace RMS.Application.Common.Mapping;

public static class ApplicationMappings
{
    public static TenantResponse ToResponse(
        this Tenant tenant,
        string? username = null)
    {
        ArgumentNullException.ThrowIfNull(tenant);

        return new TenantResponse(
            tenant.Id,
            tenant.UserId,
            username ?? tenant.User?.Username ?? string.Empty,
            tenant.FullName,
            tenant.PhoneNumber,
            tenant.CitizenId,
            tenant.CreatedAt,
            tenant.UpdatedAt);
    }

    public static RoomResponse ToResponse(this Room room)
    {
        ArgumentNullException.ThrowIfNull(room);

        return new RoomResponse(
            room.Id,
            room.RoomNumber,
            room.MonthlyRent,
            room.Description,
            room.Status,
            room.CreatedAt,
            room.UpdatedAt);
    }

    public static RentalContractResponse ToResponse(
        this RentalContract contract)
    {
        ArgumentNullException.ThrowIfNull(contract);

        return new RentalContractResponse(
            contract.Id,
            contract.RoomId,
            contract.Room?.RoomNumber,
            contract.TenantId,
            contract.Tenant?.FullName,
            contract.StartDate,
            contract.EndDate,
            contract.MonthlyRent,
            contract.Status,
            contract.ActivatedAt,
            contract.TerminatedAt,
            contract.CancelledAt,
            contract.CreatedAt,
            contract.UpdatedAt);
    }

    public static InvoiceResponse ToResponse(this Invoice invoice)
    {
        ArgumentNullException.ThrowIfNull(invoice);

        return new InvoiceResponse(
            invoice.Id,
            invoice.ContractId,
            invoice.BillingPeriod.Month,
            invoice.BillingPeriod.Year,
            invoice.RentAmount,
            invoice.ElectricityStartReading,
            invoice.ElectricityEndReading,
            invoice.WaterStartReading,
            invoice.WaterEndReading,
            invoice.ElectricityUnitPrice,
            invoice.WaterUnitPrice,
            invoice.ElectricityAmount,
            invoice.WaterAmount,
            invoice.TotalAmount,
            invoice.PaidAmount,
            invoice.GetOutstandingAmount(),
            invoice.Status,
            invoice.IssuedAt,
            invoice.PaidAt,
            invoice.CreatedAt);
    }

    public static PaymentResponse ToResponse(this Payment payment)
    {
        ArgumentNullException.ThrowIfNull(payment);

        return new PaymentResponse(
            payment.Id,
            payment.InvoiceId,
            payment.Amount,
            payment.Note,
            payment.RecordedByUserId,
            payment.PaidAt);
    }

    public static InvoiceDetailsResponse ToDetailsResponse(
        this Invoice invoice)
    {
        ArgumentNullException.ThrowIfNull(invoice);

        return new InvoiceDetailsResponse(
            invoice.ToResponse(),
            invoice.Payments
                .OrderBy(payment => payment.PaidAt)
                .Select(payment => payment.ToResponse())
                .ToArray());
    }

    public static MaintenanceRequestResponse ToResponse(
        this MaintenanceRequest request)
    {
        ArgumentNullException.ThrowIfNull(request);

        return new MaintenanceRequestResponse(
            request.Id,
            request.TenantId,
            request.RoomId,
            request.Title,
            request.Description,
            request.Status,
            request.StartedAt,
            request.ResolvedAt,
            request.ClosedAt,
            request.CreatedAt,
            request.Updates
                .OrderBy(update => update.OccurredAt)
                .Select(update => update.ToResponse())
                .ToArray());
    }

    public static MaintenanceUpdateResponse ToResponse(
        this MaintenanceRequestUpdate update)
    {
        ArgumentNullException.ThrowIfNull(update);

        return new MaintenanceUpdateResponse(
            update.PreviousStatus,
            update.NewStatus,
            update.Note,
            update.UpdatedByUserId,
            update.OccurredAt);
    }
}
