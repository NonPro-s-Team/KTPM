using RMS.Application.Common.Interfaces.Services;

namespace RMS.UnitTests.Application.TestDoubles;

internal sealed class FakeDateTimeProvider : IDateTimeProvider
{
    public DateTimeOffset UtcNow { get; set; } = DomainTestFactory.Now;
}
