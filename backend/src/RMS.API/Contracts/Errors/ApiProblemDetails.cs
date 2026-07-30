using System.Diagnostics;
using Microsoft.AspNetCore.Mvc;

namespace RMS.API.Contracts.Errors;

public static class ApiProblemDetails
{
    public const string ContentType = "application/problem+json";

    public static ProblemDetails Create(
        HttpContext context,
        int statusCode,
        string title,
        string detail,
        string code)
    {
        var problemDetails = new ProblemDetails
        {
            Type = $"https://httpstatuses.com/{statusCode}",
            Title = title,
            Status = statusCode,
            Detail = detail,
            Instance = context.Request.Path
        };

        AddExtensions(context, problemDetails, code);
        return problemDetails;
    }

    public static ValidationProblemDetails CreateValidation(
        HttpContext context,
        IDictionary<string, string[]> errors)
    {
        var problemDetails = new ValidationProblemDetails(errors)
        {
            Type = $"https://httpstatuses.com/{StatusCodes.Status400BadRequest}",
            Title = "Validation failed",
            Status = StatusCodes.Status400BadRequest,
            Detail = "One or more validation errors occurred.",
            Instance = context.Request.Path
        };

        AddExtensions(context, problemDetails, "VALIDATION_ERROR");
        return problemDetails;
    }

    public static async Task WriteAsync(
        HttpContext context,
        int statusCode,
        string title,
        string detail,
        string code)
    {
        context.Response.Clear();
        context.Response.StatusCode = statusCode;
        context.Response.ContentType = ContentType;

        var service = context.RequestServices
            .GetRequiredService<IProblemDetailsService>();

        await service.WriteAsync(new ProblemDetailsContext
        {
            HttpContext = context,
            ProblemDetails = Create(
                context,
                statusCode,
                title,
                detail,
                code)
        });
    }

    private static void AddExtensions(
        HttpContext context,
        ProblemDetails problemDetails,
        string code)
    {
        problemDetails.Extensions["code"] = code;
        problemDetails.Extensions["traceId"] =
            Activity.Current?.Id ?? context.TraceIdentifier;
    }
}
