using Microsoft.AspNetCore.Diagnostics.HealthChecks;
using Microsoft.AspNetCore.Authorization;
using RMS.API.Health;

namespace RMS.API.Extensions;

public static class HealthCheckExtensions
{
    private const string ReadyTag = "ready";

    public static IServiceCollection AddApiHealthChecks(
        this IServiceCollection services)
    {
        services
            .AddHealthChecks()
            .AddCheck<DatabaseHealthCheck>(
                "database",
                tags: [ReadyTag]);

        return services;
    }

    public static WebApplication MapApiHealthChecks(
        this WebApplication app)
    {
        app.MapHealthChecks(
                "/health/live",
                new HealthCheckOptions
                {
                    Predicate = _ => false,
                    ResponseWriter = HealthCheckResponseWriter.WriteAsync
                })
            .AllowAnonymous();

        app.MapHealthChecks(
                "/health/ready",
                new HealthCheckOptions
                {
                    Predicate = registration =>
                        registration.Tags.Contains(ReadyTag),
                    ResponseWriter = HealthCheckResponseWriter.WriteAsync
                })
            .AllowAnonymous();

        return app;
    }
}
