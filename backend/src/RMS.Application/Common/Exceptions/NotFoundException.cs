namespace RMS.Application.Common.Exceptions;

public sealed class NotFoundException : RmsApplicationException
{
    public NotFoundException(string resourceName, Guid resourceId)
        : base(
            ApplicationErrorCodes.NotFound,
            $"{resourceName} with ID '{resourceId}' was not found.")
    {
    }

    public NotFoundException(string resourceName, string lookupValue)
        : base(
            ApplicationErrorCodes.NotFound,
            $"{resourceName} '{lookupValue}' was not found.")
    {
    }
}
