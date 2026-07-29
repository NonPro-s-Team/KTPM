namespace RMS.Domain.Entities;

// Compatibility type retained until Infrastructure is migrated to MaintenanceRequest.
public sealed class RepairRequest : MaintenanceRequest
{
    private RepairRequest()
    {
    }

    public RepairRequest(
        Guid tenantId,
        Guid roomId,
        string title,
        string description,
        DateTimeOffset createdAt)
        : base(tenantId, roomId, title, description, createdAt)
    {
    }
}
