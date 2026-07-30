using System.Text.Json;
using RMS.API.Contracts.Errors;
using RMS.Application.Common.Exceptions;
using RMS.Domain.Exceptions;

namespace RMS.API.Middleware;

public sealed class ExceptionHandlingMiddleware
{
    private readonly RequestDelegate _next;
    private readonly ILogger<ExceptionHandlingMiddleware> _logger;

    public ExceptionHandlingMiddleware(
        RequestDelegate next,
        ILogger<ExceptionHandlingMiddleware> logger)
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
        catch (OperationCanceledException)
            when (context.RequestAborted.IsCancellationRequested)
        {
            _logger.LogInformation(
                "Request {TraceId} was cancelled by the client.",
                context.TraceIdentifier);
        }
        catch (Exception exception)
        {
            if (context.Response.HasStarted)
            {
                _logger.LogError(
                    exception,
                    "An exception occurred after the response started.");
                throw;
            }

            await HandleExceptionAsync(context, exception);
        }
    }

    private async Task HandleExceptionAsync(
        HttpContext context,
        Exception exception)
    {
        var mapping = MapException(exception);

        if (mapping.StatusCode >= StatusCodes.Status500InternalServerError)
        {
            _logger.LogError(
                exception,
                "Unhandled exception for request {TraceId}.",
                context.TraceIdentifier);
        }
        else
        {
            _logger.LogWarning(
                "Request {TraceId} failed with {StatusCode} and code {Code}: {Message}",
                context.TraceIdentifier,
                mapping.StatusCode,
                mapping.Code,
                exception.Message);
        }

        await ApiProblemDetails.WriteAsync(
            context,
            mapping.StatusCode,
            mapping.Title,
            mapping.Detail,
            mapping.Code);
    }

    private static ExceptionMapping MapException(Exception exception) =>
        exception switch
        {
            AuthenticationException applicationException => new(
                StatusCodes.Status401Unauthorized,
                "Unauthorized",
                applicationException.Message,
                applicationException.Code),
            ForbiddenAccessException applicationException => new(
                StatusCodes.Status403Forbidden,
                "Forbidden",
                applicationException.Message,
                applicationException.Code),
            NotFoundException applicationException => new(
                StatusCodes.Status404NotFound,
                "Not Found",
                applicationException.Message,
                applicationException.Code),
            ConflictException applicationException => new(
                StatusCodes.Status409Conflict,
                "Conflict",
                applicationException.Message,
                applicationException.Code),
            ValidationException applicationException => new(
                StatusCodes.Status400BadRequest,
                "Bad Request",
                applicationException.Message,
                applicationException.Code),
            BusinessRuleViolationException domainException => new(
                StatusCodes.Status400BadRequest,
                "Bad Request",
                domainException.Message,
                domainException.Code),
            BusinessRuleException domainException => new(
                StatusCodes.Status400BadRequest,
                "Bad Request",
                domainException.Message,
                domainException.RuleCode),
            DomainException domainException => new(
                StatusCodes.Status400BadRequest,
                "Bad Request",
                domainException.Message,
                domainException.Code),
            JsonException => new(
                StatusCodes.Status400BadRequest,
                "Bad Request",
                "The request contains malformed JSON.",
                ApplicationErrorCodes.Validation),
            BadHttpRequestException => new(
                StatusCodes.Status400BadRequest,
                "Bad Request",
                "The HTTP request is invalid.",
                ApplicationErrorCodes.Validation),
            _ => new(
                StatusCodes.Status500InternalServerError,
                "Internal Server Error",
                "An unexpected error occurred.",
                "INTERNAL_ERROR")
        };

    private sealed record ExceptionMapping(
        int StatusCode,
        string Title,
        string Detail,
        string Code);
}
