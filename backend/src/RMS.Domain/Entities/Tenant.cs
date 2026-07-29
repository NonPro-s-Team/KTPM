using RMS.Domain.Common;
using RMS.Domain.Common.Entities;

namespace RMS.Domain.Entities;

public class Tenant : AuditableEntity
{
    public const int FullNameMaxLength = 200;
    public const int PhoneNumberMaxLength = 20;
    public const int CitizenIdMaxLength = 50;

    private readonly List<RentalContract> _contracts = new();
    private readonly List<MaintenanceRequest> _maintenanceRequests = new();

    private Tenant()
    {
        FullName = string.Empty;
        PhoneNumber = string.Empty;
        CitizenId = string.Empty;
        User = null!;
    }

    public Tenant(
        Guid userId,
        string fullName,
        string phoneNumber,
        string citizenId,
        DateTimeOffset createdAt)
        : base(createdAt)
    {
        UserId = Guard.Required(userId, nameof(UserId));
        FullName = Guard.Required(
            fullName,
            nameof(FullName),
            FullNameMaxLength);
        PhoneNumber = Guard.Required(
            phoneNumber,
            nameof(PhoneNumber),
            PhoneNumberMaxLength);
        CitizenId = Guard.Required(
            citizenId,
            nameof(CitizenId),
            CitizenIdMaxLength);
        User = null!;
    }

    public Tenant(
        Guid userId,
        string fullName,
        string phoneNumber,
        string citizenId)
        : this(
            userId,
            fullName,
            phoneNumber,
            citizenId,
            DateTimeOffset.UtcNow)
    {
    }

    public Guid UserId { get; private set; }
    public string FullName { get; private set; }
    public string PhoneNumber { get; private set; }
    public string CitizenId { get; private set; }
    public User User { get; private set; }
    public IReadOnlyCollection<RentalContract> Contracts =>
        _contracts.AsReadOnly();
    public IReadOnlyCollection<MaintenanceRequest> MaintenanceRequests =>
        _maintenanceRequests.AsReadOnly();

    public void UpdateProfile(
        string fullName,
        string phoneNumber,
        string citizenId,
        DateTimeOffset updatedAt)
    {
        var validatedFullName = Guard.Required(
            fullName,
            nameof(fullName),
            FullNameMaxLength);
        var validatedPhoneNumber = Guard.Required(
            phoneNumber,
            nameof(phoneNumber),
            PhoneNumberMaxLength);
        var validatedCitizenId = Guard.Required(
            citizenId,
            nameof(citizenId),
            CitizenIdMaxLength);

        FullName = validatedFullName;
        PhoneNumber = validatedPhoneNumber;
        CitizenId = validatedCitizenId;
        MarkUpdated(updatedAt);
    }
}
