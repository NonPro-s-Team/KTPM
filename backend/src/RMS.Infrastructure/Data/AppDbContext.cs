using Microsoft.EntityFrameworkCore;
using RMS.Application.Common.Interfaces.Persistence;
using RMS.Domain.Entities;

namespace RMS.Infrastructure.Data;

public sealed class AppDbContext : DbContext, IUnitOfWork
{
    public AppDbContext(DbContextOptions<AppDbContext> options)
        : base(options)
    {
    }

    public DbSet<User> Users => Set<User>();
    public DbSet<Tenant> Tenants => Set<Tenant>();
    public DbSet<Room> Rooms => Set<Room>();
    public DbSet<RentalContract> RentalContracts => Set<RentalContract>();
    public DbSet<Invoice> Invoices => Set<Invoice>();
    public DbSet<Payment> Payments => Set<Payment>();
    public DbSet<MaintenanceRequest> MaintenanceRequests =>
        Set<MaintenanceRequest>();
    public DbSet<MaintenanceRequestUpdate> MaintenanceRequestUpdates =>
        Set<MaintenanceRequestUpdate>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.ApplyConfigurationsFromAssembly(typeof(AppDbContext).Assembly);
        base.OnModelCreating(modelBuilder);
    }

    public override async Task<int> SaveChangesAsync(
        CancellationToken cancellationToken = default)
    {
        try
        {
            return await base.SaveChangesAsync(cancellationToken);
        }
        catch (DbUpdateConcurrencyException exception)
        {
            throw PersistenceExceptionTranslator.Translate(exception);
        }
        catch (DbUpdateException exception)
        {
            var translated =
                PersistenceExceptionTranslator.TryTranslate(exception);
            if (translated is not null)
            {
                throw translated;
            }

            throw;
        }
    }
}
