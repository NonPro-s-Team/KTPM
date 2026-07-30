using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using RMS.Domain.Entities;

namespace RMS.Infrastructure.Data.Configurations;

public class UserConfiguration : IEntityTypeConfiguration<User>
{
    public void Configure(EntityTypeBuilder<User> builder)
    {
        builder.ToTable(
            "Users",
            table => table.HasCheckConstraint(
                "CK_Users_FailedLoginAttempts",
                "[FailedLoginAttempts] >= 0"));

        builder.HasKey(user => user.Id);
        builder.Property(user => user.Id)
            .ValueGeneratedNever()
            .IsRequired();
        builder.Property(user => user.Username)
            .HasMaxLength(User.UsernameMaxLength)
            .IsRequired();
        builder.Property(user => user.PasswordHash)
            .HasMaxLength(User.PasswordHashMaxLength)
            .IsRequired();
        builder.Property(user => user.Role)
            .HasConversion<int>()
            .IsRequired();
        builder.Property(user => user.Status)
            .HasConversion<int>()
            .IsRequired();
        builder.Property(user => user.FailedLoginAttempts)
            .IsRequired();
        builder.Property(user => user.LockedAt)
            .HasColumnType("datetimeoffset");
        builder.Property(user => user.CreatedAt)
            .HasColumnType("datetimeoffset")
            .IsRequired();
        builder.Property(user => user.UpdatedAt)
            .HasColumnType("datetimeoffset");
        builder.Property<byte[]>("RowVersion")
            .IsRowVersion()
            .IsConcurrencyToken()
            .IsRequired();

        builder.HasIndex(user => user.Username)
            .IsUnique()
            .HasDatabaseName("UX_Users_Username");
    }
}
