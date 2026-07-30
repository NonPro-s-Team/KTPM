using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Hosting;

namespace RMS.Infrastructure.Data.Initialization;

public sealed class DatabaseInitializer
{
    private readonly AppDbContext _dbContext;
    private readonly DevelopmentDataSeeder _seeder;
    private readonly IHostEnvironment _environment;

    public DatabaseInitializer(
        AppDbContext dbContext,
        DevelopmentDataSeeder seeder,
        IHostEnvironment environment)
    {
        _dbContext = dbContext;
        _seeder = seeder;
        _environment = environment;
    }

    public async Task InitializeDevelopmentAsync(
        CancellationToken cancellationToken = default)
    {
        if (!_environment.IsDevelopment())
        {
            throw new InvalidOperationException(
                "Development database initialization is available only "
                + "when the host environment is Development.");
        }

        await _dbContext.Database.MigrateAsync(cancellationToken);
        await _seeder.SeedAsync(cancellationToken);
    }
}
