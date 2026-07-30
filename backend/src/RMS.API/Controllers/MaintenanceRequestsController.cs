using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using RMS.API.Authorization;
using RMS.Application.Common.Models;
using RMS.Application.MaintenanceRequests;
using RMS.Application.MaintenanceRequests.Models;
using RMS.Domain.Enums;

namespace RMS.API.Controllers;

[ApiController]
[Route("api/maintenance-requests")]
[ProducesResponseType(
    typeof(ProblemDetails),
    StatusCodes.Status401Unauthorized)]
[ProducesResponseType(
    typeof(ProblemDetails),
    StatusCodes.Status500InternalServerError)]
public sealed class MaintenanceRequestsController : ControllerBase
{
    private readonly IMaintenanceRequestService _maintenanceRequestService;

    public MaintenanceRequestsController(
        IMaintenanceRequestService maintenanceRequestService)
    {
        _maintenanceRequestService = maintenanceRequestService;
    }

    /// <summary>Gets maintenance requests visible to the current user.</summary>
    [HttpGet]
    [ProducesResponseType(
        typeof(PagedResult<MaintenanceRequestResponse>),
        StatusCodes.Status200OK)]
    [ProducesResponseType(
        typeof(ProblemDetails),
        StatusCodes.Status400BadRequest)]
    [ProducesResponseType(
        typeof(ProblemDetails),
        StatusCodes.Status403Forbidden)]
    public async Task<ActionResult<PagedResult<MaintenanceRequestResponse>>>
        GetRequests(
            [FromQuery] int pageNumber = 1,
            [FromQuery] int pageSize = 20,
            [FromQuery] MaintenanceRequestStatus? status = null,
            CancellationToken cancellationToken = default)
    {
        var result = await _maintenanceRequestService.GetPagedAsync(
            new MaintenanceRequestFilterRequest(
                pageNumber,
                pageSize,
                status),
            cancellationToken);

        return Ok(result);
    }

    /// <summary>Gets one maintenance request with ownership enforcement.</summary>
    [HttpGet("{requestId:guid}")]
    [ProducesResponseType(
        typeof(MaintenanceRequestResponse),
        StatusCodes.Status200OK)]
    [ProducesResponseType(
        typeof(ProblemDetails),
        StatusCodes.Status403Forbidden)]
    [ProducesResponseType(
        typeof(ProblemDetails),
        StatusCodes.Status404NotFound)]
    public async Task<ActionResult<MaintenanceRequestResponse>> GetRequest(
        Guid requestId,
        CancellationToken cancellationToken)
    {
        var result = await _maintenanceRequestService.GetByIdAsync(
            requestId,
            cancellationToken);

        return Ok(result);
    }

    /// <summary>Creates a request for the current tenant's active room.</summary>
    [Authorize(Policy = AuthorizationPolicies.TenantOnly)]
    [HttpPost]
    [ProducesResponseType(
        typeof(MaintenanceRequestResponse),
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
    public async Task<ActionResult<MaintenanceRequestResponse>> CreateRequest(
        [FromBody] CreateMaintenanceRequestRequest request,
        CancellationToken cancellationToken)
    {
        var result = await _maintenanceRequestService.CreateAsync(
            request,
            cancellationToken);

        return CreatedAtAction(
            nameof(GetRequest),
            new { requestId = result.Id },
            result);
    }

    /// <summary>Moves a submitted request into progress.</summary>
    [Authorize(Policy = AuthorizationPolicies.AdminOrStaff)]
    [HttpPost("{requestId:guid}/start")]
    [ProducesResponseType(
        typeof(MaintenanceRequestResponse),
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
    public async Task<ActionResult<MaintenanceRequestResponse>> StartRequest(
        Guid requestId,
        [FromBody] StartMaintenanceRequestRequest request,
        CancellationToken cancellationToken)
    {
        var result = await _maintenanceRequestService.StartProgressAsync(
            requestId,
            request,
            cancellationToken);

        return Ok(result);
    }

    /// <summary>Adds a progress note to an in-progress request.</summary>
    [Authorize(Policy = AuthorizationPolicies.AdminOrStaff)]
    [HttpPost("{requestId:guid}/progress-notes")]
    [ProducesResponseType(
        typeof(MaintenanceRequestResponse),
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
    public async Task<ActionResult<MaintenanceRequestResponse>>
        AddProgressNote(
            Guid requestId,
            [FromBody] AddMaintenanceProgressRequest request,
            CancellationToken cancellationToken)
    {
        var result = await _maintenanceRequestService.AddProgressNoteAsync(
            requestId,
            request,
            cancellationToken);

        return Ok(result);
    }

    /// <summary>Resolves an in-progress maintenance request.</summary>
    [Authorize(Policy = AuthorizationPolicies.AdminOrStaff)]
    [HttpPost("{requestId:guid}/resolve")]
    [ProducesResponseType(
        typeof(MaintenanceRequestResponse),
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
    public async Task<ActionResult<MaintenanceRequestResponse>>
        ResolveRequest(
            Guid requestId,
            [FromBody] ResolveMaintenanceRequestRequest request,
            CancellationToken cancellationToken)
    {
        var result = await _maintenanceRequestService.ResolveAsync(
            requestId,
            request,
            cancellationToken);

        return Ok(result);
    }

    /// <summary>Closes a resolved maintenance request.</summary>
    [Authorize(Policy = AuthorizationPolicies.AdminOrStaff)]
    [HttpPost("{requestId:guid}/close")]
    [ProducesResponseType(
        typeof(MaintenanceRequestResponse),
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
    public async Task<ActionResult<MaintenanceRequestResponse>> CloseRequest(
        Guid requestId,
        [FromBody] CloseMaintenanceRequestRequest request,
        CancellationToken cancellationToken)
    {
        var result = await _maintenanceRequestService.CloseAsync(
            requestId,
            request,
            cancellationToken);

        return Ok(result);
    }
}
