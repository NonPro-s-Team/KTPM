namespace RMS.IntegrationTests.Fixtures;

public abstract class SqlServerIntegrationTestBase : IAsyncLifetime
{
    protected SqlServerIntegrationTestBase(
        SqlServerContainerFixture fixture)
    {
        Fixture = fixture;
    }

    protected SqlServerContainerFixture Fixture { get; }

    public Task InitializeAsync() => Fixture.ResetAsync();

    public Task DisposeAsync() => Task.CompletedTask;
}
