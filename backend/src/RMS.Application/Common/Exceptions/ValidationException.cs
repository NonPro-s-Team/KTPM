namespace RMS.Application.Common.Exceptions;

public sealed class ValidationException : RmsApplicationException
{
    public ValidationException(string message)
        : base(ApplicationErrorCodes.Validation, message)
    {
    }
}
