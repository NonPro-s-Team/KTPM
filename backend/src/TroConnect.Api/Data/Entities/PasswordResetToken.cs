namespace TroConnect.Api.Data.Entities;

public class PasswordResetToken
{
    public Guid Id { get; set; }
    public Guid AccountId { get; set; }
    public Account Account { get; set; } = null!;

    // SHA-256 hash of the raw token — the raw value is only ever handed to the caller once, never persisted.
    public string TokenHash { get; set; } = string.Empty;

    public DateTimeOffset ExpiresAt { get; set; }
    public DateTimeOffset? UsedAt { get; set; }
    public DateTimeOffset CreatedAt { get; set; }
}
