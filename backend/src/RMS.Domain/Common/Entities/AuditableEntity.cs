namespace RMS.Domain.Common.Entities;

public abstract class AuditableEntity : BaseEntity
{
    public DateTimeOffset CreatedAt { get; private set; }
    public DateTimeOffset? UpdatedAt { get; private set; }

    protected AuditableEntity()
    {
    }

    protected AuditableEntity(DateTimeOffset createdAt)
        : base(Guid.NewGuid())
    {
        CreatedAt = NormalizeTimestamp(createdAt);
    }

    protected void MarkUpdated(DateTimeOffset occurredAt)
    {
        UpdatedAt = NormalizeTimestamp(occurredAt);
    }

    protected static DateTimeOffset NormalizeTimestamp(DateTimeOffset timestamp) =>
        timestamp.ToUniversalTime();
}

