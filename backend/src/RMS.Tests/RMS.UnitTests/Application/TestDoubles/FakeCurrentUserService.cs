using RMS.Application.Common.Interfaces.Security;
using RMS.Domain.Enums;

namespace RMS.UnitTests.Application.TestDoubles;

internal sealed class FakeCurrentUserService : ICurrentUserService
{
    public bool IsAuthenticated { get; set; } = true;
    public Guid UserId { get; set; } = DomainTestFactory.AdminUserId;
    public UserRole Role { get; set; } = UserRole.Admin;
}
