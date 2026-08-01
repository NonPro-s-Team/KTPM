using RMS.Domain.Enums;

namespace RMS.Application.Invitations.Models;

public sealed record CreateInvitationRequest(string Email, UserRole Role);

public sealed record InvitationResponse(
    Guid Id,
    string Email,
    UserRole Role,
    DateTimeOffset ExpiresAt,
    DateTimeOffset CreatedAt);

public sealed record InvitationPreviewResponse(
    string Email,
    UserRole Role,
    DateTimeOffset ExpiresAt);

public sealed record AcceptInvitationRequest(
    string Token,
    string Username,
    string Password);

public sealed record AcceptInvitationResponse(
    Guid UserId,
    string Username,
    UserRole Role);
