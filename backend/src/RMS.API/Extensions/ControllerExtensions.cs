using System.Text.Json;
using System.Text.Json.Serialization;
using Microsoft.AspNetCore.Mvc;
using RMS.API.Contracts.Errors;

namespace RMS.API.Extensions;

public static class ControllerExtensions
{
    public static IServiceCollection AddApiControllers(
        this IServiceCollection services)
    {
        services
            .AddControllers()
            .AddJsonOptions(options =>
            {
                options.JsonSerializerOptions.PropertyNamingPolicy =
                    JsonNamingPolicy.CamelCase;
                options.JsonSerializerOptions.DictionaryKeyPolicy =
                    JsonNamingPolicy.CamelCase;
                options.JsonSerializerOptions.IncludeFields = false;
                options.JsonSerializerOptions.Converters.Add(
                    new JsonStringEnumConverter(
                        JsonNamingPolicy.CamelCase));
            });

        services.Configure<ApiBehaviorOptions>(options =>
        {
            options.InvalidModelStateResponseFactory = actionContext =>
            {
                var errors = actionContext.ModelState
                    .Where(entry => entry.Value?.Errors.Count > 0)
                    .ToDictionary(
                        entry => ToCamelCasePath(entry.Key),
                        entry => entry.Value!.Errors
                            .Select(error =>
                                string.IsNullOrWhiteSpace(error.ErrorMessage)
                                    ? "The supplied value is invalid."
                                    : error.ErrorMessage)
                            .ToArray(),
                        StringComparer.Ordinal);

                var problemDetails = ApiProblemDetails.CreateValidation(
                    actionContext.HttpContext,
                    errors);
                var result = new BadRequestObjectResult(problemDetails);
                result.ContentTypes.Add(ApiProblemDetails.ContentType);
                return result;
            };
        });

        services.AddProblemDetails();
        return services;
    }

    private static string ToCamelCasePath(string path)
    {
        if (string.IsNullOrEmpty(path))
        {
            return "request";
        }

        var separatorIndex = path.IndexOfAny(['.', '[']);
        var firstSegment = separatorIndex < 0
            ? path
            : path[..separatorIndex];
        var suffix = separatorIndex < 0
            ? string.Empty
            : path[separatorIndex..];

        return JsonNamingPolicy.CamelCase.ConvertName(firstSegment) + suffix;
    }
}
