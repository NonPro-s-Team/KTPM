using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using RMS.Domain.Entities;

namespace RMS.Infrastructure.Data.Configurations;

public sealed class MaintenanceRequestConfiguration :
    IEntityTypeConfiguration<MaintenanceRequest>
{
    public void Configure(EntityTypeBuilder<MaintenanceRequest> builder)
    {
        builder.ToTable("MaintenanceRequests");

        builder.HasKey(request => request.Id);
        builder.Property(request => request.Id)
            .ValueGeneratedNever()
            .IsRequired();
        builder.Property(request => request.TenantId)
            .IsRequired();
        builder.Property(request => request.RoomId)
            .IsRequired();
        builder.Property(request => request.Title)
            .HasMaxLength(MaintenanceRequest.TitleMaxLength)
            .IsRequired();
        builder.Property(request => request.Description)
            .HasMaxLength(MaintenanceRequest.DescriptionMaxLength)
            .IsRequired();
        builder.Property(request => request.Status)
            .HasConversion<int>()
            .IsRequired();
        builder.Property(request => request.StartedAt)
            .HasColumnType("datetimeoffset");
        builder.Property(request => request.ResolvedAt)
            .HasColumnType("datetimeoffset");
        builder.Property(request => request.ClosedAt)
            .HasColumnType("datetimeoffset");
        builder.Property(request => request.CreatedAt)
            .HasColumnType("datetimeoffset")
            .IsRequired();
        builder.Property(request => request.UpdatedAt)
            .HasColumnType("datetimeoffset");
        builder.Property<byte[]>("RowVersion")
            .IsRowVersion()
            .IsConcurrencyToken()
            .IsRequired();

        builder.HasOne(request => request.Tenant)
            .WithMany(tenant => tenant.MaintenanceRequests)
            .HasForeignKey(request => request.TenantId)
            .OnDelete(DeleteBehavior.Restrict);
        builder.HasOne(request => request.Room)
            .WithMany(room => room.MaintenanceRequests)
            .HasForeignKey(request => request.RoomId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasIndex(request => new
            {
                request.TenantId,
                request.Status
            })
            .HasDatabaseName("IX_MaintenanceRequests_TenantId_Status");
        builder.HasIndex(request => new
            {
                request.RoomId,
                request.Status
            })
            .HasDatabaseName("IX_MaintenanceRequests_RoomId_Status");
        builder.HasIndex(request => new
            {
                request.Status,
                request.CreatedAt
            })
            .HasDatabaseName("IX_MaintenanceRequests_Status_CreatedAt");

        builder.Navigation(request => request.Updates)
            .UsePropertyAccessMode(PropertyAccessMode.Field);
    }
}
