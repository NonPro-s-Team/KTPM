using RMS.Application.Common.Exceptions;
using RMS.Application.Common.Interfaces.Persistence;
using RMS.Application.Common.Interfaces.Security;
using RMS.Application.Common.Interfaces.Services;
using RMS.Application.Common.Mapping;
using RMS.Application.Common.Models;
using RMS.Application.Common.Security;
using RMS.Application.Common.Validation;
using RMS.Application.Invoices.Models;
using RMS.Domain.Constants;
using RMS.Domain.Entities;
using RMS.Domain.Enums;
using RMS.Domain.ValueObjects;

namespace RMS.Application.Invoices;

public sealed class InvoiceService : IInvoiceService
{
    private readonly IInvoiceRepository _invoiceRepository;
    private readonly IRentalContractRepository _contractRepository;
    private readonly ITenantRepository _tenantRepository;
    private readonly ICurrentUserService _currentUser;
    private readonly IDateTimeProvider _dateTimeProvider;
    private readonly IUnitOfWork _unitOfWork;

    public InvoiceService(
        IInvoiceRepository invoiceRepository,
        IRentalContractRepository contractRepository,
        ITenantRepository tenantRepository,
        ICurrentUserService currentUser,
        IDateTimeProvider dateTimeProvider,
        IUnitOfWork unitOfWork)
    {
        _invoiceRepository = invoiceRepository;
        _contractRepository = contractRepository;
        _tenantRepository = tenantRepository;
        _currentUser = currentUser;
        _dateTimeProvider = dateTimeProvider;
        _unitOfWork = unitOfWork;
    }

    public async Task<InvoiceResponse> CreateInvoiceAsync(
        CreateInvoiceRequest request,
        CancellationToken cancellationToken = default)
    {
        AuthorizationGuard.EnsureAdminOrStaff(_currentUser);
        request = RequestGuard.NotNull(request, nameof(request));
        var contractId = RequestGuard.Required(
            request.ContractId,
            nameof(request.ContractId));
        RequestGuard.NonNegative(
            request.ElectricityUnitPrice,
            nameof(request.ElectricityUnitPrice));
        RequestGuard.NonNegative(
            request.WaterUnitPrice,
            nameof(request.WaterUnitPrice));

        var contract = await _contractRepository.GetByIdAsync(
            contractId,
            cancellationToken)
            ?? throw new NotFoundException("Rental contract", contractId);

        if (contract.Status != ContractStatus.Active)
        {
            throw new ConflictException(
                ApplicationErrorCodes.ContractNotActive,
                "An invoice can be created only for an active rental contract.");
        }

        var billingPeriod = new BillingPeriod(
            request.BillingMonth,
            request.BillingYear);

        if (await _invoiceRepository.ExistsForContractAndPeriodAsync(
                contract.Id,
                billingPeriod,
                cancellationToken))
        {
            throw new ConflictException(
                BusinessRuleCodes.SingleInvoicePerBillingPeriod,
                "An invoice already exists for this contract and billing period.");
        }

        var invoice = new Invoice(
            contract.Id,
            billingPeriod,
            contract.MonthlyRent,
            request.ElectricityStartReading,
            request.ElectricityEndReading,
            request.WaterStartReading,
            request.WaterEndReading,
            request.ElectricityUnitPrice,
            request.WaterUnitPrice,
            _dateTimeProvider.UtcNow);

        _invoiceRepository.Add(invoice);
        await _unitOfWork.SaveChangesAsync(cancellationToken);
        return invoice.ToResponse();
    }

    public async Task<InvoiceResponse> UpdateDraftInvoiceAsync(
        Guid invoiceId,
        UpdateDraftInvoiceRequest request,
        CancellationToken cancellationToken = default)
    {
        AuthorizationGuard.EnsureAdminOrStaff(_currentUser);
        invoiceId = RequestGuard.Required(invoiceId, nameof(invoiceId));
        request = RequestGuard.NotNull(request, nameof(request));

        var invoice = await LoadInvoiceAsync(invoiceId, cancellationToken);
        invoice.UpdateDraftReadingsAndPrices(
            RequestGuard.NonNegative(
                request.RentAmount,
                nameof(request.RentAmount)),
            request.ElectricityStartReading,
            request.ElectricityEndReading,
            request.WaterStartReading,
            request.WaterEndReading,
            RequestGuard.NonNegative(
                request.ElectricityUnitPrice,
                nameof(request.ElectricityUnitPrice)),
            RequestGuard.NonNegative(
                request.WaterUnitPrice,
                nameof(request.WaterUnitPrice)),
            _dateTimeProvider.UtcNow);

        await _unitOfWork.SaveChangesAsync(cancellationToken);
        return invoice.ToResponse();
    }

    public async Task<InvoiceResponse> IssueInvoiceAsync(
        Guid invoiceId,
        CancellationToken cancellationToken = default)
    {
        AuthorizationGuard.EnsureAdminOrStaff(_currentUser);
        invoiceId = RequestGuard.Required(invoiceId, nameof(invoiceId));

        var invoice = await LoadInvoiceAsync(invoiceId, cancellationToken);
        invoice.Issue(_dateTimeProvider.UtcNow);
        await _unitOfWork.SaveChangesAsync(cancellationToken);
        return invoice.ToResponse();
    }

