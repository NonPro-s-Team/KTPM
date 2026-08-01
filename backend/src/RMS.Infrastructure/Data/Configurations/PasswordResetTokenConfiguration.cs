using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using RMS.Domain.Entities;

namespace RMS.Infrastructure.Data.Configurations;

public class PasswordResetTokenConfiguration
    : IEntityTypeConfiguration<PasswordResetToken>
{
    public void Configure(EntityTypeBuilder<PasswordResetToken> builder)
    {
        builder.ToTable("PasswordResetTokens");

        builder.HasKey(token => token.Id);
        builder.Property(token => token.Id)
            .ValueGeneratedNever()
            .IsRequired();
        builder.Property(token => token.UserId)
            .IsRequired();
        builder.Property(token => token.TokenHash)
            .HasMaxLength(PasswordResetToken.TokenHashMaxLength)
            .IsRequired();
        builder.Property(token => token.ExpiresAt)
            .HasColumnType("datetimeoffset")
            .IsRequired();
        builder.Property(token => token.UsedAt)
            .HasColumnType("datetimeoffset");
        builder.Property(token => token.InvalidatedAt)
            .HasColumnType("datetimeoffset");
        builder.Property(token => token.CreatedAt)
            .HasColumnType("datetimeoffset")
            .IsRequired();
        builder.Property(token => token.UpdatedAt)
            .HasColumnType("datetimeoffset");

        builder.HasOne<User>()
            .WithMany()
            .HasForeignKey(token => token.UserId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasIndex(token => token.TokenHash)
            .IsUnique()
            .HasDatabaseName("UX_PasswordResetTokens_TokenHash");
        builder.HasIndex(token => token.UserId)
            .HasDatabaseName("IX_PasswordResetTokens_UserId");
    }
}
