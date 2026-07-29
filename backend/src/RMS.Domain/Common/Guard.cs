using RMS.Domain.Constants;
using RMS.Domain.Exceptions;

namespace RMS.Domain.Common;

public static class Guard
{
    public static string Required(
        string? value,
        string fieldName,
        int maxLength)
    {
        if (string.IsNullOrWhiteSpace(value))
        {
            throw new DomainException(
                DomainErrorCodes.RequiredField,
                $"{fieldName} is required.");
        }

        var trimmedValue = value.Trim();
        if (trimmedValue.Length > maxLength)
        {
            throw new DomainException(
                DomainErrorCodes.InvalidValue,
                $"{fieldName} cannot exceed {maxLength} characters.");
        }

        return trimmedValue;
    }

    public static string? Optional(
        string? value,
        string fieldName,
        int maxLength)
    {
        if (string.IsNullOrWhiteSpace(value))
        {
            return null;
        }

        var trimmedValue = value.Trim();
        if (trimmedValue.Length > maxLength)
        {
            throw new DomainException(
                DomainErrorCodes.InvalidValue,
                $"{fieldName} cannot exceed {maxLength} characters.");
        }

        return trimmedValue;
    }

    public static Guid Required(Guid value, string fieldName)
    {
        if (value == Guid.Empty)
        {
            throw new DomainException(
                DomainErrorCodes.RequiredField,
                $"{fieldName} is required.");
        }

        return value;
    }

    public static decimal NonNegative(decimal value, string fieldName)
    {
        if (value < 0)
        {
            throw new DomainException(
                DomainErrorCodes.InvalidAmount,
                $"{fieldName} cannot be negative.");
        }

        return value;
    }

    public static TEnum DefinedEnum<TEnum>(TEnum value, string fieldName)
        where TEnum : struct, Enum
    {
        if (!Enum.IsDefined(value) || Convert.ToInt32(value) == 0)
        {
            throw new DomainException(
                DomainErrorCodes.InvalidState,
                $"{fieldName} is invalid.");
        }

        return value;
    }
}