    public async Task<PaymentResponse> RegisterPaymentAsync(
        Guid invoiceId,
        RegisterPaymentRequest request,
        CancellationToken cancellationToken = default)
    {
        AuthorizationGuard.EnsureAdminOrStaff(_currentUser);
        invoiceId = RequestGuard.Required(invoiceId, nameof(invoiceId));
        request = RequestGuard.NotNull(request, nameof(request));

        var invoice = await LoadInvoiceAsync(invoiceId, cancellationToken);
        var payment = invoice.RegisterPayment(
            request.Amount,
            request.Note,
            _currentUser.UserId,
            _dateTimeProvider.UtcNow);

        await _unitOfWork.SaveChangesAsync(cancellationToken);
        return payment.ToResponse();
    }

    public async Task<InvoiceDetailsResponse> GetInvoiceAsync(
        Guid invoiceId,
        CancellationToken cancellationToken = default)
    {
        AuthorizationGuard.EnsureAuthenticated(_currentUser);
        invoiceId = RequestGuard.Required(invoiceId, nameof(invoiceId));
        var invoice = await LoadAuthorizedInvoiceAsync(
            invoiceId,
            cancellationToken);
        return invoice.ToDetailsResponse();
    }

    public async Task<PagedResult<InvoiceResponse>> GetInvoicesAsync(
        InvoiceFilterRequest request,
        CancellationToken cancellationToken = default)
    {
        AuthorizationGuard.EnsureAuthenticated(_currentUser);
        request = RequestGuard.NotNull(request, nameof(request));
        var page = RequestGuard.Pagination(
            request.PageNumber,
            request.PageSize);
        var status = RequestGuard.DefinedEnum(
            request.Status,
            nameof(request.Status));

        Guid? tenantId = null;
        var includeDraft = true;
        if (_currentUser.Role == UserRole.Tenant)
        {
            if (status == InvoiceStatus.Draft)
            {
                throw new ForbiddenAccessException(
                    BusinessRuleCodes.DraftInvoiceHiddenFromTenant,
                    "Draft invoices are not visible to tenants.");
            }

            tenantId = (await GetCurrentTenantAsync(cancellationToken)).Id;
            includeDraft = false;
        }
        else
        {
            AuthorizationGuard.EnsureAdminOrStaff(_currentUser);
        }

        var invoices = await _invoiceRepository.GetPagedAsync(
            page,
            status,
            tenantId,
            includeDraft,
            cancellationToken);

        return invoices.Map(invoice => invoice.ToResponse());
    }

    public async Task<IReadOnlyList<InvoiceResponse>> GetOutstandingInvoicesAsync(
        Guid? tenantId = null,
        CancellationToken cancellationToken = default)
    {
        AuthorizationGuard.EnsureAuthenticated(_currentUser);
        IReadOnlyList<Invoice> invoices;

        if (_currentUser.Role == UserRole.Tenant)
        {
            var currentTenant = await GetCurrentTenantAsync(cancellationToken);
            invoices = await _invoiceRepository.GetOutstandingByTenantIdAsync(
                currentTenant.Id,
                cancellationToken);
        }
        else
        {
            AuthorizationGuard.EnsureAdminOrStaff(_currentUser);
            if (tenantId.HasValue)
            {
                var validatedTenantId = RequestGuard.Required(
                    tenantId.Value,
                    nameof(tenantId));
                invoices =
                    await _invoiceRepository.GetOutstandingByTenantIdAsync(
                        validatedTenantId,
                        cancellationToken);
            }
            else
            {
                invoices = await _invoiceRepository.GetAllOutstandingAsync(
                    cancellationToken);
            }
        }

        return invoices.Select(invoice => invoice.ToResponse()).ToArray();
    }

    public async Task<IReadOnlyList<PaymentResponse>> GetPaymentHistoryAsync(
        Guid invoiceId,
        CancellationToken cancellationToken = default)
    {
        AuthorizationGuard.EnsureAuthenticated(_currentUser);
        invoiceId = RequestGuard.Required(invoiceId, nameof(invoiceId));
        var invoice = await LoadAuthorizedInvoiceAsync(
            invoiceId,
            cancellationToken);

        return invoice.Payments
            .OrderBy(payment => payment.PaidAt)
            .Select(payment => payment.ToResponse())
            .ToArray();
    }

    private async Task<Invoice> LoadAuthorizedInvoiceAsync(
        Guid invoiceId,
        CancellationToken cancellationToken)
    {
        var invoice = await LoadInvoiceAsync(invoiceId, cancellationToken);

        if (_currentUser.Role == UserRole.Tenant)
        {
            var tenant = await GetCurrentTenantAsync(cancellationToken);
            var isOwned = await _invoiceRepository.IsOwnedByTenantAsync(
                invoice.Id,
                tenant.Id,
                cancellationToken);
            if (!isOwned)
            {
                throw new ForbiddenAccessException(
                    BusinessRuleCodes.TenantOwnDataOnly,
                    "Tenants may access only their own invoices.");
            }

            if (invoice.Status == InvoiceStatus.Draft)
            {
                throw new ForbiddenAccessException(
                    BusinessRuleCodes.DraftInvoiceHiddenFromTenant,
                    "Draft invoices are not visible to tenants.");
            }
        }
        else
        {
            AuthorizationGuard.EnsureAdminOrStaff(_currentUser);
        }

        return invoice;
    }

    private async Task<Invoice> LoadInvoiceAsync(
        Guid invoiceId,
        CancellationToken cancellationToken)
    {
        return await _invoiceRepository.GetByIdAsync(
            invoiceId,
            cancellationToken)
            ?? throw new NotFoundException("Invoice", invoiceId);
    }

    private async Task<Tenant> GetCurrentTenantAsync(
        CancellationToken cancellationToken)
    {
        return await _tenantRepository.GetByUserIdAsync(
            _currentUser.UserId,
            cancellationToken)
            ?? throw new NotFoundException("Tenant profile", _currentUser.UserId);
    }
}
