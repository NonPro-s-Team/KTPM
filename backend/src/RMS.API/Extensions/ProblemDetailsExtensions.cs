using Microsoft.AspNetCore.WebUtilities;
using RMS.API.Contracts.Errors;
using RMS.Application.Common.Exceptions;

namespace RMS.API.Extensions;

public static class ProblemDetailsExtensions
{
    public static IApplicationBuilder UseApiStatusCodePages(
        this IApplicationBuilder app)
    {
        return app.UseStatusCodePages(async statusCodeContext =>
        {
            var context = statusCodeContext.HttpContext;
            var statusCode = context.Response.StatusCode;

            await ApiProblemDetails.WriteAsync(
                context,
                statusCode,
                ReasonPhrases.GetReasonPhrase(statusCode),
                GetDetail(statusCode),
                GetCode(statusCode));
        });
    }

    private static string GetDetail(int statusCode) =>
        statusCode switch
        {
            StatusCodes.Status404NotFound =>
                "The requested endpoint was not found.",
            StatusCodes.Status405MethodNotAllowed =>
                "The HTTP method is not allowed for this endpoint.",
            _ => "The request could not be completed."
        };

    private static string GetCode(int statusCode) =>
        statusCode switch
        {
            StatusCodes.Status401Unauthorized =>
                ApplicationErrorCodes.Unauthenticated,
            StatusCodes.Status403Forbidden =>
                ApplicationErrorCodes.Forbidden,
            StatusCodes.Status404NotFound =>
                ApplicationErrorCodes.NotFound,
            _ => $"HTTP_{statusCode}"
        };
}
