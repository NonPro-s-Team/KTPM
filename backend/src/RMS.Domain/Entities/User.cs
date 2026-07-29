using RMS.Domain.Common;
using RMS.Domain.Common.Entities;
using RMS.Domain.Constants;
using RMS.Domain.Enums;
using RMS.Domain.Exceptions;

namespace RMS.Domain.Entities;

public class User : AuditableEntity
{
    public const int UsernameMaxLength = 100;
    public const int PasswordHashMaxLength = 512;
    public const int MaximumFailedLoginAttempts = 5;

    private User()
    {
        Username = string.Empty;
        PasswordHash = string.Empty;
    }

    public User(
        string username,
        string passwordHash,
        UserRole role,
        DateTimeOffset createdAt)
        : base(createdAt)
    {
        Username = Guard.Required(
            username,
            nameof(Username),
            UsernameMaxLength);
        PasswordHash = Guard.Required(
            passwordHash,
            nameof(PasswordHash),
            PasswordHashMaxLength);
        Role = Guard.DefinedEnum(role, nameof(Role));
        Status = UserStatus.Active;
    }

    public User(
        string username,
        string passwordHash,
        UserRole role)
        : this(username, passwordHash, role, DateTimeOffset.UtcNow)
    {
    }

    public string Username { get; private set; }
    public string PasswordHash { get; private set; }
    public UserRole Role { get; private set; }
    public UserStatus Status { get; private set; }
    public int FailedLoginAttempts { get; private set; }
    public DateTimeOffset? LockedAt { get; private set; }

    public void ChangePasswordHash(
        string newPasswordHash,
        DateTimeOffset changedAt)
    {
        PasswordHash = Guard.Required(
            newPasswordHash,
            nameof(newPasswordHash),
            PasswordHashMaxLength);
        MarkUpdated(changedAt);
    }

    public void RecordFailedLogin(DateTimeOffset occurredAt)
    {
        EnsureStatus(
            UserStatus.Active,
            "Failed login can only be recorded for an active user.");

        FailedLoginAttempts++;
        if (FailedLoginAttempts >= MaximumFailedLoginAttempts)
        {
            Status = UserStatus.Locked;
            LockedAt = NormalizeTimestamp(occurredAt);
        }

        MarkUpdated(occurredAt);
    }

    public void RecordSuccessfulLogin(DateTimeOffset occurredAt)
    {
        EnsureStatus(
            UserStatus.Active,
            "Successful login can only be recorded for an active user.");

        FailedLoginAttempts = 0;
        MarkUpdated(occurredAt);
    }

    public void Lock(DateTimeOffset lockedAt)
    {
        EnsureStatus(
            UserStatus.Active,
            "Only an active user can be locked.");

        Status = UserStatus.Locked;
        LockedAt = NormalizeTimestamp(lockedAt);
        MarkUpdated(lockedAt);
    }

    public void Unlock(DateTimeOffset unlockedAt)
    {
        EnsureStatus(
            UserStatus.Locked,
            "Only a locked user can be unlocked.");

        Status = UserStatus.Active;
        FailedLoginAttempts = 0;
        LockedAt = null;
        MarkUpdated(unlockedAt);
    }

    public void Deactivate(DateTimeOffset occurredAt)
    {
        if (Status == UserStatus.Inactive)
        {
            throw InvalidState("User is already inactive.");
        }

        Status = UserStatus.Inactive;
        MarkUpdated(occurredAt);
    }

    public void Activate(DateTimeOffset occurredAt)
    {
        EnsureStatus(
            UserStatus.Inactive,
            "Only an inactive user can be activated.");

        Status = UserStatus.Active;
        FailedLoginAttempts = 0;
        LockedAt = null;
        MarkUpdated(occurredAt);
    }

    private void EnsureStatus(UserStatus expectedStatus, string message)
    {
        if (Status != expectedStatus)
        {
            throw InvalidState(message);
        }
    }

    private static DomainException InvalidState(string message) =>
        new(DomainErrorCodes.InvalidState, message);
}
