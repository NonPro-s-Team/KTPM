using FluentAssertions;
using RMS.Domain.Constants;
using RMS.Domain.Entities;
using RMS.Domain.Enums;
using RMS.Domain.Exceptions;

namespace RMS.UnitTests.Domain;

public class MaintenanceRequestTests
{
    private static readonly Guid TenantId =
        Guid.Parse("10000000-0000-0000-0000-000000000001");

    private static readonly Guid RoomId =
        Guid.Parse("20000000-0000-0000-0000-000000000002");

    private static readonly Guid UpdatedByUserId =
        Guid.Parse("30000000-0000-0000-0000-000000000003");

    private static readonly DateTimeOffset CreatedAt =
        new(2026, 1, 10, 1, 0, 0, TimeSpan.Zero);

    private static readonly DateTimeOffset StartedAt =
        new(2026, 1, 10, 2, 0, 0, TimeSpan.Zero);

    private static readonly DateTimeOffset ResolvedAt =
        new(2026, 1, 10, 3, 0, 0, TimeSpan.Zero);

    private static readonly DateTimeOffset ClosedAt =
        new(2026, 1, 10, 4, 0, 0, TimeSpan.Zero);

    [Fact]
    public void Constructor_ValidArguments_CreatesSubmittedRequest()
    {
        // Arrange
        const string title = "Leaking faucet";
        const string description = "The bathroom faucet is leaking.";

        // Act
        var request = new MaintenanceRequest(
            TenantId,
            RoomId,
            title,
            description,
            CreatedAt);

        // Assert
        request.Id.Should().NotBeEmpty();
        request.TenantId.Should().Be(TenantId);
        request.RoomId.Should().Be(RoomId);
        request.Title.Should().Be(title);
        request.Description.Should().Be(description);
        request.Status.Should().Be(MaintenanceRequestStatus.Submitted);
        request.CreatedAt.Should().Be(CreatedAt);
        request.StartedAt.Should().BeNull();
        request.ResolvedAt.Should().BeNull();
        request.ClosedAt.Should().BeNull();
        request.Updates.Should().BeEmpty();
    }

    [Fact]
    public void StartProgress_SubmittedRequest_ChangesStatus()
    {
        // Arrange
        var request = CreateRequest();

        // Act
        request.StartProgress(UpdatedByUserId, "Assigned to staff.", StartedAt);

        // Assert
        request.Status.Should().Be(MaintenanceRequestStatus.InProgress);
        request.StartedAt.Should().Be(StartedAt);
        request.UpdatedAt.Should().Be(StartedAt);
    }

    [Fact]
    public void Resolve_InProgressRequest_ChangesStatus()
    {
        // Arrange
        var request = CreateRequest();
        request.StartProgress(UpdatedByUserId, null, StartedAt);

        // Act
        request.Resolve(UpdatedByUserId, "Replaced the faucet seal.", ResolvedAt);

        // Assert
        request.Status.Should().Be(MaintenanceRequestStatus.Resolved);
        request.ResolvedAt.Should().Be(ResolvedAt);
        request.UpdatedAt.Should().Be(ResolvedAt);
    }

    [Fact]
    public void Close_ResolvedRequest_ChangesStatus()
    {
        // Arrange
        var request = CreateResolvedRequest();

        // Act
        request.Close(UpdatedByUserId, "Tenant confirmed the repair.", ClosedAt);

        // Assert
        request.Status.Should().Be(MaintenanceRequestStatus.Closed);
        request.ClosedAt.Should().Be(ClosedAt);
        request.UpdatedAt.Should().Be(ClosedAt);
    }

    [Fact]
    public void Resolve_SubmittedRequest_ThrowsDomainException()
    {
        // Arrange
        var request = CreateRequest();

        // Act
        Action act = () =>
            request.Resolve(UpdatedByUserId, "Repair completed.", ResolvedAt);

        // Assert
        var exception = act.Should().Throw<DomainException>().Which;
        exception.Code.Should().Be(DomainErrorCodes.InvalidState);
        exception.Message.Should().Contain("in-progress");
    }

