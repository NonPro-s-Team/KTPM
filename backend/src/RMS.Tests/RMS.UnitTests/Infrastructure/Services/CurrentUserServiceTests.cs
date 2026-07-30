using System.Security.Claims;
using FluentAssertions;
using Microsoft.AspNetCore.Http;
using RMS.Domain.Enums;
using RMS.Infrastructure.Services;

namespace RMS.UnitTests.Infrastructure.Services;

public sealed class CurrentUserServiceTests
{
    [Fact]
    public void AuthenticatedContext_ReadsUserIdAndRole()
    {
        var userId = Guid.NewGuid();
        var context = CreateAuthenticatedContext(
            new Claim(ClaimTypes.NameIdentifier, userId.ToString()),
            new Claim(ClaimTypes.Role, UserRole.Staff.ToString()));
        var sut = new CurrentUserService(
            new HttpContextAccessor { HttpContext = context });

        sut.IsAuthenticated.Should().BeTrue();
        sut.UserId.Should().Be(userId);
        sut.Role.Should().Be(UserRole.Staff);
    }

    [Fact]
    public void MissingHttpContext_ReturnsSafeDefaults()
    {
        var sut = new CurrentUserService(new HttpContextAccessor());

        sut.IsAuthenticated.Should().BeFalse();
        sut.UserId.Should().Be(Guid.Empty);
        sut.Role.Should().Be(default);
    }

    [Fact]
    public void InvalidUserId_ReturnsEmptyGuid()
    {
        var context = CreateAuthenticatedContext(
            new Claim(ClaimTypes.NameIdentifier, "not-a-guid"));
        var sut = new CurrentUserService(
            new HttpContextAccessor { HttpContext = context });

        sut.UserId.Should().Be(Guid.Empty);
    }

    [Theory]
    [InlineData("not-a-role")]
    [InlineData("999")]
    public void InvalidRole_ReturnsDefault(string role)
    {
        var context = CreateAuthenticatedContext(
            new Claim(ClaimTypes.Role, role));
        var sut = new CurrentUserService(
            new HttpContextAccessor { HttpContext = context });

        sut.Role.Should().Be(default);
    }

    private static DefaultHttpContext CreateAuthenticatedContext(
        params Claim[] claims)
    {
        var context = new DefaultHttpContext();
        context.User = new ClaimsPrincipal(
            new ClaimsIdentity(claims, authenticationType: "Test"));
        return context;
    }
}
