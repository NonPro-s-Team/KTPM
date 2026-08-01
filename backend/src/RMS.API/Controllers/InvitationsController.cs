using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using RMS.API.Authorization;
using RMS.Application.Invitations;
using RMS.Application.Invitations.Models;

namespace RMS.API.Controllers;

[ApiController]
[Route("api/invitations")]
[ProducesResponseType(
    typeof(ProblemDetails),
    StatusCodes.Status500InternalServerError)]
public sealed class InvitationsController : ControllerBase
{
    private readonly IInvitationService _invitationService;

    public InvitationsController(IInvitationService invitationService)
    {
        _invitationService = invitationService;
    }

    /// <summary>Invites a new Staff or Admin user by email. Admin only.</summary>
    [Authorize(Policy = AuthorizationPolicies.AdminOnly)]
    [HttpPost]
    [ProducesResponseType(typeof(InvitationResponse), StatusCodes.Status201Created)]
    [ProducesResponseType(
        typeof(ValidationProblemDetails),
        StatusCodes.Status400BadRequest)]
    [ProducesResponseType(
        typeof(ProblemDetails),
        StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(
        typeof(ProblemDetails),
        StatusCodes.Status403Forbidden)]
    [ProducesResponseType(
        typeof(ProblemDetails),
        StatusCodes.Status409Conflict)]
    public async Task<ActionResult<InvitationResponse>> Create(
        [FromBody] CreateInvitationRequest request,
        CancellationToken cancellationToken)
    {
        var result = await _invitationService.CreateInvitationAsync(
            request,
            cancellationToken);

        return StatusCode(StatusCodes.Status201Created, result);
    }

    /// <summary>Previews an invitation by its token, for the accept page.</summary>
    [AllowAnonymous]
    [HttpGet("{token}")]
    [ProducesResponseType(
        typeof(InvitationPreviewResponse),
        StatusCodes.Status200OK)]
    [ProducesResponseType(
        typeof(ValidationProblemDetails),
        StatusCodes.Status400BadRequest)]
    public async Task<ActionResult<InvitationPreviewResponse>> GetByToken(
        string token,
        CancellationToken cancellationToken)
    {
        var result = await _invitationService.GetInvitationByTokenAsync(
            token,
            cancellationToken);

        return Ok(result);
    }

    /// <summary>Accepts an invitation and creates the account.</summary>
    [AllowAnonymous]
    [HttpPost("accept")]
    [ProducesResponseType(
        typeof(AcceptInvitationResponse),
        StatusCodes.Status200OK)]
    [ProducesResponseType(
        typeof(ValidationProblemDetails),
        StatusCodes.Status400BadRequest)]
    [ProducesResponseType(
        typeof(ProblemDetails),
        StatusCodes.Status409Conflict)]
    public async Task<ActionResult<AcceptInvitationResponse>> Accept(
        [FromBody] AcceptInvitationRequest request,
        CancellationToken cancellationToken)
    {
        var result = await _invitationService.AcceptInvitationAsync(
            request,
            cancellationToken);

        return Ok(result);
    }
}
