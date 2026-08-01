using RMS.API.Extensions;
using RMS.API.Middleware;
using RMS.Application;
using RMS.Infrastructure;
using RMS.Infrastructure.Data.Initialization;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddApplication();
builder.Services.AddInfrastructure(builder.Configuration, builder.Environment);
builder.Services.AddApiServices(
    builder.Configuration,
    builder.Environment);

var app = builder.Build();

if (args.Contains(
        "--seed-development-data",
        StringComparer.OrdinalIgnoreCase))
{
    await using var scope = app.Services.CreateAsyncScope();
    var initializer =
        scope.ServiceProvider.GetRequiredService<DatabaseInitializer>();
    await initializer.SeedDevelopmentDataAsync();
    return;
}

app.UseMiddleware<ExceptionHandlingMiddleware>();
app.UseApiStatusCodePages();

var swaggerEnabled =
    app.Environment.IsDevelopment()
    || app.Configuration.GetValue<bool>("Swagger:Enabled");

if (swaggerEnabled)
{
    app.UseSwagger();

    app.UseSwaggerUI(options =>
    {
        options.SwaggerEndpoint(
            "/swagger/v1/swagger.json",
            "RMS API v1");

        options.DocumentTitle = "RMS API";
    });
}

if (!app.Environment.IsDevelopment())
{
    app.UseHsts();
}

app.UseHttpsRedirection();

app.UseCors(CorsExtensions.FrontendPolicy);

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();
app.MapApiHealthChecks();

app.Run();

public partial class Program { }
