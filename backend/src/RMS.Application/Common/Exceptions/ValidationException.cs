namespace RMS.Application.Common.Exceptions;

public sealed class ValidationException : RmsApplicationException
{
    public ValidationException(string message)
        : this(ApplicationErrorCodes.Validation, message)
    {
    }

    public ValidationException(string code, string message)
        : base(code, message)
    {
    }
}
