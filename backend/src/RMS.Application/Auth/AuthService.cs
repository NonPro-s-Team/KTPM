using RMS.Application.Auth.Models;
using RMS.Application.Common.Exceptions;
using RMS.Application.Common.Interfaces.Persistence;
using RMS.Application.Common.Interfaces.Security;
using RMS.Application.Common.Interfaces.Services;
using RMS.Application.Common.Models;
using RMS.Application.Common.Security;
using RMS.Application.Common.Validation;
using RMS.Domain.Entities;
using RMS.Domain.Enums;

namespace RMS.Application.Auth;

public sealed class AuthService : IAuthService
{
    private const string InvalidCredentialsMessage =
        "Invalid username or password.";

    private static readonly TimeSpan PasswordResetTokenLifetime =
        TimeSpan.FromMinutes(30);

    private readonly IUserRepository _userRepository;
    private readonly IPasswordResetTokenRepository _passwordResetTokenRepository;
    private readonly IPasswordHasher _passwordHasher;
    private readonly IAccessTokenService _accessTokenService;
    private readonly ISecureTokenGenerator _secureTokenGenerator;
    private readonly IEmailSender _emailSender;
    private readonly IEmailLinkBuilder _emailLinkBuilder;
    private readonly ICurrentUserService _currentUser;
    private readonly IDateTimeProvider _dateTimeProvider;
    private readonly IUnitOfWork _unitOfWork;

    public AuthService(
        IUserRepository userRepository,
        IPasswordResetTokenRepository passwordResetTokenRepository,
        IPasswordHasher passwordHasher,
        IAccessTokenService accessTokenService,
        ISecureTokenGenerator secureTokenGenerator,
        IEmailSender emailSender,
        IEmailLinkBuilder emailLinkBuilder,
        ICurrentUserService currentUser,
        IDateTimeProvider dateTimeProvider,
        IUnitOfWork unitOfWork)
    {
        _userRepository = userRepository;
        _passwordResetTokenRepository = passwordResetTokenRepository;
        _passwordHasher = passwordHasher;
        _accessTokenService = accessTokenService;
        _secureTokenGenerator = secureTokenGenerator;
        _emailSender = emailSender;
        _emailLinkBuilder = emailLinkBuilder;
        _currentUser = currentUser;
        _dateTimeProvider = dateTimeProvider;
        _unitOfWork = unitOfWork;
    }

    public async Task<LoginResponse> LoginAsync(
        LoginRequest request,
        CancellationToken cancellationToken = default)
    {
        request = RequestGuard.NotNull(request, nameof(request));
        var username = RequestGuard.Required(
            request.Username,
            nameof(request.Username));
        var password = RequestGuard.Required(
            request.Password,
            nameof(request.Password));

        var user = await _userRepository.GetByUsernameAsync(
            username,
            cancellationToken);

        if (user is null)
        {
            throw new AuthenticationException(
                ApplicationErrorCodes.InvalidCredentials,
                InvalidCredentialsMessage);
        }

        if (user.Status == UserStatus.Locked)
        {
            throw new AuthenticationException(
                ApplicationErrorCodes.AccountLocked,
                "The account is locked.");
        }

        if (user.Status == UserStatus.Inactive)
        {
            throw new AuthenticationException(
                ApplicationErrorCodes.AccountInactive,
                "The account is inactive.");
        }

        var now = _dateTimeProvider.UtcNow;
        if (!_passwordHasher.Verify(password, user.PasswordHash))
        {
            user.RecordFailedLogin(now);
            await _unitOfWork.SaveChangesAsync(cancellationToken);

            var code = user.Status == UserStatus.Locked
                ? ApplicationErrorCodes.AccountLocked
                : ApplicationErrorCodes.InvalidCredentials;
            var message = user.Status == UserStatus.Locked
                ? "The account is locked."
                : InvalidCredentialsMessage;

            throw new AuthenticationException(code, message);
        }

        user.RecordSuccessfulLogin(now);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        var token = _accessTokenService.Generate(user);
        return new LoginResponse(
            token.AccessToken,
            token.ExpiresAt,
            token.UserId,
            token.Username,
            token.Role);
    }

    public async Task ChangePasswordAsync(
        ChangePasswordRequest request,
        CancellationToken cancellationToken = default)
    {
        AuthorizationGuard.EnsureAuthenticated(_currentUser);
        request = RequestGuard.NotNull(request, nameof(request));
        var currentPassword = RequestGuard.Required(
            request.CurrentPassword,
            nameof(request.CurrentPassword));
        var newPassword = RequestGuard.Password(
            request.NewPassword,
            nameof(request.NewPassword));

        var user = await _userRepository.GetByIdAsync(
            _currentUser.UserId,
            cancellationToken)
            ?? throw new NotFoundException("User", _currentUser.UserId);

        if (!_passwordHasher.Verify(currentPassword, user.PasswordHash))
        {
            throw new AuthenticationException(
                ApplicationErrorCodes.InvalidCredentials,
                "The current password is incorrect.");
        }

        var newPasswordHash = _passwordHasher.Hash(newPassword);
        user.ChangePasswordHash(newPasswordHash, _dateTimeProvider.UtcNow);
        await _unitOfWork.SaveChangesAsync(cancellationToken);
    }

