using FluentAssertions;
using Moq;
using RMS.Application.Common.Exceptions;
using RMS.Application.Common.Interfaces.Persistence;
using RMS.Application.Common.Interfaces.Security;
using RMS.Application.Common.Interfaces.Services;
using RMS.Application.Common.Models;
using RMS.Application.Invitations;
using RMS.Application.Invitations.Models;
using RMS.Domain.Entities;
using RMS.Domain.Enums;
using RMS.UnitTests.Application.TestDoubles;

namespace RMS.UnitTests.Application.Invitations;

public class InvitationServiceTests
{
    private readonly Mock<IUserRepository> _users = new();
    private readonly Mock<IUserInvitationRepository> _invitations = new();
    private readonly Mock<IPasswordHasher> _passwordHasher = new();
    private readonly Mock<ISecureTokenGenerator> _secureTokenGenerator = new();
    private readonly Mock<IEmailSender> _emailSender = new();
    private readonly Mock<IEmailLinkBuilder> _emailLinkBuilder = new();
    private readonly Mock<IUnitOfWork> _unitOfWork = new();
    private readonly FakeCurrentUserService _currentUser = new();
    private readonly FakeDateTimeProvider _clock = new();
    private readonly InvitationService _service;

    public InvitationServiceTests()
    {
        _unitOfWork
            .Setup(unit => unit.SaveChangesAsync(It.IsAny<CancellationToken>()))
            .ReturnsAsync(1);
        _invitations
            .Setup(repository => repository.GetActiveByEmailAsync(
                It.IsAny<string>(),
                It.IsAny<CancellationToken>()))
            .ReturnsAsync([]);
        _service = new InvitationService(
            _users.Object,
            _invitations.Object,
            _passwordHasher.Object,
            _secureTokenGenerator.Object,
            _emailSender.Object,
            _emailLinkBuilder.Object,
            _currentUser,
            _clock,
            _unitOfWork.Object);
    }

    [Fact]
    public async Task CreateInvitation_NonAdmin_IsForbidden()
    {
        // Arrange
        _currentUser.Role = UserRole.Staff;

        // Act
        Func<Task> act = () => _service.CreateInvitationAsync(
            new CreateInvitationRequest("staff2@example.com", UserRole.Staff));

        // Assert
        await act.Should().ThrowAsync<ForbiddenAccessException>();
        _unitOfWork.Verify(
            unit => unit.SaveChangesAsync(It.IsAny<CancellationToken>()),
            Times.Never);
    }

    [Fact]
    public async Task CreateInvitation_TenantRole_IsRejected()
    {
        // Act
        Func<Task> act = () => _service.CreateInvitationAsync(
            new CreateInvitationRequest("tenant@example.com", UserRole.Tenant));

        // Assert
        await act.Should().ThrowAsync<ValidationException>();
        _unitOfWork.Verify(
            unit => unit.SaveChangesAsync(It.IsAny<CancellationToken>()),
            Times.Never);
    }

    [Fact]
    public async Task CreateInvitation_ExistingEmail_ThrowsConflict()
    {
        // Arrange
        _users
            .Setup(repository => repository.EmailExistsAsync(
                "staff2@example.com",
                null,
                It.IsAny<CancellationToken>()))
            .ReturnsAsync(true);

        // Act
        Func<Task> act = () => _service.CreateInvitationAsync(
            new CreateInvitationRequest("staff2@example.com", UserRole.Staff));

        // Assert
        var exception = await act.Should().ThrowAsync<ConflictException>();
        exception.Which.Code.Should()
            .Be(ApplicationErrorCodes.EmailAlreadyExists);
    }

    [Fact]
    public async Task CreateInvitation_Valid_CreatesAndSendsEmail()
    {
        // Arrange
        _secureTokenGenerator.Setup(generator => generator.GenerateToken())
            .Returns("plain-token");
        _secureTokenGenerator.Setup(generator => generator.Hash("plain-token"))
            .Returns("hashed-token");
        _emailLinkBuilder
            .Setup(builder => builder.BuildInvitationAcceptUrl("plain-token"))
            .Returns("https://app/invite/plain-token");

        // Act
        var response = await _service.CreateInvitationAsync(
            new CreateInvitationRequest("staff2@example.com", UserRole.Staff));

        // Assert
        response.Email.Should().Be("staff2@example.com");
        response.Role.Should().Be(UserRole.Staff);
        _invitations.Verify(
            repository => repository.Add(
                It.Is<UserInvitation>(invitation =>
                    invitation.Email == "staff2@example.com"
                    && invitation.TokenHash == "hashed-token"
                    && invitation.InvitedByUserId == _currentUser.UserId)),
            Times.Once);
        _emailSender.Verify(
            sender => sender.SendAsync(
                It.Is<OutgoingEmail>(email =>
                    email.ToEmail == "staff2@example.com"
                    && email.HtmlBody.Contains("https://app/invite/plain-token")),
                It.IsAny<CancellationToken>()),
            Times.Once);
    }

