using RMS.Domain.Entities;
using RMS.Domain.Enums;
using RMS.Domain.ValueObjects;

namespace RMS.UnitTests.Application.TestDoubles;

internal static class DomainTestFactory
{
    public static readonly Guid AdminUserId =
        Guid.Parse("10000000-0000-0000-0000-000000000001");
    public static readonly Guid StaffUserId =
        Guid.Parse("10000000-0000-0000-0000-000000000002");
    public static readonly Guid TenantUserId =
        Guid.Parse("10000000-0000-0000-0000-000000000003");
    public static readonly Guid OtherTenantUserId =
        Guid.Parse("10000000-0000-0000-0000-000000000004");
    public static readonly Guid RecordedByUserId = StaffUserId;
    public static readonly DateTimeOffset Now =
        new(2026, 7, 30, 3, 0, 0, TimeSpan.Zero);

    public static User CreateUser(
        UserRole role = UserRole.Tenant,
        UserStatus status = UserStatus.Active,
        string username = "tenant",
        string passwordHash = "hashed-password")
    {
        var user = new User(username, passwordHash, role, Now.AddDays(-10));
        if (status == UserStatus.Locked)
        {
            user.Lock(Now.AddDays(-1));
        }
        else if (status == UserStatus.Inactive)
        {
            user.Deactivate(Now.AddDays(-1));
        }

        return user;
    }

    public static Tenant CreateTenant(
        Guid? userId = null,
        string fullName = "Nguyen Van A")
    {
        return new Tenant(
            userId ?? TenantUserId,
            fullName,
            "0900000000",
            "079000000001",
            Now.AddDays(-10));
    }

    public static Room CreateRoom(RoomStatus status = RoomStatus.Available)
    {
        var room = new Room(
            "A-101",
            3_500_000m,
            "Test room",
            Now.AddDays(-20));

        if (status == RoomStatus.Occupied)
        {
            room.ChangeStatus(
                RoomStatus.Occupied,
                hasActiveContract: true,
                Now.AddDays(-19));
        }
        else if (status != RoomStatus.Available)
        {
            room.ChangeStatus(
                status,
                hasActiveContract: false,
                Now.AddDays(-19));
        }

        return room;
    }

    public static RentalContract CreateContract(
        Guid roomId,
        Guid tenantId,
        ContractStatus status = ContractStatus.Draft,
        decimal monthlyRent = 3_500_000m)
    {
        var contract = new RentalContract(
            roomId,
            tenantId,
            new DateOnly(2026, 7, 1),
            new DateOnly(2027, 7, 1),
            monthlyRent,
            Now.AddDays(-15));

        if (status is ContractStatus.Active or ContractStatus.Terminated)
        {
            contract.Activate(Now.AddDays(-14));
        }

        if (status == ContractStatus.Terminated)
        {
            contract.Terminate(Now.AddDays(-1));
        }
        else if (status == ContractStatus.Cancelled)
        {
            contract.Cancel(Now.AddDays(-1));
        }

        return contract;
    }

    public static Invoice CreateInvoice(
        Guid contractId,
        InvoiceStatus status = InvoiceStatus.Draft,
        decimal rentAmount = 3_500_000m)
    {
        var invoice = new Invoice(
            contractId,
            new BillingPeriod(7, 2026),
            rentAmount,
            100m,
            120m,
            50m,
            55m,
            3_500m,
            15_000m,
            Now.AddDays(-5));

        if (status != InvoiceStatus.Draft)
        {
            invoice.Issue(Now.AddDays(-4));
        }

        if (status == InvoiceStatus.PartiallyPaid)
        {
            invoice.RegisterPayment(
                500_000m,
                "Partial",
                StaffUserId,
                Now.AddDays(-3));
        }
        else if (status == InvoiceStatus.Paid)
        {
            invoice.RegisterPayment(
                invoice.GetOutstandingAmount(),
                "Full",
                StaffUserId,
                Now.AddDays(-3));
        }
        else if (status == InvoiceStatus.Overdue)
        {
            invoice.MarkOverdue(Now.AddDays(-2));
        }

        return invoice;
    }

    public static MaintenanceRequest CreateMaintenanceRequest(
        Guid tenantId,
        Guid roomId,
        MaintenanceRequestStatus status = MaintenanceRequestStatus.Submitted)
    {
        var request = new MaintenanceRequest(
            tenantId,
            roomId,
            "Leaking faucet",
            "Water is leaking.",
            Now.AddDays(-3));

        if (status is MaintenanceRequestStatus.InProgress
            or MaintenanceRequestStatus.Resolved
            or MaintenanceRequestStatus.Closed)
        {
            request.StartProgress(StaffUserId, null, Now.AddDays(-2));
        }

        if (status is MaintenanceRequestStatus.Resolved
            or MaintenanceRequestStatus.Closed)
        {
            request.Resolve(
                StaffUserId,
                "Repair completed.",
                Now.AddDays(-1));
        }

        if (status == MaintenanceRequestStatus.Closed)
        {
            request.Close(StaffUserId, null, Now);
        }

        return request;
    }
}
