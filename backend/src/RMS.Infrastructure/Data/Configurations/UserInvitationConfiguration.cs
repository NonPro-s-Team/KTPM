using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using RMS.Domain.Entities;

namespace RMS.Infrastructure.Data.Configurations;

public class UserInvitationConfiguration : IEntityTypeConfiguration<UserInvitation>
{
    public void Configure(EntityTypeBuilder<UserInvitation> builder)
    {
        builder.ToTable("UserInvitations");

        builder.HasKey(invitation => invitation.Id);
        builder.Property(invitation => invitation.Id)
            .ValueGeneratedNever()
            .IsRequired();
        builder.Property(invitation => invitation.Email)
            .HasMaxLength(UserInvitation.EmailMaxLength)
            .IsRequired();
        builder.Property(invitation => invitation.Role)
            .HasConversion<int>()
            .IsRequired();
        builder.Property(invitation => invitation.TokenHash)
            .HasMaxLength(UserInvitation.TokenHashMaxLength)
            .IsRequired();
        builder.Property(invitation => invitation.InvitedByUserId)
            .IsRequired();
        builder.Property(invitation => invitation.ExpiresAt)
            .HasColumnType("datetimeoffset")
            .IsRequired();
        builder.Property(invitation => invitation.AcceptedAt)
            .HasColumnType("datetimeoffset");
        builder.Property(invitation => invitation.RevokedAt)
            .HasColumnType("datetimeoffset");
        builder.Property(invitation => invitation.CreatedAt)
            .HasColumnType("datetimeoffset")
            .IsRequired();
        builder.Property(invitation => invitation.UpdatedAt)
            .HasColumnType("datetimeoffset");

        builder.HasOne<User>()
            .WithMany()
            .HasForeignKey(invitation => invitation.InvitedByUserId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasIndex(invitation => invitation.TokenHash)
            .IsUnique()
            .HasDatabaseName("UX_UserInvitations_TokenHash");
        builder.HasIndex(invitation => invitation.Email)
            .HasDatabaseName("IX_UserInvitations_Email");
    }
}
