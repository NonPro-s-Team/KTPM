using RMS.Domain.Common;
using RMS.Domain.Common.Entities;
using RMS.Domain.Constants;
using RMS.Domain.Exceptions;

namespace RMS.Domain.Entities;

public class PasswordResetToken : AuditableEntity
{
    public const int TokenHashMaxLength = 64;

    private PasswordResetToken()
    {
        TokenHash = string.Empty;
    }

    public PasswordResetToken(
        Guid userId,
        string tokenHash,
        DateTimeOffset expiresAt,
        DateTimeOffset createdAt)
        : base(createdAt)
    {
        UserId = Guard.Required(userId, nameof(UserId));
        TokenHash = Guard.Required(
            tokenHash,
            nameof(TokenHash),
            TokenHashMaxLength);

        if (expiresAt <= createdAt)
        {
            throw new DomainException(
                DomainErrorCodes.InvalidValue,
                "Reset token expiry must be after its creation time.");
        }

        ExpiresAt = NormalizeTimestamp(expiresAt);
    }

    public Guid UserId { get; private set; }
    public string TokenHash { get; private set; }
    public DateTimeOffset ExpiresAt { get; private set; }
    public DateTimeOffset? UsedAt { get; private set; }
    public DateTimeOffset? InvalidatedAt { get; private set; }

    public bool IsUsable(DateTimeOffset now) =>
        UsedAt is null && InvalidatedAt is null && now < ExpiresAt;

    public void MarkUsed(DateTimeOffset occurredAt)
    {
        if (!IsUsable(occurredAt))
        {
            throw new DomainException(
                DomainErrorCodes.InvalidState,
                "The reset token is no longer usable.");
        }

        UsedAt = NormalizeTimestamp(occurredAt);
        MarkUpdated(occurredAt);
    }

    public void Invalidate(DateTimeOffset occurredAt)
    {
        if (UsedAt is not null)
        {
            throw new DomainException(
                DomainErrorCodes.InvalidState,
                "A used reset token cannot be invalidated.");
        }

        if (InvalidatedAt is not null)
        {
            return;
        }

        InvalidatedAt = NormalizeTimestamp(occurredAt);
        MarkUpdated(occurredAt);
    }
}
