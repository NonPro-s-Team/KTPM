using Microsoft.Extensions.Options;

namespace RMS.Infrastructure.Email;

public sealed class FrontendOptionsValidator : IValidateOptions<FrontendOptions>
{
    public ValidateOptionsResult Validate(string? name, FrontendOptions options)
    {
        ArgumentNullException.ThrowIfNull(options);

        if (!Uri.TryCreate(options.BaseUrl, UriKind.Absolute, out _))
        {
            return ValidateOptionsResult.Fail(
                "Frontend:BaseUrl must be an absolute URL.");
        }

        return ValidateOptionsResult.Success;
    }
}
