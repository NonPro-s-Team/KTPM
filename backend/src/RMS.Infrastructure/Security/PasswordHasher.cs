using RMS.Application.Common.Interfaces.Security;

namespace RMS.Infrastructure.Security;

public sealed class PasswordHasher : IPasswordHasher
{
    public const int WorkFactor = 12;

    public string Hash(string password)
    {
        if (string.IsNullOrWhiteSpace(password))
        {
            throw new ArgumentException(
                "Password cannot be empty.",
                nameof(password));
        }

        return BCrypt.Net.BCrypt.HashPassword(password, WorkFactor);
    }

    public bool Verify(string password, string passwordHash)
    {
        if (string.IsNullOrEmpty(password)
            || string.IsNullOrWhiteSpace(passwordHash)
            || passwordHash.Length != 60
            || !passwordHash.StartsWith("$2", StringComparison.Ordinal))
        {
            return false;
        }

        try
        {
            return BCrypt.Net.BCrypt.Verify(password, passwordHash);
        }
        catch (BCrypt.Net.SaltParseException)
        {
            return false;
        }
        catch (ArgumentException)
        {
            return false;
        }
    }
}
