using FluentAssertions;
using Moq;
using RMS.Application.Auth;
using RMS.Application.Auth.Models;
using RMS.Application.Common.Exceptions;
using RMS.Application.Common.Interfaces.Persistence;
using RMS.Application.Common.Interfaces.Security;
using RMS.Application.Common.Models;
using RMS.Domain.Entities;
using RMS.Domain.Enums;
using RMS.UnitTests.Application.TestDoubles;
using RmsAuthenticationException =
    RMS.Application.Common.Exceptions.AuthenticationException;

namespace RMS.UnitTests.Application.Auth;

public class AuthServiceTests
{
    private readonly Mock<IUserRepository> _users = new();
    private readonly Mock<IPasswordHasher> _passwordHasher = new();
    private readonly Mock<IAccessTokenService> _tokens = new();
    private readonly Mock<IUnitOfWork> _unitOfWork = new();
    private readonly FakeCurrentUserService _currentUser = new();
    private readonly FakeDateTimeProvider _clock = new();
    private readonly AuthService _service;

    public AuthServiceTests()
    {
        _unitOfWork
            .Setup(unit => unit.SaveChangesAsync(It.IsAny<CancellationToken>()))
            .ReturnsAsync(1);
        _service = new AuthService(
            _users.Object,
            _passwordHasher.Object,
            _tokens.Object,
            _currentUser,
            _clock,
            _unitOfWork.Object);
    }

    [Fact]
    public async Task Login_ValidCredentials_ReturnsToken()
    {
        // Arrange
        var user = DomainTestFactory.CreateUser(username: "admin");
        var token = new AccessTokenResult(
            "access-token",
            _clock.UtcNow.AddHours(1),
            user.Id,
            user.Username,
            user.Role);
        SetupLogin(user, passwordMatches: true);
        _tokens.Setup(service => service.Generate(user)).Returns(token);

        // Act
        var response = await _service.LoginAsync(
            new LoginRequest(" admin ", "correct-password"));

        // Assert
        response.AccessToken.Should().Be(token.AccessToken);
        response.UserId.Should().Be(user.Id);
        response.Role.Should().Be(user.Role);
        _users.Verify(
            repository => repository.GetByUsernameAsync(
                "admin",
                It.IsAny<CancellationToken>()),
            Times.Once);
        _unitOfWork.Verify(
            unit => unit.SaveChangesAsync(It.IsAny<CancellationToken>()),
            Times.Once);
    }

    [Fact]
    public async Task Login_UnknownUsername_ThrowsGenericAuthenticationException()
    {
        // Arrange
        _users
            .Setup(repository => repository.GetByUsernameAsync(
                "missing",
                It.IsAny<CancellationToken>()))
            .ReturnsAsync((User?)null);

        // Act
        Func<Task> act = () => _service.LoginAsync(
            new LoginRequest("missing", "some-password"));

        // Assert
        var exception = await act.Should()
            .ThrowAsync<RmsAuthenticationException>();
        exception.Which.Code.Should()
            .Be(ApplicationErrorCodes.InvalidCredentials);
        exception.Which.Message.Should()
            .Be("Invalid username or password.");
        _unitOfWork.Verify(
            unit => unit.SaveChangesAsync(It.IsAny<CancellationToken>()),
            Times.Never);
    }

    [Fact]
    public async Task Login_InvalidPassword_RecordsFailedAttempt()
    {
        // Arrange
        var user = DomainTestFactory.CreateUser();
        SetupLogin(user, passwordMatches: false);

        // Act
        Func<Task> act = () => _service.LoginAsync(
            new LoginRequest(user.Username, "wrong-password"));

        // Assert
        var exception = await act.Should()
            .ThrowAsync<RmsAuthenticationException>();
        exception.Which.Code.Should()
            .Be(ApplicationErrorCodes.InvalidCredentials);
        user.FailedLoginAttempts.Should().Be(1);
        user.UpdatedAt.Should().Be(_clock.UtcNow);
        _unitOfWork.Verify(
            unit => unit.SaveChangesAsync(It.IsAny<CancellationToken>()),
            Times.Once);
    }

