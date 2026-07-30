using Microsoft.AspNetCore.Authorization;
using Microsoft.OpenApi;
using Swashbuckle.AspNetCore.SwaggerGen;

namespace RMS.API.OpenApi;

public sealed class SwaggerSecurityRequirementsOperationFilter
    : IOperationFilter
{
    public const string SchemeName = "bearer";

    public void Apply(
        OpenApiOperation operation,
        OperationFilterContext context)
    {
        var methodAllowsAnonymous = context.MethodInfo
            .GetCustomAttributes(true)
            .OfType<AllowAnonymousAttribute>()
            .Any();
        var controllerAllowsAnonymous = context.MethodInfo.DeclaringType?
            .GetCustomAttributes(true)
            .OfType<AllowAnonymousAttribute>()
            .Any() ?? false;

        if (methodAllowsAnonymous || controllerAllowsAnonymous)
        {
            return;
        }

        operation.Security ??= [];
        operation.Security.Add(new OpenApiSecurityRequirement
        {
            [new OpenApiSecuritySchemeReference(
                SchemeName,
                context.Document)] = []
        });
    }
}
