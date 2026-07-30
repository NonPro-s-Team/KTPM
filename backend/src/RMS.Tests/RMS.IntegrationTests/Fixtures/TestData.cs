using RMS.Domain.Entities;
using RMS.Domain.Enums;
using RMS.Domain.ValueObjects;
using RMS.Infrastructure.Data;

namespace RMS.IntegrationTests.Fixtures;

internal static class TestData
{
    public static readonly DateTimeOffset Now =
        new(2026, 7, 30, 8, 0, 0, TimeSpan.Zero);

    public static User User(
        UserRole role = UserRole.Admin,
        string? username = null) =>
        new(
            username ?? $"user-{Guid.NewGuid():N}",
            "$2a$12$123456789012345678901uE4XrXz6gXzuJXv.q5FJQZpMUIk3m",
            role,
            Now);

    public static Room Room(string? roomNumber = null) =>
        new(
            roomNumber ?? $"room-{Guid.NewGuid():N}",
            3_500_000m,
            "Integration test room.",
            Now);

    public static Tenant Tenant(User user) =>
        new(
            user.Id,
            "Integration Tenant",
            "0900000000",
            $"CID-{Guid.NewGuid():N}",
            Now);

    public static RentalContract Contract(
        Room room,
        Tenant tenant,
        bool active = false,
        bool occupyRoom = true)
    {
        var contract = new RentalContract(
            room.Id,
            tenant.Id,
            new DateOnly(2026, 1, 1),
            new DateOnly(2027, 1, 1),
            room.MonthlyRent,
            Now);
        if (active)
        {
            contract.Activate(Now);
            if (occupyRoom && room.Status == RoomStatus.Available)
            {
                room.ChangeStatus(
                    RoomStatus.Occupied,
                    hasActiveContract: true,
                    Now);
            }
        }

        return contract;
    }

    public static Invoice Invoice(
        RentalContract contract,
        int month = 7,
        int year = 2026,
        bool issued = false)
    {
        var invoice = new Invoice(
            contract.Id,
            new BillingPeriod(month, year),
            contract.MonthlyRent,
            100m,
            120m,
            10m,
            15m,
            3_500m,
            15_000m,
            Now);
        if (issued)
        {
            invoice.Issue(Now);
        }

        return invoice;
    }

    public static async Task<ContractGraph> SeedActiveContractGraphAsync(
        AppDbContext context,
        string? roomNumber = null)
    {
        var tenantUser = User(UserRole.Tenant);
        var tenant = Tenant(tenantUser);
        var room = Room(roomNumber);
        var contract = Contract(room, tenant, active: true);

        context.AddRange(tenantUser, tenant, room, contract);
        await context.SaveChangesAsync();
        return new ContractGraph(tenantUser, tenant, room, contract);
    }

    public static async Task<InvoiceGraph> SeedIssuedInvoiceGraphAsync(
        AppDbContext context,
        int month = 7,
        int year = 2026)
    {
        var contractGraph = await SeedActiveContractGraphAsync(context);
        var recorder = User(UserRole.Admin);
        var invoice = Invoice(
            contractGraph.Contract,
            month,
            year,
            issued: true);

        context.AddRange(recorder, invoice);
        await context.SaveChangesAsync();
        return new InvoiceGraph(contractGraph, recorder, invoice);
    }
}

internal sealed record ContractGraph(
    User TenantUser,
    Tenant Tenant,
    Room Room,
    RentalContract Contract);

internal sealed record InvoiceGraph(
    ContractGraph ContractGraph,
    User Recorder,
    Invoice Invoice);