    [Fact]
    public async Task Login_FifthInvalidAttempt_LocksAccount()
    {
        // Arrange
        var user = DomainTestFactory.CreateUser();
        for (var attempt = 1;
             attempt < User.MaximumFailedLoginAttempts;
             attempt++)
        {
            user.RecordFailedLogin(
                _clock.UtcNow.AddMinutes(-User.MaximumFailedLoginAttempts + attempt));
        }

        SetupLogin(user, passwordMatches: false);

        // Act
        Func<Task> act = () => _service.LoginAsync(
            new LoginRequest(user.Username, "wrong-password"));

        // Assert
        var exception = await act.Should()
            .ThrowAsync<RmsAuthenticationException>();
        exception.Which.Code.Should().Be(ApplicationErrorCodes.AccountLocked);
        user.Status.Should().Be(UserStatus.Locked);
        user.FailedLoginAttempts.Should().Be(User.MaximumFailedLoginAttempts);
        _unitOfWork.Verify(
            unit => unit.SaveChangesAsync(It.IsAny<CancellationToken>()),
            Times.Once);
    }

    [Fact]
    public async Task Login_LockedAccount_IsRejected()
    {
        // Arrange
        var user = DomainTestFactory.CreateUser(status: UserStatus.Locked);
        _users
            .Setup(repository => repository.GetByUsernameAsync(
                user.Username,
                It.IsAny<CancellationToken>()))
            .ReturnsAsync(user);

        // Act
        Func<Task> act = () => _service.LoginAsync(
            new LoginRequest(user.Username, "password"));

        // Assert
        var exception = await act.Should()
            .ThrowAsync<RmsAuthenticationException>();
        exception.Which.Code.Should().Be(ApplicationErrorCodes.AccountLocked);
        _passwordHasher.Verify(
            hasher => hasher.Verify(
                It.IsAny<string>(),
                It.IsAny<string>()),
            Times.Never);
    }

    [Fact]
    public async Task Login_InactiveAccount_IsRejected()
    {
        // Arrange
        var user = DomainTestFactory.CreateUser(status: UserStatus.Inactive);
        _users
            .Setup(repository => repository.GetByUsernameAsync(
                user.Username,
                It.IsAny<CancellationToken>()))
            .ReturnsAsync(user);

        // Act
        Func<Task> act = () => _service.LoginAsync(
            new LoginRequest(user.Username, "password"));

        // Assert
        var exception = await act.Should()
            .ThrowAsync<RmsAuthenticationException>();
        exception.Which.Code.Should().Be(ApplicationErrorCodes.AccountInactive);
        _unitOfWork.Verify(
            unit => unit.SaveChangesAsync(It.IsAny<CancellationToken>()),
            Times.Never);
    }

    [Fact]
    public async Task Login_Success_ResetsFailedAttempts()
    {
        // Arrange
        var user = DomainTestFactory.CreateUser();
        user.RecordFailedLogin(_clock.UtcNow.AddMinutes(-2));
        user.RecordFailedLogin(_clock.UtcNow.AddMinutes(-1));
        SetupLogin(user, passwordMatches: true);
        _tokens
            .Setup(service => service.Generate(user))
            .Returns(new AccessTokenResult(
                "token",
                _clock.UtcNow.AddHours(1),
                user.Id,
                user.Username,
                user.Role));

        // Act
        await _service.LoginAsync(
            new LoginRequest(user.Username, "correct-password"));

        // Assert
        user.FailedLoginAttempts.Should().Be(0);
        user.Status.Should().Be(UserStatus.Active);
        user.UpdatedAt.Should().Be(_clock.UtcNow);
    }

