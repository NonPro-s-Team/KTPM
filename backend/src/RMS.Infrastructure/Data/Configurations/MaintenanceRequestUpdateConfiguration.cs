using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using RMS.Domain.Entities;

namespace RMS.Infrastructure.Data.Configurations;

public sealed class MaintenanceRequestUpdateConfiguration :
    IEntityTypeConfiguration<MaintenanceRequestUpdate>
{
    public void Configure(EntityTypeBuilder<MaintenanceRequestUpdate> builder)
    {
        builder.ToTable("MaintenanceRequestUpdates");

        builder.HasKey(update => update.Id);
        builder.Property(update => update.Id)
            .ValueGeneratedNever()
            .IsRequired();
        builder.Property(update => update.MaintenanceRequestId)
            .IsRequired();
        builder.Property(update => update.PreviousStatus)
            .HasConversion<int>()
            .IsRequired();
        builder.Property(update => update.NewStatus)
            .HasConversion<int>()
            .IsRequired();
        builder.Property(update => update.Note)
            .HasMaxLength(MaintenanceRequest.NoteMaxLength);
        builder.Property(update => update.UpdatedByUserId)
            .IsRequired();
        builder.Property(update => update.OccurredAt)
            .HasColumnType("datetimeoffset")
            .IsRequired();
        builder.Property(update => update.CreatedAt)
            .HasColumnType("datetimeoffset")
            .IsRequired();

        builder.HasOne<MaintenanceRequest>()
            .WithMany(request => request.Updates)
            .HasForeignKey(update => update.MaintenanceRequestId)
            .OnDelete(DeleteBehavior.Restrict);
        builder.HasOne<User>()
            .WithMany()
            .HasForeignKey(update => update.UpdatedByUserId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasIndex(update => new
            {
                update.MaintenanceRequestId,
                update.OccurredAt
            })
            .HasDatabaseName(
                "IX_MaintenanceRequestUpdates_Request_OccurredAt");
    }
}
