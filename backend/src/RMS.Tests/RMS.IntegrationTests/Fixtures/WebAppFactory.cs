using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.DependencyInjection.Extensions;
using RMS.Application.Auth;
using RMS.Application.Contracts;
using RMS.Application.Dashboard;
using RMS.Application.Invoices;
using RMS.Application.MaintenanceRequests;
using RMS.Application.Rooms;
using RMS.Application.Tenants;
using RMS.Infrastructure.Data;

namespace RMS.IntegrationTests.Fixtures;

public class WebAppFactory : WebApplicationFactory<Program>
{
    protected override void ConfigureWebHost(IWebHostBuilder builder)
    {
        builder.ConfigureServices(services =>
        {
            // Infrastructure implementations for the new Application contracts
            // are intentionally deferred to the next task. The existing smoke
            // placeholders do not exercise Application services.
            services.RemoveAll<IAuthService>();
            services.RemoveAll<ITenantService>();
            services.RemoveAll<IRoomService>();
            services.RemoveAll<IRentalContractService>();
            services.RemoveAll<IInvoiceService>();
            services.RemoveAll<IMaintenanceRequestService>();
            services.RemoveAll<IDashboardService>();

            // Remove the existing DbContext registration
            var descriptor = services.SingleOrDefault(
                d => d.ServiceType == typeof(DbContextOptions<AppDbContext>));

            if (descriptor != null)
            {
                services.Remove(descriptor);
            }

            // Add in-memory database for testing
            services.AddDbContext<AppDbContext>(options =>
            {
                options.UseInMemoryDatabase("RMS_TestDb");
            });
        });
    }
}
