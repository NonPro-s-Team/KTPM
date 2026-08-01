using Microsoft.Extensions.Options;

namespace RMS.Infrastructure.Email;

public sealed class EmailOptionsValidator : IValidateOptions<EmailOptions>
{
    public ValidateOptionsResult Validate(string? name, EmailOptions options)
    {
        ArgumentNullException.ThrowIfNull(options);

        var failures = new List<string>();
        if (string.IsNullOrWhiteSpace(options.ConnectionString))
        {
            failures.Add("Email:ConnectionString is required.");
        }

        if (string.IsNullOrWhiteSpace(options.SenderAddress)
            || !options.SenderAddress.Contains('@', StringComparison.Ordinal))
        {
            failures.Add("Email:SenderAddress must be a valid email address.");
        }

        return failures.Count == 0
            ? ValidateOptionsResult.Success
            : ValidateOptionsResult.Fail(failures);
    }
}
