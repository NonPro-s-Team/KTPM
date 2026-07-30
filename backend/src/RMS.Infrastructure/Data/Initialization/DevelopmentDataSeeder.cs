using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Options;
using RMS.Application.Common.Interfaces.Security;
using RMS.Application.Common.Interfaces.Services;
using RMS.Domain.Entities;
using RMS.Domain.Enums;
using RMS.Domain.ValueObjects;

namespace RMS.Infrastructure.Data.Initialization;

public sealed class DevelopmentDataSeeder
{
    private const string TenantFullName = "Development Tenant";
    private const string TenantPhone = "0900000000";
    private const string TenantCitizenId = "DEV-CITIZEN-ID";
    private const string Tenant2FullName = "Development Tenant Two";
    private const string Tenant2Phone = "0900000001";
    private const string Tenant2CitizenId = "DEV-CITIZEN-ID-2";

    private readonly AppDbContext _dbContext;
    private readonly IPasswordHasher _passwordHasher;
    private readonly IDateTimeProvider _dateTimeProvider;
    private readonly IHostEnvironment _environment;
    private readonly SeedDataOptions _options;

    public DevelopmentDataSeeder(
        AppDbContext dbContext,
        IPasswordHasher passwordHasher,
        IDateTimeProvider dateTimeProvider,
        IHostEnvironment environment,
        IOptions<SeedDataOptions> options)
    {
        _dbContext = dbContext;
        _passwordHasher = passwordHasher;
        _dateTimeProvider = dateTimeProvider;
        _environment = environment;
        _options = options.Value;
    }

    public async Task SeedAsync(
        CancellationToken cancellationToken = default)
    {
        if (!_environment.IsDevelopment())
        {
            throw new InvalidOperationException(
                "Development seed data can run only when the host "
                + "environment is Development.");
        }

        if (!_options.Enabled)
        {
            return;
        }

        ValidateConfiguration();
        var now = _dateTimeProvider.UtcNow;

        var admin = await GetOrCreateUserAsync(
            _options.AdminUsername,
            _options.AdminPassword,
            UserRole.Admin,
            now,
            cancellationToken);
        _ = await GetOrCreateUserAsync(
            _options.StaffUsername,
            _options.StaffPassword,
            UserRole.Staff,
            now,
            cancellationToken);
        var tenantUser = await GetOrCreateUserAsync(
            _options.TenantUsername,
            _options.TenantPassword,
            UserRole.Tenant,
            now,
            cancellationToken);
        var tenant = await GetOrCreateTenantAsync(
            tenantUser,
            TenantFullName,
            TenantPhone,
            TenantCitizenId,
            now,
            cancellationToken);
        var tenant2User = await GetOrCreateUserAsync(
            _options.Tenant2Username,
            _options.Tenant2Password,
            UserRole.Tenant,
            now,
            cancellationToken);
        var tenant2 = await GetOrCreateTenantAsync(
            tenant2User,
            Tenant2FullName,
            Tenant2Phone,
            Tenant2CitizenId,
            now,
            cancellationToken);

        var availableRoom = await GetOrCreateRoomAsync(
            "DEV-AVAILABLE",
            3_000_000m,
            RoomStatus.Available,
            now,
            cancellationToken);
        var occupiedRoom = await GetOrCreateRoomAsync(
            "DEV-OCCUPIED",
            3_500_000m,
            RoomStatus.Available,
            now,
            cancellationToken);
        _ = await GetOrCreateRoomAsync(
            "DEV-MAINTENANCE",
            2_800_000m,
            RoomStatus.Maintenance,
            now,
            cancellationToken);
        _ = await GetOrCreateRoomAsync(
            "DEV-INACTIVE",
            2_500_000m,
            RoomStatus.Inactive,
            now,
            cancellationToken);

        var contract = await GetOrCreateActiveContractAsync(
            occupiedRoom,
            tenant,
            now,
            cancellationToken);
        _ = await GetOrCreateDraftContractAsync(
            availableRoom,
            tenant2,
            now,
            cancellationToken);
        await CreateInvoicesIfMissingAsync(
            contract,
            admin,
            now,
            cancellationToken);
        await CreateMaintenanceRequestIfMissingAsync(
            tenant,
            occupiedRoom,
            now,
            cancellationToken);

        await _dbContext.SaveChangesAsync(cancellationToken);
    }

    private async Task<User> GetOrCreateUserAsync(
        string username,
        string password,
        UserRole role,
        DateTimeOffset now,
        CancellationToken cancellationToken)
    {
        var existing = await _dbContext.Users.SingleOrDefaultAsync(
            user => user.Username == username,
            cancellationToken);
        if (existing is not null)
        {
            return existing;
        }

        var user = new User(
            username,
            _passwordHasher.Hash(password),
            role,
            now);
        _dbContext.Users.Add(user);
        return user;
    }

    private async Task<Tenant> GetOrCreateTenantAsync(
        User tenantUser,
        string fullName,
        string phoneNumber,
        string citizenId,
        DateTimeOffset now,
        CancellationToken cancellationToken)
    {
        var existing = await _dbContext.Tenants.SingleOrDefaultAsync(
            tenant => tenant.UserId == tenantUser.Id,
            cancellationToken);
        if (existing is not null)
        {
            return existing;
        }

        var tenant = new Tenant(
            tenantUser.Id,
            fullName,
            phoneNumber,
            citizenId,
            now);
        _dbContext.Tenants.Add(tenant);
        return tenant;
    }

