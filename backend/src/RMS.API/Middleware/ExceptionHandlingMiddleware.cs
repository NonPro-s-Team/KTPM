using System.Net;
using System.Text.Json;
using RMS.Domain.Exceptions;

namespace RMS.API.Middleware;

public class ExceptionHandlingMiddleware
{
    private readonly RequestDelegate _next;
    private readonly ILogger<ExceptionHandlingMiddleware> _logger;

    public ExceptionHandlingMiddleware(RequestDelegate next, ILogger<ExceptionHandlingMiddleware> logger)
    {
        _next = next;
        _logger = logger;
    }

    public async Task InvokeAsync(HttpContext context)
    {
        try
        {
            await _next(context);
        }
        catch (BusinessRuleException ex)
        {
            _logger.LogWarning(ex, "Business rule violation: {RuleCode}", ex.RuleCode);
            context.Response.StatusCode = (int)HttpStatusCode.BadRequest;
            context.Response.ContentType = "application/json";

            var response = JsonSerializer.Serialize(new
            {
                ruleCode = ex.RuleCode,
                message = ex.Message
            });

            await context.Response.WriteAsync(response);
        }
        catch (DomainException ex)
        {
            _logger.LogWarning(ex, "Domain exception: {Message}", ex.Message);
            context.Response.StatusCode = (int)HttpStatusCode.BadRequest;
            context.Response.ContentType = "application/json";

            var response = JsonSerializer.Serialize(new
            {
                ruleCode = "DOMAIN_ERROR",
                message = ex.Message
            });

            await context.Response.WriteAsync(response);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Unhandled exception");
            context.Response.StatusCode = (int)HttpStatusCode.InternalServerError;
            context.Response.ContentType = "application/json";

            var response = JsonSerializer.Serialize(new
            {
                ruleCode = "INTERNAL_ERROR",
                message = "An unexpected error occurred."
            });

            await context.Response.WriteAsync(response);
        }
    }
}
