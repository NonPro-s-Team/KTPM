using RMS.Application.Common.Models;
using RMS.Domain.Entities;

namespace RMS.Application.Common.Interfaces.Security;

public interface IAccessTokenService
{
    AccessTokenResult Generate(User user);
}
