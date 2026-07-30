using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using RMS.Domain.Entities;

namespace RMS.Infrastructure.Data.Configurations;

public class TenantConfiguration : IEntityTypeConfiguration<Tenant>
{
    public void Configure(EntityTypeBuilder<Tenant> builder)
    {
        builder.ToTable("Tenants");

        builder.HasKey(tenant => tenant.Id);
        builder.Property(tenant => tenant.Id)
            .ValueGeneratedNever()
            .IsRequired();
        builder.Property(tenant => tenant.UserId)
            .IsRequired();
        builder.Property(tenant => tenant.FullName)
            .HasMaxLength(Tenant.FullNameMaxLength)
            .IsRequired();
        builder.Property(tenant => tenant.PhoneNumber)
            .HasMaxLength(Tenant.PhoneNumberMaxLength)
            .IsRequired();
        builder.Property(tenant => tenant.CitizenId)
            .HasMaxLength(Tenant.CitizenIdMaxLength)
            .IsRequired();
        builder.Property(tenant => tenant.CreatedAt)
            .HasColumnType("datetimeoffset")
            .IsRequired();
        builder.Property(tenant => tenant.UpdatedAt)
            .HasColumnType("datetimeoffset");
        builder.Property<byte[]>("RowVersion")
            .IsRowVersion()
            .IsConcurrencyToken()
            .IsRequired();

        builder.HasOne(tenant => tenant.User)
            .WithOne()
            .HasForeignKey<Tenant>(tenant => tenant.UserId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasIndex(tenant => tenant.UserId)
            .IsUnique()
            .HasDatabaseName("UX_Tenants_UserId");

        builder.Navigation(tenant => tenant.Contracts)
            .UsePropertyAccessMode(PropertyAccessMode.Field);
        builder.Navigation(tenant => tenant.MaintenanceRequests)
            .UsePropertyAccessMode(PropertyAccessMode.Field);
    }
}
