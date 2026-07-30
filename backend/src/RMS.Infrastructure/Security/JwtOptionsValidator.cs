using System.Text;
using Microsoft.Extensions.Options;

namespace RMS.Infrastructure.Security;

public sealed class JwtOptionsValidator : IValidateOptions<JwtOptions>
{
    public ValidateOptionsResult Validate(string? name, JwtOptions options)
    {
        ArgumentNullException.ThrowIfNull(options);

        var failures = new List<string>();
        if (string.IsNullOrWhiteSpace(options.Issuer))
        {
            failures.Add("Jwt:Issuer is required.");
        }

        if (string.IsNullOrWhiteSpace(options.Audience))
        {
            failures.Add("Jwt:Audience is required.");
        }

        if (string.IsNullOrWhiteSpace(options.Key))
        {
            failures.Add("Jwt:Key is required.");
        }
        else if (Encoding.UTF8.GetByteCount(options.Key)
            < JwtOptions.MinimumKeyBytes)
        {
            failures.Add(
                $"Jwt:Key must contain at least {JwtOptions.MinimumKeyBytes} UTF-8 bytes.");
        }

        if (options.ExpirationMinutes is <= 0
            or > JwtOptions.MaximumExpirationMinutes)
        {
            failures.Add(
                $"Jwt:ExpirationMinutes must be between 1 and {JwtOptions.MaximumExpirationMinutes}.");
        }

        return failures.Count == 0
            ? ValidateOptionsResult.Success
            : ValidateOptionsResult.Fail(failures);
    }
}
