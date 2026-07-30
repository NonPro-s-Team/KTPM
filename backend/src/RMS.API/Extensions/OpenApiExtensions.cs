using System.Reflection;
using Microsoft.OpenApi;
using RMS.API.OpenApi;

namespace RMS.API.Extensions;

public static class OpenApiExtensions
{
    public static IServiceCollection AddApiOpenApi(
        this IServiceCollection services)
    {
        services.AddEndpointsApiExplorer();
        services.AddSwaggerGen(options =>
        {
            options.SwaggerDoc(
                "v1",
                new OpenApiInfo
                {
                    Title = "RMS API",
                    Version = "v1",
                    Description =
                        "Rental Management System API for the "
                        + "Software Testing course project."
                });

            options.AddSecurityDefinition(
                SwaggerSecurityRequirementsOperationFilter.SchemeName,
                new OpenApiSecurityScheme
                {
                    Type = SecuritySchemeType.Http,
                    Scheme = "bearer",
                    BearerFormat = "JWT",
                    Description =
                        "Enter a JWT access token using: Bearer {token}."
                });

            options.OperationFilter<
                SwaggerSecurityRequirementsOperationFilter>();

            var xmlFile =
                $"{Assembly.GetExecutingAssembly().GetName().Name}.xml";
            options.IncludeXmlComments(
                Path.Combine(AppContext.BaseDirectory, xmlFile));
        });

        return services;
    }
}
