using Microsoft.EntityFrameworkCore;
using TroConnect.Api.Data.Entities;

namespace TroConnect.Api.Data;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options)
    {
    }

    public DbSet<Account> Accounts => Set<Account>();
    public DbSet<PasswordResetToken> PasswordResetTokens => Set<PasswordResetToken>();
    public DbSet<Building> Buildings => Set<Building>();
    public DbSet<Room> Rooms => Set<Room>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<Account>(entity =>
        {
            entity.HasIndex(a => a.Email).IsUnique();
            entity.Property(a => a.Role).HasConversion<string>();
        });

        modelBuilder.Entity<PasswordResetToken>(entity =>
        {
            entity.HasIndex(t => t.TokenHash).IsUnique();
            entity.HasOne(t => t.Account)
                .WithMany(a => a.PasswordResetTokens)
                .HasForeignKey(t => t.AccountId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<Room>(entity =>
        {
            entity.Property(r => r.BasePrice).HasColumnType("numeric(14,2)");
            entity.Property(r => r.ServicePrice).HasColumnType("numeric(14,2)");
            entity.Property(r => r.SingleOccupantDiscountAmount).HasColumnType("numeric(14,2)");

            // No navigation properties either side — Building deletion-blocked-by-rooms and the room-count
            // cap are enforced explicitly in service code, so Restrict is just a DB-level backstop.
            entity.HasOne<Building>()
                .WithMany()
                .HasForeignKey(r => r.BuildingId)
                .OnDelete(DeleteBehavior.Restrict);
        });
    }
}