    private async Task<Room> GetOrCreateRoomAsync(
        string roomNumber,
        decimal monthlyRent,
        RoomStatus targetStatus,
        DateTimeOffset now,
        CancellationToken cancellationToken)
    {
        var existing = await _dbContext.Rooms.SingleOrDefaultAsync(
            room => room.RoomNumber == roomNumber,
            cancellationToken);
        if (existing is not null)
        {
            return existing;
        }

        var room = new Room(
            roomNumber,
            monthlyRent,
            "Safe development seed data.",
            now);
        if (targetStatus != RoomStatus.Available)
        {
            room.ChangeStatus(
                targetStatus,
                hasActiveContract: false,
                now);
        }

        _dbContext.Rooms.Add(room);
        return room;
    }

    private async Task<RentalContract> GetOrCreateActiveContractAsync(
        Room room,
        Tenant tenant,
        DateTimeOffset now,
        CancellationToken cancellationToken)
    {
        var existing = await _dbContext.RentalContracts
            .SingleOrDefaultAsync(
                contract =>
                    contract.RoomId == room.Id
                    && contract.Status == ContractStatus.Active,
                cancellationToken);
        if (existing is not null)
        {
            return existing;
        }

        var startDate = DateOnly.FromDateTime(now.UtcDateTime).AddMonths(-1);
        var contract = new RentalContract(
            room.Id,
            tenant.Id,
            startDate,
            startDate.AddYears(1),
            room.MonthlyRent,
            now);
        contract.Activate(now);
        room.ChangeStatus(
            RoomStatus.Occupied,
            hasActiveContract: true,
            now);
        _dbContext.RentalContracts.Add(contract);
        return contract;
    }

    private async Task<RentalContract> GetOrCreateDraftContractAsync(
        Room room,
        Tenant tenant,
        DateTimeOffset now,
        CancellationToken cancellationToken)
    {
        var existing = await _dbContext.RentalContracts
            .SingleOrDefaultAsync(
                contract =>
                    contract.RoomId == room.Id
                    && contract.Status == ContractStatus.Draft,
                cancellationToken);
        if (existing is not null)
        {
            return existing;
        }

        var startDate = DateOnly.FromDateTime(now.UtcDateTime).AddMonths(1);
        var contract = new RentalContract(
            room.Id,
            tenant.Id,
            startDate,
            startDate.AddYears(1),
            room.MonthlyRent,
            now);
        _dbContext.RentalContracts.Add(contract);
        return contract;
    }

    private async Task CreateInvoicesIfMissingAsync(
        RentalContract contract,
        User admin,
        DateTimeOffset now,
        CancellationToken cancellationToken)
    {
        var currentPeriod = new BillingPeriod(now.Month, now.Year);
        var previousMonth = now.AddMonths(-1);
        var previousPeriod = new BillingPeriod(
            previousMonth.Month,
            previousMonth.Year);

        if (!await InvoiceExistsAsync(
                contract.Id,
                currentPeriod,
                cancellationToken))
        {
            var issuedInvoice = CreateInvoice(contract, currentPeriod, now);
            issuedInvoice.Issue(now);
            _dbContext.Invoices.Add(issuedInvoice);
        }

        if (!await InvoiceExistsAsync(
                contract.Id,
                previousPeriod,
                cancellationToken))
        {
            var partiallyPaidInvoice =
                CreateInvoice(contract, previousPeriod, now);
            partiallyPaidInvoice.Issue(now);
            partiallyPaidInvoice.RegisterPayment(
                100_000m,
                "Development seed payment.",
                admin.Id,
                now);
            _dbContext.Invoices.Add(partiallyPaidInvoice);
        }
    }

    private Task<bool> InvoiceExistsAsync(
        Guid contractId,
        BillingPeriod period,
        CancellationToken cancellationToken) =>
        _dbContext.Invoices.AnyAsync(
            invoice =>
                invoice.ContractId == contractId
                && invoice.BillingPeriod == period,
            cancellationToken);

    private static Invoice CreateInvoice(
        RentalContract contract,
        BillingPeriod period,
        DateTimeOffset now) =>
        new(
            contract.Id,
            period,
            contract.MonthlyRent,
            100m,
            125m,
            10m,
            15m,
            3_500m,
            15_000m,
            now);

    private async Task CreateMaintenanceRequestIfMissingAsync(
        Tenant tenant,
        Room room,
        DateTimeOffset now,
        CancellationToken cancellationToken)
    {
        var exists = await _dbContext.MaintenanceRequests.AnyAsync(
            request =>
                request.TenantId == tenant.Id
                && request.RoomId == room.Id
                && request.Title == "Development maintenance request",
            cancellationToken);
        if (!exists)
        {
            _dbContext.MaintenanceRequests.Add(
                new MaintenanceRequest(
                    tenant.Id,
                    room.Id,
                    "Development maintenance request",
                    "Safe development seed data.",
                    now));
        }
    }

    private void ValidateConfiguration()
    {
        var missing = new List<string>();
        AddIfMissing(missing, _options.AdminUsername, "AdminUsername");
        AddIfMissing(missing, _options.AdminPassword, "AdminPassword");
        AddIfMissing(missing, _options.StaffUsername, "StaffUsername");
        AddIfMissing(missing, _options.StaffPassword, "StaffPassword");
        AddIfMissing(missing, _options.TenantUsername, "TenantUsername");
        AddIfMissing(missing, _options.TenantPassword, "TenantPassword");
        AddIfMissing(missing, _options.Tenant2Username, "Tenant2Username");
        AddIfMissing(missing, _options.Tenant2Password, "Tenant2Password");
        if (missing.Count > 0)
        {
            throw new InvalidOperationException(
                "SeedData is enabled but these values are missing: "
                + string.Join(", ", missing.Select(
                    name => $"SeedData:{name}"))
                + ".");
        }
    }

    private static void AddIfMissing(
        ICollection<string> missing,
        string value,
        string name)
    {
        if (string.IsNullOrWhiteSpace(value))
        {
            missing.Add(name);
        }
    }
}
