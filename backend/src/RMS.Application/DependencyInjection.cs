using Microsoft.Extensions.DependencyInjection;
using RMS.Application.Auth;
using RMS.Application.Contracts;
using RMS.Application.Dashboard;
using RMS.Application.Invoices;
using RMS.Application.MaintenanceRequests;
using RMS.Application.Rooms;
using RMS.Application.Tenants;

namespace RMS.Application;

public static class DependencyInjection
{
    public static IServiceCollection AddApplication(this IServiceCollection services)
    {
        services.AddScoped<IAuthService, AuthService>();
        services.AddScoped<ITenantService, TenantService>();
        services.AddScoped<IRoomService, RoomService>();
        services.AddScoped<IRentalContractService, RentalContractService>();
        services.AddScoped<IInvoiceService, InvoiceService>();
        services.AddScoped<IMaintenanceRequestService, MaintenanceRequestService>();
        services.AddScoped<IDashboardService, DashboardService>();

        return services;
    }
}
