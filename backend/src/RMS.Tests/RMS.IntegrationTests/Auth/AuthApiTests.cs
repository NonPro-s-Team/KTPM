using RMS.IntegrationTests.Fixtures;

namespace RMS.IntegrationTests.Auth;

public class AuthApiTests : IClassFixture<WebAppFactory>
{
    private readonly HttpClient _client;

    public AuthApiTests(WebAppFactory factory)
    {
        _client = factory.CreateClient();
    }

    [Fact]
    public async Task Login_WithInvalidCredentials_ReturnsUnauthorized()
    {
        // Arrange
        // TODO: Setup login request

        // Act
        // TODO: Call login endpoint

        // Assert
        Assert.True(true); // Placeholder
    }
}
