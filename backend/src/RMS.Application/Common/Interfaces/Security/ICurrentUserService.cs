using RMS.Domain.Enums;

namespace RMS.Application.Common.Interfaces.Security;

public interface ICurrentUserService
{
    bool IsAuthenticated { get; }
    Guid UserId { get; }
    UserRole Role { get; }
}