    [Fact]
    public void Close_SubmittedRequest_ThrowsDomainException()
    {
        // Arrange
        var request = CreateRequest();

        // Act
        Action act = () =>
            request.Close(UpdatedByUserId, "Closing request.", ClosedAt);

        // Assert
        var exception = act.Should().Throw<DomainException>().Which;
        exception.Code.Should().Be(DomainErrorCodes.InvalidState);
        exception.Message.Should().Contain("resolved");
    }

    [Fact]
    public void Resolve_EmptyResolutionNote_ThrowsDomainException()
    {
        // Arrange
        var request = CreateRequest();
        request.StartProgress(UpdatedByUserId, null, StartedAt);

        // Act
        Action act = () => request.Resolve(UpdatedByUserId, "   ", ResolvedAt);

        // Assert
        var exception = act.Should().Throw<DomainException>().Which;
        exception.Code.Should().Be(DomainErrorCodes.RequiredField);
        exception.Message.Should().Contain("resolutionNote");
    }

    [Fact]
    public void StateTransitions_ValidSequence_AddUpdateForEachTransition()
    {
        // Arrange
        var request = CreateRequest();

        // Act
        request.StartProgress(UpdatedByUserId, "Work started.", StartedAt);
        request.Resolve(UpdatedByUserId, "Work completed.", ResolvedAt);
        request.Close(UpdatedByUserId, "Request verified.", ClosedAt);

        // Assert
        request.Updates.Should().HaveCount(3);
        var updates = request.Updates.ToArray();

        updates[0].MaintenanceRequestId.Should().Be(request.Id);
        updates[0].PreviousStatus.Should()
            .Be(MaintenanceRequestStatus.Submitted);
        updates[0].NewStatus.Should()
            .Be(MaintenanceRequestStatus.InProgress);
        updates[0].UpdatedByUserId.Should().Be(UpdatedByUserId);
        updates[0].OccurredAt.Should().Be(StartedAt);

        updates[1].MaintenanceRequestId.Should().Be(request.Id);
        updates[1].PreviousStatus.Should()
            .Be(MaintenanceRequestStatus.InProgress);
        updates[1].NewStatus.Should()
            .Be(MaintenanceRequestStatus.Resolved);
        updates[1].UpdatedByUserId.Should().Be(UpdatedByUserId);
        updates[1].OccurredAt.Should().Be(ResolvedAt);

        updates[2].MaintenanceRequestId.Should().Be(request.Id);
        updates[2].PreviousStatus.Should()
            .Be(MaintenanceRequestStatus.Resolved);
        updates[2].NewStatus.Should()
            .Be(MaintenanceRequestStatus.Closed);
        updates[2].UpdatedByUserId.Should().Be(UpdatedByUserId);
        updates[2].OccurredAt.Should().Be(ClosedAt);
    }

    [Fact]
    public void AddProgressNote_ClosedRequest_ThrowsDomainException()
    {
        // Arrange
        var request = CreateResolvedRequest();
        request.Close(UpdatedByUserId, null, ClosedAt);
        var laterAt = ClosedAt.AddMinutes(30);

        // Act
        Action act = () =>
            request.AddProgressNote(UpdatedByUserId, "Another update.", laterAt);

        // Assert
        var exception = act.Should().Throw<DomainException>().Which;
        exception.Code.Should().Be(DomainErrorCodes.InvalidState);
        exception.Message.Should().Contain("closed");
    }

    private static MaintenanceRequest CreateRequest() =>
        new(
            TenantId,
            RoomId,
            "Leaking faucet",
            "The bathroom faucet is leaking.",
            CreatedAt);

    private static MaintenanceRequest CreateResolvedRequest()
    {
        var request = CreateRequest();
        request.StartProgress(UpdatedByUserId, null, StartedAt);
        request.Resolve(UpdatedByUserId, "Replaced the faucet seal.", ResolvedAt);
        return request;
    }
}
