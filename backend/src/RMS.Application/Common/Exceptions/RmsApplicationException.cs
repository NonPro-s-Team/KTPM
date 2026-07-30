namespace RMS.Application.Common.Exceptions;

public abstract class RmsApplicationException : Exception
{
    protected RmsApplicationException(string code, string message)
        : base(message)
    {
        if (string.IsNullOrWhiteSpace(code))
        {
            throw new ArgumentException("Application error code is required.", nameof(code));
        }

        Code = code.Trim();
    }

    public string Code { get; }
}
