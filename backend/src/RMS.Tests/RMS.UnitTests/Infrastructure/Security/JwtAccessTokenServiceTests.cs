using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using FluentAssertions;
using Microsoft.Extensions.Options;
using RMS.Application.Common.Interfaces.Services;
using RMS.Domain.Entities;
using RMS.Domain.Enums;
using RMS.Infrastructure.Security;

namespace RMS.UnitTests.Infrastructure.Security;

public sealed class JwtAccessTokenServiceTests
{
    private static readonly DateTimeOffset Now =
        new(2026, 7, 30, 8, 0, 0, TimeSpan.Zero);

    [Fact]
    public void Generate_ValidOptions_ContainsExpectedClaimsAndLifetime()
    {
        var options = new JwtOptions
        {
            Issuer = "RMS.Tests",
            Audience = "RMS.Client.Tests",
            Key = "A-development-test-key-with-at-least-32-bytes",
            ExpirationMinutes = 60
        };
        var user = new User(
            "test-admin",
            "not-used-by-token-service",
            UserRole.Admin,
            Now);
        var sut = new JwtAccessTokenService(
            Options.Create(options),
            new FakeDateTimeProvider(Now));

        var result = sut.Generate(user);
        var token = new JwtSecurityTokenHandler().ReadJwtToken(
            result.AccessToken);

        result.UserId.Should().Be(user.Id);
        result.Username.Should().Be(user.Username);
        result.Role.Should().Be(user.Role);
        result.ExpiresAt.Should().Be(Now.AddMinutes(60));
        token.Issuer.Should().Be(options.Issuer);
        token.Audiences.Should().ContainSingle(options.Audience);
        token.Claims.Should().Contain(
            claim =>
                claim.Type == ClaimTypes.NameIdentifier
                && claim.Value == user.Id.ToString());
        token.Claims.Should().Contain(
            claim =>
                claim.Type == ClaimTypes.Name
                && claim.Value == user.Username);
        token.Claims.Should().Contain(
            claim =>
                claim.Type == ClaimTypes.Role
                && claim.Value == user.Role.ToString());
        token.Claims.Should().Contain(
            claim =>
                claim.Type == JwtRegisteredClaimNames.Sub
                && claim.Value == user.Id.ToString());
        token.Claims.Should().Contain(
            claim => claim.Type == JwtRegisteredClaimNames.Jti);
        token.ValidTo.Should().Be(Now.AddMinutes(60).UtcDateTime);
        (token.ValidTo - token.ValidFrom)
            .Should()
            .BeLessThanOrEqualTo(TimeSpan.FromHours(24));
    }

    [Theory]
    [InlineData("", "audience", "12345678901234567890123456789012", 60)]
    [InlineData("issuer", "", "12345678901234567890123456789012", 60)]
    [InlineData("issuer", "audience", "too-short", 60)]
    [InlineData("issuer", "audience", "12345678901234567890123456789012", 0)]
    [InlineData("issuer", "audience", "12345678901234567890123456789012", 1441)]
    public void Validate_InvalidOptions_Fails(
        string issuer,
        string audience,
        string key,
        int expirationMinutes)
    {
        var options = new JwtOptions
        {
            Issuer = issuer,
            Audience = audience,
            Key = key,
            ExpirationMinutes = expirationMinutes
        };

        var result = new JwtOptionsValidator().Validate(null, options);

        result.Failed.Should().BeTrue();
    }

    [Fact]
    public void Validate_ValidOptions_Succeeds()
    {
        var options = new JwtOptions
        {
            Issuer = "issuer",
            Audience = "audience",
            Key = Encoding.UTF8.GetString(
                Enumerable.Repeat((byte)'a', 32).ToArray()),
            ExpirationMinutes = JwtOptions.MaximumExpirationMinutes
        };

        new JwtOptionsValidator()
            .Validate(null, options)
            .Succeeded
            .Should()
            .BeTrue();
    }

    private sealed class FakeDateTimeProvider : IDateTimeProvider
    {
        public FakeDateTimeProvider(DateTimeOffset utcNow)
        {
            UtcNow = utcNow;
        }

        public DateTimeOffset UtcNow { get; }
    }
}
