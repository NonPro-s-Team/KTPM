using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using RMS.API.Authorization;
using RMS.Application.Common.Models;
using RMS.Application.Tenants;
using RMS.Application.Tenants.Models;

namespace RMS.API.Controllers;

[ApiController]
[Route("api/tenants")]
[ProducesResponseType(
    typeof(ProblemDetails),
    StatusCodes.Status401Unauthorized)]
[ProducesResponseType(
    typeof(ProblemDetails),
    StatusCodes.Status500InternalServerError)]
public sealed class TenantsController : ControllerBase
{
    private readonly ITenantService _tenantService;

    public TenantsController(ITenantService tenantService)
    {
        _tenantService = tenantService;
    }

    /// <summary>Gets a paged tenant list. Admin or staff only.</summary>
    [Authorize(Policy = AuthorizationPolicies.AdminOrStaff)]
    [HttpGet]
    [ProducesResponseType(
        typeof(PagedResult<TenantResponse>),
        StatusCodes.Status200OK)]
    [ProducesResponseType(
        typeof(ProblemDetails),
        StatusCodes.Status400BadRequest)]
    [ProducesResponseType(
        typeof(ProblemDetails),
        StatusCodes.Status403Forbidden)]
    public async Task<ActionResult<PagedResult<TenantResponse>>> GetTenants(
        [FromQuery] int pageNumber = 1,
        [FromQuery] int pageSize = 20,
        CancellationToken cancellationToken = default)
    {
        var result = await _tenantService.GetTenantsAsync(
            new TenantFilterRequest(pageNumber, pageSize),
            cancellationToken);

        return Ok(result);
    }

    /// <summary>Gets the current tenant profile.</summary>
    [Authorize(Policy = AuthorizationPolicies.TenantOnly)]
    [HttpGet("me")]
    [ProducesResponseType(typeof(TenantResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(
        typeof(ProblemDetails),
        StatusCodes.Status403Forbidden)]
    [ProducesResponseType(
        typeof(ProblemDetails),
        StatusCodes.Status404NotFound)]
    public async Task<ActionResult<TenantResponse>> GetCurrentTenant(
        CancellationToken cancellationToken)
    {
        var result = await _tenantService.GetCurrentTenantAsync(
            cancellationToken);

        return Ok(result);
    }

    /// <summary>Gets a tenant by ID with ownership enforcement.</summary>
    [HttpGet("{tenantId:guid}")]
    [ProducesResponseType(typeof(TenantResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(
        typeof(ProblemDetails),
        StatusCodes.Status403Forbidden)]
    [ProducesResponseType(
        typeof(ProblemDetails),
        StatusCodes.Status404NotFound)]
    public async Task<ActionResult<TenantResponse>> GetTenant(
        Guid tenantId,
        CancellationToken cancellationToken)
    {
        var result = await _tenantService.GetTenantByIdAsync(
            tenantId,
            cancellationToken);

        return Ok(result);
    }

    /// <summary>Creates a tenant account and profile.</summary>
    [Authorize(Policy = AuthorizationPolicies.AdminOrStaff)]
    [HttpPost]
    [ProducesResponseType(
        typeof(TenantResponse),
        StatusCodes.Status201Created)]
    [ProducesResponseType(
        typeof(ValidationProblemDetails),
        StatusCodes.Status400BadRequest)]
    [ProducesResponseType(
        typeof(ProblemDetails),
        StatusCodes.Status403Forbidden)]
    [ProducesResponseType(
        typeof(ProblemDetails),
        StatusCodes.Status409Conflict)]
    public async Task<ActionResult<TenantResponse>> CreateTenant(
        [FromBody] CreateTenantRequest request,
        CancellationToken cancellationToken)
    {
        var result = await _tenantService.CreateTenantAsync(
            request,
            cancellationToken);

        return CreatedAtAction(
            nameof(GetTenant),
            new { tenantId = result.Id },
            result);
    }

    /// <summary>Updates a tenant profile.</summary>
    [Authorize(Policy = AuthorizationPolicies.AdminOrStaff)]
    [HttpPut("{tenantId:guid}")]
    [ProducesResponseType(typeof(TenantResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(
        typeof(ValidationProblemDetails),
        StatusCodes.Status400BadRequest)]
    [ProducesResponseType(
        typeof(ProblemDetails),
        StatusCodes.Status403Forbidden)]
    [ProducesResponseType(
        typeof(ProblemDetails),
        StatusCodes.Status404NotFound)]
    public async Task<ActionResult<TenantResponse>> UpdateTenant(
        Guid tenantId,
        [FromBody] UpdateTenantRequest request,
        CancellationToken cancellationToken)
    {
        var result = await _tenantService.UpdateTenantAsync(
            tenantId,
            request,
            cancellationToken);

        return Ok(result);
    }
}
