using System.Text.RegularExpressions;
using RMS.Application.Common.Exceptions;
using RMS.Application.Common.Models;

namespace RMS.Application.Common.Validation;

internal static partial class RequestGuard
{
    [GeneratedRegex(@"^[^@\s]+@[^@\s]+\.[^@\s]+$")]
    private static partial Regex EmailPattern();

    public static string Email(string? value, string fieldName, int? maxLength = null)
    {
        var email = Required(value, fieldName, maxLength);
        if (!EmailPattern().IsMatch(email))
        {
            throw new ValidationException($"{fieldName} is not a valid email address.");
        }

        return email.ToLowerInvariant();
    }

    public static T NotNull<T>(T? value, string fieldName)
        where T : class
    {
        if (value is null)
        {
            throw new ValidationException($"{fieldName} is required.");
        }

        return value;
    }

    public static string Required(
        string? value,
        string fieldName,
        int? maxLength = null)
    {
        if (string.IsNullOrWhiteSpace(value))
        {
            throw new ValidationException($"{fieldName} is required.");
        }

        var trimmed = value.Trim();
        if (maxLength.HasValue && trimmed.Length > maxLength.Value)
        {
            throw new ValidationException(
                $"{fieldName} cannot exceed {maxLength.Value} characters.");
        }

        return trimmed;
    }

    public static string Password(string? value, string fieldName)
    {
        var password = Required(value, fieldName);
        if (password.Length < 8)
        {
            throw new ValidationException(
                $"{fieldName} must contain at least 8 characters.");
        }

        return password;
    }

    public static Guid Required(Guid value, string fieldName)
    {
        if (value == Guid.Empty)
        {
            throw new ValidationException($"{fieldName} is required.");
        }

        return value;
    }

    public static decimal NonNegative(decimal value, string fieldName)
    {
        if (value < 0m)
        {
            throw new ValidationException($"{fieldName} cannot be negative.");
        }

        return value;
    }

    public static decimal Positive(decimal value, string fieldName)
    {
        if (value <= 0m)
        {
            throw new ValidationException($"{fieldName} must be greater than zero.");
        }

        return value;
    }

    public static TEnum DefinedEnum<TEnum>(TEnum value, string fieldName)
        where TEnum : struct, Enum
    {
        if (!Enum.IsDefined(value))
        {
            throw new ValidationException($"{fieldName} is invalid.");
        }

        return value;
    }

    public static TEnum? DefinedEnum<TEnum>(TEnum? value, string fieldName)
        where TEnum : struct, Enum
    {
        if (value.HasValue)
        {
            DefinedEnum(value.Value, fieldName);
        }

        return value;
    }

    public static PagedRequest Pagination(int pageNumber, int pageSize)
    {
        if (pageNumber < 1)
        {
            throw new ValidationException("PageNumber must be at least 1.");
        }

        if (pageSize is < 1 or > 100)
        {
            throw new ValidationException("PageSize must be between 1 and 100.");
        }

        return new PagedRequest(pageNumber, pageSize);
    }
}
