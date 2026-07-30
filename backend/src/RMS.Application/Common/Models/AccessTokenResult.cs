using RMS.Domain.Enums;

namespace RMS.Application.Common.Models;

public sealed record AccessTokenResult(
    string AccessToken,
    DateTimeOffset ExpiresAt,
    Guid UserId,
    string Username,
    UserRole Role);
