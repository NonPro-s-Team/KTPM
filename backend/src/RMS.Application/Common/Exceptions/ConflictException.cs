namespace RMS.Application.Common.Exceptions;

public sealed class ConflictException : RmsApplicationException
{
    public ConflictException(string message)
        : this(ApplicationErrorCodes.Conflict, message)
    {
    }

    public ConflictException(string code, string message)
        : base(code, message)
    {
    }
}
