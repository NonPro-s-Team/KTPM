using RMS.IntegrationTests.Fixtures;

namespace RMS.IntegrationTests.Rooms;

public class RoomsApiTests : IClassFixture<WebAppFactory>
{
    private readonly HttpClient _client;

    public RoomsApiTests(WebAppFactory factory)
    {
        _client = factory.CreateClient();
    }

    [Fact]
    public async Task GetRooms_ReturnsSuccessStatusCode()
    {
        // Arrange
        // TODO: Setup test data

        // Act
        // TODO: Call rooms endpoint

        // Assert
        Assert.True(true); // Placeholder
    }
}
