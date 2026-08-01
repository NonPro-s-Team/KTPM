using RMS.Domain.Common;
using RMS.Domain.Common.Entities;
using RMS.Domain.Constants;
using RMS.Domain.Enums;
using RMS.Domain.Exceptions;

namespace RMS.Domain.Entities;

public class UserInvitation : AuditableEntity
{
    public const int EmailMaxLength = 256;
    public const int TokenHashMaxLength = 64;

    private UserInvitation()
    {
        Email = string.Empty;
        TokenHash = string.Empty;
    }

    public UserInvitation(
        string email,
        UserRole role,
        string tokenHash,
        Guid invitedByUserId,
        DateTimeOffset expiresAt,
        DateTimeOffset createdAt)
        : base(createdAt)
    {
        Email = Guard.Required(email, nameof(Email), EmailMaxLength);
        Role = Guard.DefinedEnum(role, nameof(Role));
        TokenHash = Guard.Required(
            tokenHash,
            nameof(TokenHash),
            TokenHashMaxLength);
        InvitedByUserId = Guard.Required(
            invitedByUserId,
            nameof(InvitedByUserId));

        if (expiresAt <= createdAt)
        {
            throw new DomainException(
                DomainErrorCodes.InvalidValue,
                "Invitation expiry must be after its creation time.");
        }

        ExpiresAt = NormalizeTimestamp(expiresAt);
    }

    public string Email { get; private set; }
    public UserRole Role { get; private set; }
    public string TokenHash { get; private set; }
    public Guid InvitedByUserId { get; private set; }
    public DateTimeOffset ExpiresAt { get; private set; }
    public DateTimeOffset? AcceptedAt { get; private set; }
    public DateTimeOffset? RevokedAt { get; private set; }

    public bool IsUsable(DateTimeOffset now) =>
        AcceptedAt is null && RevokedAt is null && now < ExpiresAt;

    public void MarkAccepted(DateTimeOffset occurredAt)
    {
        if (!IsUsable(occurredAt))
        {
            throw new DomainException(
                DomainErrorCodes.InvalidState,
                "The invitation is no longer usable.");
        }

        AcceptedAt = NormalizeTimestamp(occurredAt);
        MarkUpdated(occurredAt);
    }

    public void Revoke(DateTimeOffset occurredAt)
    {
        if (AcceptedAt is not null)
        {
            throw new DomainException(
                DomainErrorCodes.InvalidState,
                "An accepted invitation cannot be revoked.");
        }

        if (RevokedAt is not null)
        {
            return;
        }

        RevokedAt = NormalizeTimestamp(occurredAt);
        MarkUpdated(occurredAt);
    }
}
