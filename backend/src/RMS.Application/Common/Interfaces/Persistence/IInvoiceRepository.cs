using RMS.Application.Common.Models;
using RMS.Domain.Entities;
using RMS.Domain.Enums;
using RMS.Domain.ValueObjects;

namespace RMS.Application.Common.Interfaces.Persistence;

public interface IInvoiceRepository
{
    Task<Invoice?> GetByIdAsync(
        Guid invoiceId,
        CancellationToken cancellationToken = default);

    Task<PagedResult<Invoice>> GetPagedAsync(
        PagedRequest request,
        InvoiceStatus? status,
        Guid? tenantId,
        bool includeDraft,
        CancellationToken cancellationToken = default);

    Task<bool> ExistsForContractAndPeriodAsync(
        Guid contractId,
        BillingPeriod billingPeriod,
        CancellationToken cancellationToken = default);

    Task<IReadOnlyList<Invoice>> GetOutstandingByTenantIdAsync(
        Guid tenantId,
        CancellationToken cancellationToken = default);

    Task<IReadOnlyList<Invoice>> GetAllOutstandingAsync(
        CancellationToken cancellationToken = default);

    Task<bool> IsOwnedByTenantAsync(
        Guid invoiceId,
        Guid tenantId,
        CancellationToken cancellationToken = default);

    void Add(Invoice invoice);
}
