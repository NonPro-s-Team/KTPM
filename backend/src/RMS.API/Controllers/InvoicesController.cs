using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using RMS.API.Authorization;
using RMS.Application.Common.Models;
using RMS.Application.Invoices;
using RMS.Application.Invoices.Models;
using RMS.Domain.Enums;

namespace RMS.API.Controllers;

[ApiController]
[Route("api/invoices")]
[ProducesResponseType(
    typeof(ProblemDetails),
    StatusCodes.Status401Unauthorized)]
[ProducesResponseType(
    typeof(ProblemDetails),
    StatusCodes.Status500InternalServerError)]
public sealed class InvoicesController : ControllerBase
{
    private readonly IInvoiceService _invoiceService;

    public InvoicesController(IInvoiceService invoiceService)
    {
        _invoiceService = invoiceService;
    }

    /// <summary>Gets a paged invoice list with tenant scoping.</summary>
    [HttpGet]
    [ProducesResponseType(
        typeof(PagedResult<InvoiceResponse>),
        StatusCodes.Status200OK)]
    [ProducesResponseType(
        typeof(ProblemDetails),
        StatusCodes.Status400BadRequest)]
    [ProducesResponseType(
        typeof(ProblemDetails),
        StatusCodes.Status403Forbidden)]
    public async Task<ActionResult<PagedResult<InvoiceResponse>>> GetInvoices(
        [FromQuery] int pageNumber = 1,
        [FromQuery] int pageSize = 20,
        [FromQuery] InvoiceStatus? status = null,
        CancellationToken cancellationToken = default)
    {
        var result = await _invoiceService.GetInvoicesAsync(
            new InvoiceFilterRequest(pageNumber, pageSize, status),
            cancellationToken);

        return Ok(result);
    }

    /// <summary>Gets outstanding invoices visible to the current user.</summary>
    [HttpGet("outstanding")]
    [ProducesResponseType(
        typeof(IReadOnlyList<InvoiceResponse>),
        StatusCodes.Status200OK)]
    [ProducesResponseType(
        typeof(ProblemDetails),
        StatusCodes.Status403Forbidden)]
    public async Task<ActionResult<IReadOnlyList<InvoiceResponse>>>
        GetOutstandingInvoices(
            [FromQuery] Guid? tenantId = null,
            CancellationToken cancellationToken = default)
    {
        var result = await _invoiceService.GetOutstandingInvoicesAsync(
            tenantId,
            cancellationToken);

        return Ok(result);
    }

    /// <summary>Gets one invoice and its payment history.</summary>
    [HttpGet("{invoiceId:guid}")]
    [ProducesResponseType(
        typeof(InvoiceDetailsResponse),
        StatusCodes.Status200OK)]
    [ProducesResponseType(
        typeof(ProblemDetails),
        StatusCodes.Status400BadRequest)]
    [ProducesResponseType(
        typeof(ProblemDetails),
        StatusCodes.Status403Forbidden)]
    [ProducesResponseType(
        typeof(ProblemDetails),
        StatusCodes.Status404NotFound)]
    public async Task<ActionResult<InvoiceDetailsResponse>> GetInvoice(
        Guid invoiceId,
        CancellationToken cancellationToken)
    {
        var result = await _invoiceService.GetInvoiceAsync(
            invoiceId,
            cancellationToken);

        return Ok(result);
    }

    /// <summary>Creates a draft monthly invoice.</summary>
    [Authorize(Policy = AuthorizationPolicies.AdminOrStaff)]
    [HttpPost]
    [ProducesResponseType(
        typeof(InvoiceResponse),
        StatusCodes.Status201Created)]
    [ProducesResponseType(
        typeof(ValidationProblemDetails),
        StatusCodes.Status400BadRequest)]
    [ProducesResponseType(
        typeof(ProblemDetails),
        StatusCodes.Status403Forbidden)]
    [ProducesResponseType(
        typeof(ProblemDetails),
        StatusCodes.Status404NotFound)]
    [ProducesResponseType(
        typeof(ProblemDetails),
        StatusCodes.Status409Conflict)]
    public async Task<ActionResult<InvoiceResponse>> CreateInvoice(
        [FromBody] CreateInvoiceRequest request,
        CancellationToken cancellationToken)
    {
        var result = await _invoiceService.CreateInvoiceAsync(
            request,
            cancellationToken);

        return CreatedAtAction(
            nameof(GetInvoice),
            new { invoiceId = result.Id },
            result);
    }

