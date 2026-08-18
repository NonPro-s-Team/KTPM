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
    public DbSet<Tenant> Tenants => Set<Tenant>();
    public DbSet<Invitation> Invitations => Set<Invitation>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<Account>(entity =>
        {
            entity.HasIndex(a => a.Email).IsUnique();
            entity.Property(a => a.Role).HasConversion<string>();
            entity.HasQueryFilter(a => !a.IsDeleted);
        });

        modelBuilder.Entity<PasswordResetToken>(entity =>
        {
            entity.HasIndex(t => t.TokenHash).IsUnique();
            entity.HasOne(t => t.Account)
                .WithMany(a => a.PasswordResetTokens)
                .HasForeignKey(t => t.AccountId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<Building>(entity =>
        {
            entity.HasQueryFilter(b => !b.IsDeleted);
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

            entity.HasQueryFilter(r => !r.IsDeleted);
        });

        modelBuilder.Entity<Tenant>(entity =>
        {
            entity.HasIndex(t => t.IdNumber).IsUnique();
            entity.Property(t => t.Gender).HasConversion<string>();
        });

        modelBuilder.Entity<Invitation>(entity =>
        {
            entity.HasIndex(i => i.TokenHash).IsUnique();
            entity.Property(i => i.Role).HasConversion<string>();
            entity.Property(i => i.Status).HasConversion<string>();

            // No navigation property either side, Restrict — deleting an Account shouldn't
            // cascade-delete the invitations it sent (same style as Room.BuildingId).
            entity.HasOne<Account>()
                .WithMany()
                .HasForeignKey(i => i.InvitedByAccountId)
                .OnDelete(DeleteBehavior.Restrict);

            entity.HasQueryFilter(i => !i.IsDeleted);
        });
    }
}