    [Fact]
    public async Task ChangePassword_WrongCurrentPassword_IsRejected()
    {
        // Arrange
        var user = DomainTestFactory.CreateUser();
        _currentUser.UserId = user.Id;
        _users
            .Setup(repository => repository.GetByIdAsync(
                user.Id,
                It.IsAny<CancellationToken>()))
            .ReturnsAsync(user);
        _passwordHasher
            .Setup(hasher => hasher.Verify("wrong-current", user.PasswordHash))
            .Returns(false);

        // Act
        Func<Task> act = () => _service.ChangePasswordAsync(
            new ChangePasswordRequest("wrong-current", "new-password"));

        // Assert
        var exception = await act.Should()
            .ThrowAsync<RmsAuthenticationException>();
        exception.Which.Code.Should()
            .Be(ApplicationErrorCodes.InvalidCredentials);
        _passwordHasher.Verify(
            hasher => hasher.Hash(It.IsAny<string>()),
            Times.Never);
        _unitOfWork.Verify(
            unit => unit.SaveChangesAsync(It.IsAny<CancellationToken>()),
            Times.Never);
    }

    [Fact]
    public async Task ChangePassword_ValidRequest_ChangesHash()
    {
        // Arrange
        var user = DomainTestFactory.CreateUser();
        _currentUser.UserId = user.Id;
        _users
            .Setup(repository => repository.GetByIdAsync(
                user.Id,
                It.IsAny<CancellationToken>()))
            .ReturnsAsync(user);
        _passwordHasher
            .Setup(hasher => hasher.Verify("current-password", user.PasswordHash))
            .Returns(true);
        _passwordHasher
            .Setup(hasher => hasher.Hash("new-password"))
            .Returns("new-password-hash");

        // Act
        await _service.ChangePasswordAsync(
            new ChangePasswordRequest("current-password", "new-password"));

        // Assert
        user.PasswordHash.Should().Be("new-password-hash");
        user.UpdatedAt.Should().Be(_clock.UtcNow);
        _unitOfWork.Verify(
            unit => unit.SaveChangesAsync(It.IsAny<CancellationToken>()),
            Times.Once);
    }

    [Fact]
    public async Task UnlockUser_NonAdmin_IsForbidden()
    {
        // Arrange
        _currentUser.Role = UserRole.Staff;

        // Act
        Func<Task> act = () => _service.UnlockUserAsync(
            new UnlockUserRequest(Guid.NewGuid()));

        // Assert
        var exception = await act.Should()
            .ThrowAsync<ForbiddenAccessException>();
        exception.Which.Code.Should().Be(ApplicationErrorCodes.Forbidden);
        _users.Verify(
            repository => repository.GetByIdAsync(
                It.IsAny<Guid>(),
                It.IsAny<CancellationToken>()),
            Times.Never);
    }

    [Fact]
    public async Task UnlockUser_Admin_UnlocksAccount()
    {
        // Arrange
        var user = DomainTestFactory.CreateUser(status: UserStatus.Locked);
        _currentUser.Role = UserRole.Admin;
        _users
            .Setup(repository => repository.GetByIdAsync(
                user.Id,
                It.IsAny<CancellationToken>()))
            .ReturnsAsync(user);

        // Act
        await _service.UnlockUserAsync(new UnlockUserRequest(user.Id));

        // Assert
        user.Status.Should().Be(UserStatus.Active);
        user.LockedAt.Should().BeNull();
        user.FailedLoginAttempts.Should().Be(0);
        _unitOfWork.Verify(
            unit => unit.SaveChangesAsync(It.IsAny<CancellationToken>()),
            Times.Once);
    }

    private void SetupLogin(User user, bool passwordMatches)
    {
        _users
            .Setup(repository => repository.GetByUsernameAsync(
                user.Username,
                It.IsAny<CancellationToken>()))
            .ReturnsAsync(user);
        _passwordHasher
            .Setup(hasher => hasher.Verify(
                It.IsAny<string>(),
                user.PasswordHash))
            .Returns(passwordMatches);
    }
}
