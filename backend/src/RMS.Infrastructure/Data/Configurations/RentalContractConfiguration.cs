using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using RMS.Domain.Entities;
using RMS.Domain.Enums;

namespace RMS.Infrastructure.Data.Configurations;

public sealed class RentalContractConfiguration :
    IEntityTypeConfiguration<RentalContract>
{
    public void Configure(EntityTypeBuilder<RentalContract> builder)
    {
        builder.ToTable(
            "RentalContracts",
            table =>
            {
                table.HasCheckConstraint(
                    "CK_RentalContracts_DateRange",
                    "[EndDate] > [StartDate]");
                table.HasCheckConstraint(
                    "CK_RentalContracts_MonthlyRent",
                    "[MonthlyRent] >= 0");
            });

        builder.HasKey(contract => contract.Id);
        builder.Property(contract => contract.Id)
            .ValueGeneratedNever()
            .IsRequired();
        builder.Property(contract => contract.RoomId)
            .IsRequired();
        builder.Property(contract => contract.TenantId)
            .IsRequired();
        builder.Property(contract => contract.StartDate)
            .HasColumnType("date")
            .IsRequired();
        builder.Property(contract => contract.EndDate)
            .HasColumnType("date")
            .IsRequired();
        builder.Property(contract => contract.MonthlyRent)
            .HasPrecision(18, 2)
            .IsRequired();
        builder.Property(contract => contract.Status)
            .HasConversion<int>()
            .IsRequired();
        builder.Property(contract => contract.ActivatedAt)
            .HasColumnType("datetimeoffset");
        builder.Property(contract => contract.TerminatedAt)
            .HasColumnType("datetimeoffset");
        builder.Property(contract => contract.CancelledAt)
            .HasColumnType("datetimeoffset");
        builder.Property(contract => contract.CreatedAt)
            .HasColumnType("datetimeoffset")
            .IsRequired();
        builder.Property(contract => contract.UpdatedAt)
            .HasColumnType("datetimeoffset");
        builder.Property<byte[]>("RowVersion")
            .IsRowVersion()
            .IsConcurrencyToken()
            .IsRequired();

        builder.HasOne(contract => contract.Room)
            .WithMany(room => room.Contracts)
            .HasForeignKey(contract => contract.RoomId)
            .OnDelete(DeleteBehavior.Restrict);
        builder.HasOne(contract => contract.Tenant)
            .WithMany(tenant => tenant.Contracts)
            .HasForeignKey(contract => contract.TenantId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasIndex(
                contract => contract.RoomId,
                "IX_RentalContracts_RoomId")
            .HasDatabaseName("IX_RentalContracts_RoomId");
        builder.HasIndex(contract => new
            {
                contract.TenantId,
                contract.Status
            })
            .HasDatabaseName("IX_RentalContracts_TenantId_Status");
        builder.HasIndex(
                contract => contract.RoomId,
                "UX_RentalContracts_Room_Active")
            .IsUnique()
            .HasFilter($"[Status] = {(int)ContractStatus.Active}")
            .HasDatabaseName("UX_RentalContracts_Room_Active");

        builder.Navigation(contract => contract.Invoices)
            .UsePropertyAccessMode(PropertyAccessMode.Field);
    }
}
