using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using RMS.Domain.Entities;

namespace RMS.Infrastructure.Data.Configurations;

public class RoomConfiguration : IEntityTypeConfiguration<Room>
{
    public void Configure(EntityTypeBuilder<Room> builder)
    {
        builder.ToTable(
            "Rooms",
            table => table.HasCheckConstraint(
                "CK_Rooms_MonthlyRent",
                "[MonthlyRent] >= 0"));

        builder.HasKey(room => room.Id);
        builder.Property(room => room.Id)
            .ValueGeneratedNever()
            .IsRequired();
        builder.Property(room => room.RoomNumber)
            .HasMaxLength(Room.RoomNumberMaxLength)
            .IsRequired();
        builder.Property(room => room.MonthlyRent)
            .HasPrecision(18, 2)
            .IsRequired();
        builder.Property(room => room.Description)
            .HasMaxLength(Room.DescriptionMaxLength);
        builder.Property(room => room.Status)
            .HasConversion<int>()
            .IsRequired();
        builder.Property(room => room.CreatedAt)
            .HasColumnType("datetimeoffset")
            .IsRequired();
        builder.Property(room => room.UpdatedAt)
            .HasColumnType("datetimeoffset");
        builder.Property<byte[]>("RowVersion")
            .IsRowVersion()
            .IsConcurrencyToken()
            .IsRequired();

        builder.HasIndex(room => room.RoomNumber)
            .IsUnique()
            .HasDatabaseName("UX_Rooms_RoomNumber");

        builder.Navigation(room => room.Contracts)
            .UsePropertyAccessMode(PropertyAccessMode.Field);
        builder.Navigation(room => room.MaintenanceRequests)
            .UsePropertyAccessMode(PropertyAccessMode.Field);
    }
}
