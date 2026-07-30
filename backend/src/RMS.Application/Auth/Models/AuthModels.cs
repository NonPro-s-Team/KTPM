using RMS.Domain.Enums;

namespace RMS.Application.Auth.Models;

public sealed record LoginRequest(string Username, string Password);

public sealed record LoginResponse(
    string AccessToken,
    DateTimeOffset ExpiresAt,
    Guid UserId,
    string Username,
    UserRole Role);

public sealed record ChangePasswordRequest(
    string CurrentPassword,
    string NewPassword);

public sealed record UnlockUserRequest(Guid UserId);
