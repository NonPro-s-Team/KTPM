namespace RMS.API.Extensions;

public static class ServiceCollectionExtensions
{
    public static IServiceCollection AddApiServices(
        this IServiceCollection services,
        IConfiguration configuration,
        IHostEnvironment environment)
    {
        services.AddApiControllers();
        services.AddApiAuthentication();
        services.AddApiAuthorization();
        services.AddApiCors(configuration, environment);
        services.AddApiOpenApi();
        services.AddApiHealthChecks();

        return services;
    }
}