    [Fact]
    public async Task AcceptInvitation_UnknownToken_ThrowsInvalidInvitationToken()
    {
        // Arrange
        _secureTokenGenerator.Setup(generator => generator.Hash("bad-token"))
            .Returns("bad-token-hash");
        _invitations
            .Setup(repository => repository.GetByTokenHashAsync(
                "bad-token-hash",
                It.IsAny<CancellationToken>()))
            .ReturnsAsync((UserInvitation?)null);

        // Act
        Func<Task> act = () => _service.AcceptInvitationAsync(
            new AcceptInvitationRequest("bad-token", "newstaff", "password123"));

        // Assert
        var exception = await act.Should().ThrowAsync<ValidationException>();
        exception.Which.Code.Should()
            .Be(ApplicationErrorCodes.InvalidInvitationToken);
    }

    [Fact]
    public async Task AcceptInvitation_ExpiredToken_ThrowsInvitationExpired()
    {
        // Arrange
        var invitation = new UserInvitation(
            "staff2@example.com",
            UserRole.Staff,
            "token-hash",
            DomainTestFactory.AdminUserId,
            _clock.UtcNow.AddDays(-1),
            _clock.UtcNow.AddDays(-8));
        _secureTokenGenerator.Setup(generator => generator.Hash("expired-token"))
            .Returns("token-hash");
        _invitations
            .Setup(repository => repository.GetByTokenHashAsync(
                "token-hash",
                It.IsAny<CancellationToken>()))
            .ReturnsAsync(invitation);

        // Act
        Func<Task> act = () => _service.AcceptInvitationAsync(
            new AcceptInvitationRequest(
                "expired-token",
                "newstaff",
                "password123"));

        // Assert
        var exception = await act.Should().ThrowAsync<ValidationException>();
        exception.Which.Code.Should()
            .Be(ApplicationErrorCodes.InvitationExpired);
    }

    [Fact]
    public async Task AcceptInvitation_Valid_CreatesUserAndMarksAccepted()
    {
        // Arrange
        var invitation = new UserInvitation(
            "staff2@example.com",
            UserRole.Staff,
            "token-hash",
            DomainTestFactory.AdminUserId,
            _clock.UtcNow.AddDays(6),
            _clock.UtcNow.AddDays(-1));
        _secureTokenGenerator.Setup(generator => generator.Hash("good-token"))
            .Returns("token-hash");
        _invitations
            .Setup(repository => repository.GetByTokenHashAsync(
                "token-hash",
                It.IsAny<CancellationToken>()))
            .ReturnsAsync(invitation);
        _users
            .Setup(repository => repository.UsernameExistsAsync(
                "newstaff",
                null,
                It.IsAny<CancellationToken>()))
            .ReturnsAsync(false);
        _users
            .Setup(repository => repository.EmailExistsAsync(
                "staff2@example.com",
                null,
                It.IsAny<CancellationToken>()))
            .ReturnsAsync(false);
        _passwordHasher.Setup(hasher => hasher.Hash("password123"))
            .Returns("password-hash");

        // Act
        var response = await _service.AcceptInvitationAsync(
            new AcceptInvitationRequest("good-token", "newstaff", "password123"));

        // Assert
        response.Username.Should().Be("newstaff");
        response.Role.Should().Be(UserRole.Staff);
        invitation.AcceptedAt.Should().Be(_clock.UtcNow);
        _users.Verify(
            repository => repository.Add(
                It.Is<User>(user =>
                    user.Username == "newstaff"
                    && user.Email == "staff2@example.com"
                    && user.Role == UserRole.Staff)),
            Times.Once);
        _unitOfWork.Verify(
            unit => unit.SaveChangesAsync(It.IsAny<CancellationToken>()),
            Times.Once);
    }
}
