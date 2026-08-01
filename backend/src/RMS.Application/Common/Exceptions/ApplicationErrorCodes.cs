namespace RMS.Application.Common.Exceptions;

public static class ApplicationErrorCodes
{
    public const string InvalidCredentials = "INVALID_CREDENTIALS";
    public const string AccountLocked = "ACCOUNT_LOCKED";
    public const string AccountInactive = "ACCOUNT_INACTIVE";
    public const string Unauthenticated = "UNAUTHENTICATED";
    public const string Forbidden = "FORBIDDEN";
    public const string NotFound = "NOT_FOUND";
    public const string Conflict = "CONFLICT";
    public const string ConcurrencyConflict = "CONCURRENCY_CONFLICT";
    public const string UsernameAlreadyExists = "USERNAME_ALREADY_EXISTS";
    public const string RoomNumberAlreadyExists = "ROOM_NUMBER_ALREADY_EXISTS";
    public const string Validation = "VALIDATION_ERROR";
    public const string ContractNotActive = "CONTRACT_NOT_ACTIVE";
    public const string EmailAlreadyExists = "EMAIL_ALREADY_EXISTS";
    public const string InvalidInvitationToken = "INVALID_INVITATION_TOKEN";
    public const string InvitationExpired = "INVITATION_EXPIRED";
    public const string InvalidResetToken = "INVALID_RESET_TOKEN";
    public const string ResetTokenExpired = "RESET_TOKEN_EXPIRED";
}
