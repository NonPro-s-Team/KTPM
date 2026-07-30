namespace RMS.Application.Common.Exceptions;

public sealed class ForbiddenAccessException : RmsApplicationException
{
    public ForbiddenAccessException(string code, string message)
        : base(code, message)
    {
    }
}
