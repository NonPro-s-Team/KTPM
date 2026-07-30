using FluentAssertions;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using RMS.Application.Common.Interfaces.Persistence;
using RMS.Infrastructure;
using RMS.Infrastructure.Data;

namespace RMS.UnitTests.Infrastructure;

public sealed class DependencyInjectionTests
{
    [Fact]
    public void AddInfrastructure_UsesOneScopedContextForUnitOfWork()
    {
        var configuration = BuildConfiguration(
            new Dictionary<string, string?>
            {
                ["ConnectionStrings:DefaultConnection"] =
                    "Server=localhost;Database=RMS_DI;"
                    + "Integrated Security=True;TrustServerCertificate=True",
                ["Jwt:Issuer"] = "RMS.Tests",
                ["Jwt:Audience"] = "RMS.Client.Tests",
                ["Jwt:Key"] =
                    "A-development-test-key-with-at-least-32-bytes",
                ["Jwt:ExpirationMinutes"] = "60"
            });
        var services = new ServiceCollection();
        services.AddInfrastructure(configuration);
        using var provider = services.BuildServiceProvider();
        using var scope = provider.CreateScope();

        var context = scope.ServiceProvider
            .GetRequiredService<AppDbContext>();
        var unitOfWork = scope.ServiceProvider
            .GetRequiredService<IUnitOfWork>();

        unitOfWork.Should().BeSameAs(context);
        scope.ServiceProvider.GetRequiredService<IUserRepository>()
            .Should()
            .NotBeNull();
        scope.ServiceProvider
            .GetRequiredService<IRentalContractRepository>()
            .Should()
            .NotBeNull();
        scope.ServiceProvider
            .GetRequiredService<IDashboardReadRepository>()
            .Should()
            .NotBeNull();
    }

    [Fact]
    public void AddInfrastructure_MissingConnectionString_FailsFast()
    {
        var services = new ServiceCollection();
        var action = () => services.AddInfrastructure(
            BuildConfiguration(new Dictionary<string, string?>()));

        action.Should()
            .Throw<InvalidOperationException>()
            .WithMessage("*ConnectionStrings:DefaultConnection*");
    }

    private static IConfiguration BuildConfiguration(
        IDictionary<string, string?> values) =>
        new ConfigurationBuilder()
            .AddInMemoryCollection(values)
            .Build();
}
