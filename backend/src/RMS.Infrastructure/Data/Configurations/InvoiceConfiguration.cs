using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.ChangeTracking;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Microsoft.EntityFrameworkCore.Storage.ValueConversion;
using RMS.Domain.Entities;
using RMS.Domain.ValueObjects;

namespace RMS.Infrastructure.Data.Configurations;

public class InvoiceConfiguration : IEntityTypeConfiguration<Invoice>
{
    public void Configure(EntityTypeBuilder<Invoice> builder)
    {
        builder.ToTable(
            "Invoices",
            table =>
            {
                table.HasCheckConstraint(
                    "CK_Invoices_BillingPeriod",
                    "[BillingPeriodKey] BETWEEN 200001 AND 210012 "
                    + "AND [BillingPeriodKey] % 100 BETWEEN 1 AND 12");
                table.HasCheckConstraint(
                    "CK_Invoices_ElectricityReadings",
                    "[ElectricityEndReading] >= [ElectricityStartReading]");
                table.HasCheckConstraint(
                    "CK_Invoices_WaterReadings",
                    "[WaterEndReading] >= [WaterStartReading]");
                table.HasCheckConstraint(
                    "CK_Invoices_Amounts",
                    "[RentAmount] >= 0 "
                    + "AND [ElectricityAmount] >= 0 "
                    + "AND [WaterAmount] >= 0 "
                    + "AND [TotalAmount] >= 0 "
                    + "AND [PaidAmount] >= 0 "
                    + "AND [PaidAmount] <= [TotalAmount]");
            });

        var billingPeriodConverter =
            new ValueConverter<BillingPeriod, int>(
                period => period.Year * 100 + period.Month,
                value => new BillingPeriod(value % 100, value / 100));
        var billingPeriodComparer =
            new ValueComparer<BillingPeriod>(
                (left, right) =>
                    left == right
                    || (left != null
                        && right != null
                        && left.Month == right.Month
                        && left.Year == right.Year),
                period => HashCode.Combine(period.Month, period.Year),
                period => new BillingPeriod(period.Month, period.Year));

        builder.HasKey(invoice => invoice.Id);
        builder.Property(invoice => invoice.Id)
            .ValueGeneratedNever()
            .IsRequired();
        builder.Property(invoice => invoice.ContractId)
            .IsRequired();
        var billingPeriodProperty = builder.Property(
                invoice => invoice.BillingPeriod)
            .HasConversion(billingPeriodConverter)
            .HasColumnName("BillingPeriodKey")
            .HasColumnType("int")
            .IsRequired();
        billingPeriodProperty.Metadata.SetValueComparer(billingPeriodComparer);

        ConfigureMoney(builder, invoice => invoice.RentAmount);
        ConfigureReading(builder, invoice => invoice.ElectricityStartReading);
        ConfigureReading(builder, invoice => invoice.ElectricityEndReading);
        ConfigureReading(builder, invoice => invoice.WaterStartReading);
        ConfigureReading(builder, invoice => invoice.WaterEndReading);
        ConfigureMoney(builder, invoice => invoice.ElectricityUnitPrice);
        ConfigureMoney(builder, invoice => invoice.WaterUnitPrice);
        ConfigureMoney(builder, invoice => invoice.ElectricityAmount);
        ConfigureMoney(builder, invoice => invoice.WaterAmount);
        ConfigureMoney(builder, invoice => invoice.TotalAmount);
        ConfigureMoney(builder, invoice => invoice.PaidAmount);

        builder.Property(invoice => invoice.Status)
            .HasConversion<int>()
            .IsRequired();
        builder.Property(invoice => invoice.IssuedAt)
            .HasColumnType("datetimeoffset");
        builder.Property(invoice => invoice.PaidAt)
            .HasColumnType("datetimeoffset");
        builder.Property(invoice => invoice.CancelledAt)
            .HasColumnType("datetimeoffset");
        builder.Property(invoice => invoice.CreatedAt)
            .HasColumnType("datetimeoffset")
            .IsRequired();
        builder.Property(invoice => invoice.UpdatedAt)
            .HasColumnType("datetimeoffset");
        builder.Property<byte[]>("RowVersion")
            .IsRowVersion()
            .IsConcurrencyToken()
            .IsRequired();

        builder.HasOne(invoice => invoice.Contract)
            .WithMany(contract => contract.Invoices)
            .HasForeignKey(invoice => invoice.ContractId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasIndex(invoice => new
            {
                invoice.ContractId,
                invoice.BillingPeriod
            })
            .IsUnique()
            .HasDatabaseName("UX_Invoices_Contract_BillingPeriod");

        builder.Navigation(invoice => invoice.Payments)
            .UsePropertyAccessMode(PropertyAccessMode.Field);
    }

    private static void ConfigureMoney(
        EntityTypeBuilder<Invoice> builder,
        System.Linq.Expressions.Expression<Func<Invoice, decimal>> property)
    {
        builder.Property(property)
            .HasPrecision(18, 2)
            .IsRequired();
    }

    private static void ConfigureReading(
        EntityTypeBuilder<Invoice> builder,
        System.Linq.Expressions.Expression<Func<Invoice, decimal>> property)
    {
        builder.Property(property)
            .HasPrecision(18, 3)
            .IsRequired();
    }
}
