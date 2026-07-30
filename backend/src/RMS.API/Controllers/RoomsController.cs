using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using RMS.API.Authorization;
using RMS.Application.Common.Models;
using RMS.Application.Rooms;
using RMS.Application.Rooms.Models;
using RMS.Domain.Enums;

namespace RMS.API.Controllers;

[ApiController]
[Route("api/rooms")]
[ProducesResponseType(
    typeof(ProblemDetails),
    StatusCodes.Status401Unauthorized)]
[ProducesResponseType(
    typeof(ProblemDetails),
    StatusCodes.Status500InternalServerError)]
public sealed class RoomsController : ControllerBase
{
    private readonly IRoomService _roomService;

    public RoomsController(IRoomService roomService)
    {
        _roomService = roomService;
    }

    /// <summary>Gets a paged room list.</summary>
    [HttpGet]
    [ProducesResponseType(
        typeof(PagedResult<RoomResponse>),
        StatusCodes.Status200OK)]
    [ProducesResponseType(
        typeof(ProblemDetails),
        StatusCodes.Status400BadRequest)]
    [ProducesResponseType(
        typeof(ProblemDetails),
        StatusCodes.Status403Forbidden)]
    public async Task<ActionResult<PagedResult<RoomResponse>>> GetRooms(
        [FromQuery] int pageNumber = 1,
        [FromQuery] int pageSize = 20,
        [FromQuery] RoomStatus? status = null,
        CancellationToken cancellationToken = default)
    {
        var result = await _roomService.GetRoomsAsync(
            new RoomFilterRequest(pageNumber, pageSize, status),
            cancellationToken);

        return Ok(result);
    }

    /// <summary>Gets one room by ID.</summary>
    [HttpGet("{roomId:guid}")]
    [ProducesResponseType(typeof(RoomResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(
        typeof(ProblemDetails),
        StatusCodes.Status404NotFound)]
    public async Task<ActionResult<RoomResponse>> GetRoom(
        Guid roomId,
        CancellationToken cancellationToken)
    {
        var result = await _roomService.GetRoomByIdAsync(
            roomId,
            cancellationToken);

        return Ok(result);
    }

    /// <summary>Creates an available room.</summary>
    [Authorize(Policy = AuthorizationPolicies.AdminOrStaff)]
    [HttpPost]
    [ProducesResponseType(typeof(RoomResponse), StatusCodes.Status201Created)]
    [ProducesResponseType(
        typeof(ValidationProblemDetails),
        StatusCodes.Status400BadRequest)]
    [ProducesResponseType(
        typeof(ProblemDetails),
        StatusCodes.Status403Forbidden)]
    [ProducesResponseType(
        typeof(ProblemDetails),
        StatusCodes.Status409Conflict)]
    public async Task<ActionResult<RoomResponse>> CreateRoom(
        [FromBody] CreateRoomRequest request,
        CancellationToken cancellationToken)
    {
        var result = await _roomService.CreateRoomAsync(
            request,
            cancellationToken);

        return CreatedAtAction(
            nameof(GetRoom),
            new { roomId = result.Id },
            result);
    }

    /// <summary>Updates room details without changing its status.</summary>
    [Authorize(Policy = AuthorizationPolicies.AdminOrStaff)]
    [HttpPut("{roomId:guid}")]
    [ProducesResponseType(typeof(RoomResponse), StatusCodes.Status200OK)]
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
    public async Task<ActionResult<RoomResponse>> UpdateRoom(
        Guid roomId,
        [FromBody] UpdateRoomRequest request,
        CancellationToken cancellationToken)
    {
        var result = await _roomService.UpdateRoomAsync(
            roomId,
            request,
            cancellationToken);

        return Ok(result);
    }

    /// <summary>Changes a room through the supported status transition.</summary>
    [Authorize(Policy = AuthorizationPolicies.AdminOrStaff)]
    [HttpPatch("{roomId:guid}/status")]
    [ProducesResponseType(typeof(RoomResponse), StatusCodes.Status200OK)]
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
    public async Task<ActionResult<RoomResponse>> ChangeRoomStatus(
        Guid roomId,
        [FromBody] ChangeRoomStatusRequest request,
        CancellationToken cancellationToken)
    {
        var result = await _roomService.ChangeRoomStatusAsync(
            roomId,
            request,
            cancellationToken);

        return Ok(result);
    }
}
