namespace RMS.Domain.Common.Entities;

public abstract class BaseEntity : IEquatable<BaseEntity>
{
    public Guid Id { get; private set; }

    protected BaseEntity()
    {
    }

    protected BaseEntity(Guid id)
    {
        if (id == Guid.Empty)
        {
            throw new ArgumentException("Entity ID cannot be empty.", nameof(id));
        }

        Id = id;
    }

    public bool Equals(BaseEntity? other)
    {
        if (ReferenceEquals(this, other))
        {
            return true;
        }

        if (other is null || GetType() != other.GetType())
        {
            return false;
        }

        return Id != Guid.Empty && Id == other.Id;
    }

    public override bool Equals(object? obj) => Equals(obj as BaseEntity);

    public override int GetHashCode() => Id == Guid.Empty
        ? base.GetHashCode()
        : HashCode.Combine(GetType(), Id);

    public static bool operator ==(BaseEntity? left, BaseEntity? right) =>
        Equals(left, right);

    public static bool operator !=(BaseEntity? left, BaseEntity? right) =>
        !Equals(left, right);
}

