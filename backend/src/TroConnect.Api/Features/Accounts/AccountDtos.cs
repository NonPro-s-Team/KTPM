using System.ComponentModel.DataAnnotations;
using TroConnect.Api.Data.Entities;

namespace TroConnect.Api.Features.Accounts;

public record RegisterRequest(
    [Required, EmailAddress] string Email,
    [Required, MinLength(8)] string Password,
    [Required] AccountRole Role
);

public record RegisterResponse(Guid Id, string Email, AccountRole Role);

public record LoginRequest(
    [Required, EmailAddress] string Email,
    [Required] string Password
);

public record LoginResponse(string Token, DateTimeOffset ExpiresAt);

public record ForgotPasswordRequest([Required, EmailAddress] string Email);

public record ForgotPasswordResponse(
    string Message,
    // DEV-ONLY: exposes the raw reset token directly in the response so it can be used without a real
    // email-delivery service. This MUST be removed once real email delivery is wired up — returning the
    // token here defeats the point of it being a secret sent only to the account owner's inbox.
    string? DevOnlyResetToken
);

public record ResetPasswordRequest(
    [Required] string Token,
    [Required, MinLength(8)] string NewPassword
);

public record ResetPasswordResponse(string Message);

public record InviteUserRequest(
    [Required, EmailAddress] string Email,
    [Required] AccountRole Role
);

public record InviteUserResponse(
    string Email,
    AccountRole Role,
    // DEV-ONLY: local/dev has no real email delivery yet, so the invite link is returned directly
    // in the response. TODO: once a real email service is wired up (post-deploy), stop returning
    // this field and send the link via email instead.
    string InviteLink,
    DateTimeOffset ExpiresAt
);

public record AcceptInviteRequest(
    [Required] string Token,
    [Required, MinLength(8)] string Password
);

public record AcceptInviteResponse(string Token, DateTimeOffset ExpiresAt, string Email, AccountRole Role);
