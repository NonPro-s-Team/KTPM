namespace RMS.Application.Common.Interfaces.Security;

public interface ISecureTokenGenerator
{
    string GenerateToken();

    string Hash(string token);
}
