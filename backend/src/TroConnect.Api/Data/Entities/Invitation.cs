namespace TroConnect.Api.Data.Entities;

public class Invitation
{
    public Guid Id { get; set; }
    public string Email { get; set; } = string.Empty;
    public AccountRole Role { get; set; }

    // SHA-256 hash of the raw token — the raw value is only ever handed to the caller once
    // (embedded in the invite link), never persisted. Same pattern as PasswordResetToken.
    public string TokenHash { get; set; } = string.Empty;

    public InvitationStatus Status { get; set; } = InvitationStatus.Pending;
    public Guid InvitedByAccountId { get; set; }

    public DateTimeOffset ExpiresAt { get; set; }
    public DateTimeOffset? AcceptedAt { get; set; }
    public DateTimeOffset CreatedAt { get; set; }

    public bool IsDeleted { get; set; }
    public DateTimeOffset? DeletedAt { get; set; }
}
