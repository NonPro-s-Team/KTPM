using RMS.Application.Auth.Models;

namespace RMS.Application.Auth;

public interface IAuthService
{
    Task<LoginResponse> LoginAsync(
        LoginRequest request,
        CancellationToken cancellationToken = default);

    Task ChangePasswordAsync(
        ChangePasswordRequest request,
        CancellationToken cancellationToken = default);

    Task UnlockUserAsync(
        UnlockUserRequest request,
        CancellationToken cancellationToken = default);

    Task LogoutAsync(CancellationToken cancellationToken = default);
}
