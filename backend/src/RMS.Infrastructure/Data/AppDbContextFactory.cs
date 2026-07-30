using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Design;
using Microsoft.Extensions.Configuration;

namespace RMS.Infrastructure.Data;

public sealed class AppDbContextFactory :
    IDesignTimeDbContextFactory<AppDbContext>
{
    public AppDbContext CreateDbContext(string[] args)
    {
        var configurationBuilder = new ConfigurationBuilder()
            .AddEnvironmentVariables();

        foreach (var path in GetDevelopmentSettingsCandidates())
        {
            if (File.Exists(path))
            {
                configurationBuilder.AddJsonFile(
                    path,
                    optional: false,
                    reloadOnChange: false);
            }
        }

        configurationBuilder.AddEnvironmentVariables();
        var configuration = configurationBuilder.Build();
        var connectionString =
            configuration.GetConnectionString("DefaultConnection");
        if (string.IsNullOrWhiteSpace(connectionString))
        {
            throw new InvalidOperationException(
                "ConnectionStrings:DefaultConnection is required for EF tooling. "
                + "Set ConnectionStrings__DefaultConnection in the environment.");
        }

        var options = new DbContextOptionsBuilder<AppDbContext>()
            .UseSqlServer(connectionString)
            .Options;
        return new AppDbContext(options);
    }

    private static IEnumerable<string> GetDevelopmentSettingsCandidates()
    {
        var currentDirectory = Directory.GetCurrentDirectory();
        yield return Path.Combine(
            currentDirectory,
            "backend",
            "src",
            "RMS.API",
            "appsettings.Development.json");
        yield return Path.Combine(
            currentDirectory,
            "src",
            "RMS.API",
            "appsettings.Development.json");
        yield return Path.Combine(
            currentDirectory,
            "..",
            "RMS.API",
            "appsettings.Development.json");
    }
}
