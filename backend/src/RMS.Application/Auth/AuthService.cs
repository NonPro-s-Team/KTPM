using RMS.Application.Auth.Models;
using RMS.Application.Common.Exceptions;
using RMS.Application.Common.Interfaces.Persistence;
using RMS.Application.Common.Interfaces.Security;
using RMS.Application.Common.Interfaces.Services;
using RMS.Application.Common.Security;
using RMS.Application.Common.Validation;
using RMS.Domain.Enums;

namespace RMS.Application.Auth;

public sealed class AuthService : IAuthService
{
    private const string InvalidCredentialsMessage =
        "Invalid username or password.";

    private readonly IUserRepository _userRepository;
    private readonly IPasswordHasher _passwordHasher;
    private readonly IAccessTokenService _accessTokenService;
    private readonly ICurrentUserService _currentUser;
    private readonly IDateTimeProvider _dateTimeProvider;
    private readonly IUnitOfWork _unitOfWork;

    public AuthService(
        IUserRepository userRepository,
        IPasswordHasher passwordHasher,
        IAccessTokenService accessTokenService,
        ICurrentUserService currentUser,
        IDateTimeProvider dateTimeProvider,
        IUnitOfWork unitOfWork)
    {
        _userRepository = userRepository;
        _passwordHasher = passwordHasher;
        _accessTokenService = accessTokenService;
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

    public Task LogoutAsync(CancellationToken cancellationToken = default)
    {
        cancellationToken.ThrowIfCancellationRequested();
        AuthorizationGuard.EnsureAuthenticated(_currentUser);
        return Task.CompletedTask;
    }
}
