using FluentAssertions;
using Moq;
using RMS.Application.Common.Exceptions;
using RMS.Application.Common.Interfaces.Persistence;
using RMS.Application.Dashboard;
using RMS.Domain.Enums;
using RMS.UnitTests.Application.TestDoubles;

namespace RMS.UnitTests.Application.Dashboard;

public class DashboardServiceTests
{
    private readonly Mock<IDashboardReadRepository> _dashboard = new();
    private readonly FakeCurrentUserService _currentUser = new();
    private readonly DashboardService _service;

    public DashboardServiceTests()
    {
        _dashboard
            .Setup(repository => repository.GetSummaryAsync(
                It.IsAny<CancellationToken>()))
            .ReturnsAsync(new DashboardSummaryData(
                TotalRooms: 20,
                OccupiedRooms: 12,
                ActiveMaintenanceRequests: 3,
                UnpaidInvoices: 5));
        _service = new DashboardService(
            _dashboard.Object,
            _currentUser);
    }

    [Fact]
    public async Task GetSummary_Admin_ReturnsProjection()
    {
        // Arrange
        _currentUser.Role = UserRole.Admin;

        // Act
        var response = await _service.GetSummaryAsync();

        // Assert
        response.TotalRooms.Should().Be(20);
        response.OccupiedRooms.Should().Be(12);
        response.ActiveMaintenanceRequests.Should().Be(3);
        response.UnpaidInvoices.Should().Be(5);
    }

    [Fact]
    public async Task GetSummary_Staff_ReturnsProjection()
    {
        // Arrange
        _currentUser.Role = UserRole.Staff;

        // Act
        var response = await _service.GetSummaryAsync();

        // Assert
        response.TotalRooms.Should().Be(20);
        _dashboard.Verify(
            repository => repository.GetSummaryAsync(
                It.IsAny<CancellationToken>()),
            Times.Once);
    }

    [Fact]
    public async Task GetSummary_Tenant_IsForbidden()
    {
        // Arrange
        _currentUser.Role = UserRole.Tenant;
        _currentUser.UserId = DomainTestFactory.TenantUserId;

        // Act
        Func<Task> act = () => _service.GetSummaryAsync();

        // Assert
        var exception = await act.Should()
            .ThrowAsync<ForbiddenAccessException>();
        exception.Which.Code.Should().Be(ApplicationErrorCodes.Forbidden);
        _dashboard.Verify(
            repository => repository.GetSummaryAsync(
                It.IsAny<CancellationToken>()),
            Times.Never);
    }
}