    public async Task UnlockUserAsync(
        UnlockUserRequest request,
        CancellationToken cancellationToken = default)
    {
        AuthorizationGuard.EnsureAdmin(_currentUser);
        request = RequestGuard.NotNull(request, nameof(request));
        var userId = RequestGuard.Required(
            request.UserId,
            nameof(request.UserId));

        var user = await _userRepository.GetByIdAsync(userId, cancellationToken)
            ?? throw new NotFoundException("User", userId);

        user.Unlock(_dateTimeProvider.UtcNow);
        await _unitOfWork.SaveChangesAsync(cancellationToken);
    }

    public async Task RequestPasswordResetAsync(
        RequestPasswordResetRequest request,
        CancellationToken cancellationToken = default)
    {
        request = RequestGuard.NotNull(request, nameof(request));
        var email = RequestGuard.Email(request.Email, nameof(request.Email));

        var user = await _userRepository.GetByEmailAsync(email, cancellationToken);
        if (user is null || user.Status != UserStatus.Active)
        {
            // Intentionally do not reveal whether the email exists.
            return;
        }

        var now = _dateTimeProvider.UtcNow;
        var activeTokens = await _passwordResetTokenRepository
            .GetActiveByUserIdAsync(user.Id, cancellationToken);
        foreach (var activeToken in activeTokens)
        {
            activeToken.Invalidate(now);
        }

        var token = _secureTokenGenerator.GenerateToken();
        var resetToken = new PasswordResetToken(
            user.Id,
            _secureTokenGenerator.Hash(token),
            now.Add(PasswordResetTokenLifetime),
            now);
        _passwordResetTokenRepository.Add(resetToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        var resetUrl = _emailLinkBuilder.BuildPasswordResetUrl(token);
        await _emailSender.SendAsync(
            new OutgoingEmail(
                user.Email!,
                "Đặt lại mật khẩu TroConnect",
                $"""
                <p>Chúng tôi nhận được yêu cầu đặt lại mật khẩu cho tài khoản của bạn.</p>
                <p><a href="{resetUrl}">Bấm vào đây để đặt lại mật khẩu</a> (liên kết có hiệu lực trong 30 phút).</p>
                <p>Nếu bạn không yêu cầu điều này, vui lòng bỏ qua email này.</p>
                """),
            cancellationToken);
    }

    public async Task ResetPasswordAsync(
        ResetPasswordRequest request,
        CancellationToken cancellationToken = default)
    {
        request = RequestGuard.NotNull(request, nameof(request));
        var token = RequestGuard.Required(request.Token, nameof(request.Token));
        var newPassword = RequestGuard.Password(
            request.NewPassword,
            nameof(request.NewPassword));

        var tokenHash = _secureTokenGenerator.Hash(token);
        var resetToken = await _passwordResetTokenRepository.GetByTokenHashAsync(
            tokenHash,
            cancellationToken);

        var now = _dateTimeProvider.UtcNow;
        if (resetToken is null || resetToken.UsedAt is not null
            || resetToken.InvalidatedAt is not null)
        {
            throw new ValidationException(
                ApplicationErrorCodes.InvalidResetToken,
                "The password reset link is invalid.");
        }

        if (now >= resetToken.ExpiresAt)
        {
            throw new ValidationException(
                ApplicationErrorCodes.ResetTokenExpired,
                "The password reset link has expired.");
        }

        var user = await _userRepository.GetByIdAsync(resetToken.UserId, cancellationToken)
            ?? throw new NotFoundException("User", resetToken.UserId);

        if (user.Status == UserStatus.Inactive)
        {
            throw new AuthenticationException(
                ApplicationErrorCodes.AccountInactive,
                "The account is inactive.");
        }

        var newPasswordHash = _passwordHasher.Hash(newPassword);
        user.ChangePasswordHash(newPasswordHash, now);
        if (user.Status == UserStatus.Locked)
        {
            user.Unlock(now);
        }

        resetToken.MarkUsed(now);

        var otherActiveTokens = await _passwordResetTokenRepository
            .GetActiveByUserIdAsync(user.Id, cancellationToken);
        foreach (var otherToken in otherActiveTokens)
        {
            otherToken.Invalidate(now);
        }

        await _unitOfWork.SaveChangesAsync(cancellationToken);
    }

    public Task LogoutAsync(CancellationToken cancellationToken = default)
    {
        cancellationToken.ThrowIfCancellationRequested();
        AuthorizationGuard.EnsureAuthenticated(_currentUser);
        return Task.CompletedTask;
    }
}
