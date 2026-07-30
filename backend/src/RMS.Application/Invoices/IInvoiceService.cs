using RMS.Application.Common.Models;
using RMS.Application.Invoices.Models;

namespace RMS.Application.Invoices;

public interface IInvoiceService
{
    Task<InvoiceResponse> CreateInvoiceAsync(
        CreateInvoiceRequest request,
        CancellationToken cancellationToken = default);

    Task<InvoiceResponse> UpdateDraftInvoiceAsync(
        Guid invoiceId,
        UpdateDraftInvoiceRequest request,
        CancellationToken cancellationToken = default);

    Task<InvoiceResponse> IssueInvoiceAsync(
        Guid invoiceId,
        CancellationToken cancellationToken = default);

    Task<PaymentResponse> RegisterPaymentAsync(
        Guid invoiceId,
        RegisterPaymentRequest request,
        CancellationToken cancellationToken = default);

    Task<InvoiceDetailsResponse> GetInvoiceAsync(
        Guid invoiceId,
        CancellationToken cancellationToken = default);

    Task<PagedResult<InvoiceResponse>> GetInvoicesAsync(
        InvoiceFilterRequest request,
        CancellationToken cancellationToken = default);

    Task<IReadOnlyList<InvoiceResponse>> GetOutstandingInvoicesAsync(
        Guid? tenantId = null,
        CancellationToken cancellationToken = default);

    Task<IReadOnlyList<PaymentResponse>> GetPaymentHistoryAsync(
        Guid invoiceId,
        CancellationToken cancellationToken = default);
}
