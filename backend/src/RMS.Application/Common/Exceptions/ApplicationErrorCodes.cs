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
    public const string Validation = "VALIDATION_ERROR";
    public const string ContractNotActive = "CONTRACT_NOT_ACTIVE";
}
