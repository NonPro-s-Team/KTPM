using FluentAssertions;
using RMS.Domain.Constants;
using RMS.Domain.Entities;
using RMS.Domain.Enums;
using RMS.Domain.Exceptions;

namespace RMS.UnitTests.Domain;

public class UserTests
{
    private static readonly DateTimeOffset CreatedAt =
        new(2026, 1, 15, 8, 0, 0, TimeSpan.Zero);

    [Fact]
    public void Constructor_ValidArguments_CreatesActiveUser()
    {
        // Arrange
        const string username = "admin";
        const string passwordHash = "hashed-password";

        // Act
        var user = new User(
            username,
            passwordHash,
            UserRole.Admin,
            CreatedAt);

        // Assert
        user.Id.Should().NotBeEmpty();
        user.Username.Should().Be(username);
        user.PasswordHash.Should().Be(passwordHash);
        user.Role.Should().Be(UserRole.Admin);
        user.Status.Should().Be(UserStatus.Active);
        user.FailedLoginAttempts.Should().Be(0);
        user.LockedAt.Should().BeNull();
        user.CreatedAt.Should().Be(CreatedAt);
        user.UpdatedAt.Should().BeNull();
    }

    [Fact]
    public void Constructor_EmptyUsername_ThrowsDomainException()
    {
        // Arrange
        const string emptyUsername = "   ";

        // Act
        Action act = () => new User(
            emptyUsername,
            "hashed-password",
            UserRole.Staff,
            CreatedAt);

        // Assert
        var exception = act.Should().Throw<DomainException>().Which;
        exception.Code.Should().Be(DomainErrorCodes.RequiredField);
        exception.Message.Should().Contain("Username");
    }

    [Fact]
    public void Constructor_EmptyPasswordHash_ThrowsDomainException()
    {
        // Arrange
        const string emptyPasswordHash = "";

        // Act
        Action act = () => new User(
            "staff",
            emptyPasswordHash,
            UserRole.Staff,
            CreatedAt);

        // Assert
        var exception = act.Should().Throw<DomainException>().Which;
        exception.Code.Should().Be(DomainErrorCodes.RequiredField);
        exception.Message.Should().Contain("PasswordHash");
    }

    [Fact]
    public void RecordFailedLogin_FewerThanFiveAttempts_DoesNotLockUser()
    {
        // Arrange
        var user = CreateUser();
        var fourthAttemptAt = CreatedAt.AddMinutes(4);

        // Act
        for (var attempt = 1; attempt < User.MaximumFailedLoginAttempts; attempt++)
        {
            user.RecordFailedLogin(CreatedAt.AddMinutes(attempt));
        }

        // Assert
        user.FailedLoginAttempts.Should()
            .Be(User.MaximumFailedLoginAttempts - 1);
        user.Status.Should().Be(UserStatus.Active);
        user.LockedAt.Should().BeNull();
        user.UpdatedAt.Should().Be(fourthAttemptAt);
    }

    [Fact]
    public void RecordFailedLogin_FifthConsecutiveAttempt_LocksUser()
    {
        // Arrange
        var user = CreateUser();
        var fifthAttemptAt = CreatedAt.AddMinutes(5);

        // Act
        for (var attempt = 1; attempt <= User.MaximumFailedLoginAttempts; attempt++)
        {
            user.RecordFailedLogin(CreatedAt.AddMinutes(attempt));
        }

        // Assert
        user.FailedLoginAttempts.Should()
            .Be(User.MaximumFailedLoginAttempts);
        user.Status.Should().Be(UserStatus.Locked);
        user.LockedAt.Should().Be(fifthAttemptAt);
        user.UpdatedAt.Should().Be(fifthAttemptAt);
    }

    [Fact]
    public void RecordSuccessfulLogin_AfterFailedAttempts_ResetsFailedAttempts()
    {
        // Arrange
        var user = CreateUser();
        user.RecordFailedLogin(CreatedAt.AddMinutes(1));
        user.RecordFailedLogin(CreatedAt.AddMinutes(2));
        var successfulLoginAt = CreatedAt.AddMinutes(3);

        // Act
        user.RecordSuccessfulLogin(successfulLoginAt);

        // Assert
        user.FailedLoginAttempts.Should().Be(0);
        user.Status.Should().Be(UserStatus.Active);
        user.UpdatedAt.Should().Be(successfulLoginAt);
    }

    [Fact]
    public void Unlock_LockedAdmin_ActivatesAndResetsUser()
    {
        // Arrange
        var user = CreateUser(UserRole.Admin);
        user.RecordFailedLogin(CreatedAt.AddMinutes(1));
        var lockedAt = CreatedAt.AddMinutes(2);
        user.Lock(lockedAt);
        var unlockedAt = CreatedAt.AddMinutes(3);

        // Act
        user.Unlock(unlockedAt);

        // Assert
        user.Status.Should().Be(UserStatus.Active);
        user.FailedLoginAttempts.Should().Be(0);
        user.LockedAt.Should().BeNull();
        user.UpdatedAt.Should().Be(unlockedAt);
    }

    [Fact]
    public void ChangePasswordHash_ValidHash_UpdatesPasswordHash()
    {
        // Arrange
        var user = CreateUser();
        const string newPasswordHash = "new-hashed-password";
        var changedAt = CreatedAt.AddHours(1);

        // Act
        user.ChangePasswordHash(newPasswordHash, changedAt);

        // Assert
        user.PasswordHash.Should().Be(newPasswordHash);
        user.UpdatedAt.Should().Be(changedAt);
    }

    private static User CreateUser(UserRole role = UserRole.Tenant) =>
        new("tenant-user", "hashed-password", role, CreatedAt);
}
