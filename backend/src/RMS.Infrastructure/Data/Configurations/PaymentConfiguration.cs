using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using RMS.Domain.Entities;

namespace RMS.Infrastructure.Data.Configurations;

public class PaymentConfiguration : IEntityTypeConfiguration<Payment>
{
    public void Configure(EntityTypeBuilder<Payment> builder)
    {
        builder.ToTable(
            "Payments",
            table => table.HasCheckConstraint(
                "CK_Payments_Amount",
                "[Amount] > 0"));

        builder.HasKey(payment => payment.Id);
        builder.Property(payment => payment.Id)
            .ValueGeneratedNever()
            .IsRequired();
        builder.Property(payment => payment.InvoiceId)
            .IsRequired();
        builder.Property(payment => payment.Amount)
            .HasPrecision(18, 2)
            .IsRequired();
        builder.Property(payment => payment.PaidAt)
            .HasColumnType("datetimeoffset")
            .IsRequired();
        builder.Property(payment => payment.Note);
        builder.Property(payment => payment.RecordedByUserId)
            .IsRequired();
        builder.Property(payment => payment.CreatedAt)
            .HasColumnType("datetimeoffset")
            .IsRequired();

        builder.HasOne(payment => payment.Invoice)
            .WithMany(invoice => invoice.Payments)
            .HasForeignKey(payment => payment.InvoiceId)
            .OnDelete(DeleteBehavior.Restrict);
        builder.HasOne<User>()
            .WithMany()
            .HasForeignKey(payment => payment.RecordedByUserId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasIndex(payment => new
            {
                payment.InvoiceId,
                payment.PaidAt
            })
            .HasDatabaseName("IX_Payments_InvoiceId_PaidAt");
    }
}
