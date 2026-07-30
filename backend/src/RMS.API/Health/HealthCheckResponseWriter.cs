using System.Text.Json;
using Microsoft.Extensions.Diagnostics.HealthChecks;

namespace RMS.API.Health;

public static class HealthCheckResponseWriter
{
    private static readonly JsonSerializerOptions SerializerOptions = new()
    {
        PropertyNamingPolicy = JsonNamingPolicy.CamelCase
    };

    public static Task WriteAsync(
        HttpContext context,
        HealthReport report)
    {
        context.Response.ContentType = "application/json";

        var response = new
        {
            status = report.Status.ToString(),
            checks = report.Entries.Select(entry => new
            {
                name = entry.Key,
                status = entry.Value.Status.ToString()
            })
        };

        return context.Response.WriteAsJsonAsync(
            response,
            SerializerOptions,
            context.RequestAborted);
    }
}
