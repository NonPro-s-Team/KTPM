using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace TroConnect.Api.Features.Rooms;

[ApiController]
[Authorize]
[Route("api/rooms")]
public class RoomsController : ControllerBase
{
    private readonly RoomService _roomService;

    public RoomsController(RoomService roomService)
    {
        _roomService = roomService;
    }

    [HttpGet]
    public async Task<IActionResult> GetAll([FromQuery] Guid? buildingId)
    {
        var rooms = await _roomService.GetAllAsync(buildingId);
        return Ok(rooms);
    }

    [HttpGet("{id:guid}")]
    public async Task<IActionResult> GetById(Guid id)
    {
        var room = await _roomService.GetByIdAsync(id);
        if (room is null)
        {
            return NotFound(new { message = "Room not found." });
        }

        return Ok(room);
    }

    [HttpPost]
    public async Task<IActionResult> Create(CreateRoomRequest request)
    {
        var result = await _roomService.CreateAsync(request);
        var errorResult = ToErrorResult(result.Error, result.RoomLimit);
        if (errorResult is not null)
        {
            return errorResult;
        }

        return CreatedAtAction(nameof(GetById), new { id = result.Room!.Id }, result.Room);
    }

    [HttpPut("{id:guid}")]
    public async Task<IActionResult> Update(Guid id, UpdateRoomRequest request)
    {
        var result = await _roomService.UpdateAsync(id, request);
        if (result is null)
        {
            return NotFound(new { message = "Room not found." });
        }

        var errorResult = ToErrorResult(result.Error, result.RoomLimit);
        if (errorResult is not null)
        {
            return errorResult;
        }

        return Ok(result.Room);
    }

    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> Delete(Guid id)
    {
        var deleted = await _roomService.DeleteAsync(id);
        if (!deleted)
        {
            return NotFound(new { message = "Room not found." });
        }

        return NoContent();
    }

    private IActionResult? ToErrorResult(RoomMutationError error, int roomLimit)
    {
        return error switch
        {
            RoomMutationError.BuildingNotFound => NotFound(new { message = "Building not found." }),
            RoomMutationError.RoomLimitReached => BadRequest(new
            {
                message = $"This building has reached its room limit of {roomLimit}. Increase TotalRooms on the building first if you need to add more rooms."
            }),
            _ => null
        };
    }
}
