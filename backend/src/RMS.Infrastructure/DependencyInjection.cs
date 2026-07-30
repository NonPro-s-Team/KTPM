using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Options;
using RMS.Application.Common.Interfaces.Persistence;
using RMS.Application.Common.Interfaces.Security;
using RMS.Application.Common.Interfaces.Services;
using RMS.Infrastructure.Data;
using RMS.Infrastructure.Data.Initialization;
using RMS.Infrastructure.Repositories;
using RMS.Infrastructure.Security;
using RMS.Infrastructure.Services;

namespace RMS.Infrastructure;

public static class DependencyInjection
{
    public static IServiceCollection AddInfrastructure(
        this IServiceCollection services,
        IConfiguration configuration)
    {
        var connectionString =
            configuration.GetConnectionString("DefaultConnection");
        if (string.IsNullOrWhiteSpace(connectionString))
        {
            throw new InvalidOperationException(
                "ConnectionStrings:DefaultConnection is required. "
                + "Set ConnectionStrings__DefaultConnection in the environment.");
        }

        services.AddDbContext<AppDbContext>(options =>
            options.UseSqlServer(connectionString));
        services.AddScoped<IUnitOfWork>(provider =>
            provider.GetRequiredService<AppDbContext>());

        services.AddScoped<IUserRepository, UserRepository>();
        services.AddScoped<ITenantRepository, TenantRepository>();
        services.AddScoped<IRoomRepository, RoomRepository>();
        services.AddScoped<
            IRentalContractRepository,
            RentalContractRepository>();
        services.AddScoped<IInvoiceRepository, InvoiceRepository>();
        services.AddScoped<
            IMaintenanceRequestRepository,
            MaintenanceRequestRepository>();
        services.AddScoped<
            IDashboardReadRepository,
            DashboardReadRepository>();

        services.AddSingleton<IPasswordHasher, PasswordHasher>();
        services.AddScoped<IAccessTokenService, JwtAccessTokenService>();
        services.AddSingleton<IDateTimeProvider, DateTimeProvider>();
        services.AddScoped<ICurrentUserService, CurrentUserService>();
        services.AddHttpContextAccessor();

        services.AddSingleton<IValidateOptions<JwtOptions>, JwtOptionsValidator>();
        services.AddOptions<JwtOptions>()
            .Bind(configuration.GetSection(JwtOptions.SectionName))
            .ValidateOnStart();
        services.AddOptions<SeedDataOptions>()
            .Bind(configuration.GetSection(SeedDataOptions.SectionName));
        services.AddScoped<DevelopmentDataSeeder>();
        services.AddScoped<DatabaseInitializer>();

        return services;
    }
}
