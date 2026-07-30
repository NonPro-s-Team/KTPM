using Microsoft.EntityFrameworkCore;
using RMS.Application.Common.Interfaces.Persistence;
using RMS.Application.Common.Models;
using RMS.Domain.Entities;
using RMS.Domain.Enums;
using RMS.Domain.ValueObjects;
using RMS.Infrastructure.Data;

namespace RMS.Infrastructure.Repositories;

public sealed class InvoiceRepository : IInvoiceRepository
{
    private static readonly InvoiceStatus[] OutstandingStatuses =
    [
        InvoiceStatus.Issued,
        InvoiceStatus.PartiallyPaid,
        InvoiceStatus.Overdue
    ];

    private readonly AppDbContext _dbContext;

    public InvoiceRepository(AppDbContext dbContext)
    {
        _dbContext = dbContext;
    }

    public Task<Invoice?> GetByIdAsync(
        Guid invoiceId,
        CancellationToken cancellationToken = default) =>
        _dbContext.Invoices
            .Include(invoice => invoice.Contract)
                .ThenInclude(contract => contract.Tenant)
            .Include(invoice => invoice.Payments
                .OrderBy(payment => payment.PaidAt)
                .ThenBy(payment => payment.Id))
            .SingleOrDefaultAsync(
                invoice => invoice.Id == invoiceId,
                cancellationToken);

    public async Task<PagedResult<Invoice>> GetPagedAsync(
        PagedRequest request,
        InvoiceStatus? status,
        Guid? tenantId,
        bool includeDraft,
        CancellationToken cancellationToken = default)
    {
        ArgumentNullException.ThrowIfNull(request);

        IQueryable<Invoice> query = _dbContext.Invoices.AsNoTracking();
        if (status.HasValue)
        {
            query = query.Where(invoice => invoice.Status == status.Value);
        }

        if (tenantId.HasValue)
        {
            query = query.Where(
                invoice => invoice.Contract.TenantId == tenantId.Value);
        }

        if (!includeDraft)
        {
            query = query.Where(
                invoice => invoice.Status != InvoiceStatus.Draft);
        }

        var totalCount = await query.CountAsync(cancellationToken);
        var invoices = await query
            .OrderByDescending(invoice => invoice.CreatedAt)
            .ThenBy(invoice => invoice.Id)
            .Skip((request.PageNumber - 1) * request.PageSize)
            .Take(request.PageSize)
            .ToListAsync(cancellationToken);

        return new PagedResult<Invoice>(
            invoices,
            request.PageNumber,
            request.PageSize,
            totalCount);
    }

    public Task<bool> ExistsForContractAndPeriodAsync(
        Guid contractId,
        BillingPeriod billingPeriod,
        CancellationToken cancellationToken = default)
    {
        ArgumentNullException.ThrowIfNull(billingPeriod);

        return _dbContext.Invoices.AnyAsync(
            invoice =>
                invoice.ContractId == contractId
                && invoice.BillingPeriod == billingPeriod,
            cancellationToken);
    }

    public async Task<IReadOnlyList<Invoice>>
        GetOutstandingByTenantIdAsync(
            Guid tenantId,
            CancellationToken cancellationToken = default) =>
        await OutstandingQuery()
            .Where(invoice => invoice.Contract.TenantId == tenantId)
            .OrderByDescending(invoice => invoice.CreatedAt)
            .ThenBy(invoice => invoice.Id)
            .ToListAsync(cancellationToken);

    public async Task<IReadOnlyList<Invoice>> GetAllOutstandingAsync(
        CancellationToken cancellationToken = default) =>
        await OutstandingQuery()
            .OrderByDescending(invoice => invoice.CreatedAt)
            .ThenBy(invoice => invoice.Id)
            .ToListAsync(cancellationToken);

    public Task<bool> IsOwnedByTenantAsync(
        Guid invoiceId,
        Guid tenantId,
        CancellationToken cancellationToken = default) =>
        _dbContext.Invoices.AnyAsync(
            invoice =>
                invoice.Id == invoiceId
                && invoice.Contract.TenantId == tenantId,
            cancellationToken);

    public void Add(Invoice invoice)
    {
        ArgumentNullException.ThrowIfNull(invoice);
        _dbContext.Invoices.Add(invoice);
    }

    private IQueryable<Invoice> OutstandingQuery() =>
        _dbContext.Invoices
            .AsNoTracking()
            .Where(invoice => OutstandingStatuses.Contains(invoice.Status));
}
