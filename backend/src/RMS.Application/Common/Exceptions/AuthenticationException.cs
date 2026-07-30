namespace RMS.Application.Common.Exceptions;

public sealed class AuthenticationException : RmsApplicationException
{
    public AuthenticationException(string code, string message)
        : base(code, message)
    {
    }
}