    /// <summary>Updates readings, prices, and rent on a draft invoice.</summary>
    [Authorize(Policy = AuthorizationPolicies.AdminOrStaff)]
    [HttpPut("{invoiceId:guid}")]
    [ProducesResponseType(
        typeof(InvoiceResponse),
        StatusCodes.Status200OK)]
    [ProducesResponseType(
        typeof(ValidationProblemDetails),
        StatusCodes.Status400BadRequest)]
    [ProducesResponseType(
        typeof(ProblemDetails),
        StatusCodes.Status403Forbidden)]
    [ProducesResponseType(
        typeof(ProblemDetails),
        StatusCodes.Status404NotFound)]
    [ProducesResponseType(
        typeof(ProblemDetails),
        StatusCodes.Status409Conflict)]
    public async Task<ActionResult<InvoiceResponse>> UpdateInvoice(
        Guid invoiceId,
        [FromBody] UpdateDraftInvoiceRequest request,
        CancellationToken cancellationToken)
    {
        var result = await _invoiceService.UpdateDraftInvoiceAsync(
            invoiceId,
            request,
            cancellationToken);

        return Ok(result);
    }

    /// <summary>Issues a draft invoice.</summary>
    [Authorize(Policy = AuthorizationPolicies.AdminOrStaff)]
    [HttpPost("{invoiceId:guid}/issue")]
    [ProducesResponseType(
        typeof(InvoiceResponse),
        StatusCodes.Status200OK)]
    [ProducesResponseType(
        typeof(ProblemDetails),
        StatusCodes.Status400BadRequest)]
    [ProducesResponseType(
        typeof(ProblemDetails),
        StatusCodes.Status403Forbidden)]
    [ProducesResponseType(
        typeof(ProblemDetails),
        StatusCodes.Status404NotFound)]
    public async Task<ActionResult<InvoiceResponse>> IssueInvoice(
        Guid invoiceId,
        CancellationToken cancellationToken)
    {
        var result = await _invoiceService.IssueInvoiceAsync(
            invoiceId,
            cancellationToken);

        return Ok(result);
    }

    /// <summary>Registers a payment against an invoice.</summary>
    [Authorize(Policy = AuthorizationPolicies.AdminOrStaff)]
    [HttpPost("{invoiceId:guid}/payments")]
    [ProducesResponseType(
        typeof(PaymentResponse),
        StatusCodes.Status200OK)]
    [ProducesResponseType(
        typeof(ValidationProblemDetails),
        StatusCodes.Status400BadRequest)]
    [ProducesResponseType(
        typeof(ProblemDetails),
        StatusCodes.Status403Forbidden)]
    [ProducesResponseType(
        typeof(ProblemDetails),
        StatusCodes.Status404NotFound)]
    [ProducesResponseType(
        typeof(ProblemDetails),
        StatusCodes.Status409Conflict)]
    public async Task<ActionResult<PaymentResponse>> RegisterPayment(
        Guid invoiceId,
        [FromBody] RegisterPaymentRequest request,
        CancellationToken cancellationToken)
    {
        var result = await _invoiceService.RegisterPaymentAsync(
            invoiceId,
            request,
            cancellationToken);

        return Ok(result);
    }

    /// <summary>Gets the payment history for an invoice.</summary>
    [HttpGet("{invoiceId:guid}/payments")]
    [ProducesResponseType(
        typeof(IReadOnlyList<PaymentResponse>),
        StatusCodes.Status200OK)]
    [ProducesResponseType(
        typeof(ProblemDetails),
        StatusCodes.Status403Forbidden)]
    [ProducesResponseType(
        typeof(ProblemDetails),
        StatusCodes.Status404NotFound)]
    public async Task<ActionResult<IReadOnlyList<PaymentResponse>>>
        GetPaymentHistory(
            Guid invoiceId,
            CancellationToken cancellationToken)
    {
        var result = await _invoiceService.GetPaymentHistoryAsync(
            invoiceId,
            cancellationToken);

        return Ok(result);
    }
}
