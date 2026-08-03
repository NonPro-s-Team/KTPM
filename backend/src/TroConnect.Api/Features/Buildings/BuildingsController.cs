using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace TroConnect.Api.Features.Buildings;

[ApiController]
[Authorize]
[Route("api/buildings")]
public class BuildingsController : ControllerBase
{
    private readonly BuildingService _buildingService;

    public BuildingsController(BuildingService buildingService)
    {
        _buildingService = buildingService;
    }

    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var buildings = await _buildingService.GetAllAsync();
        return Ok(buildings);
    }

    [HttpGet("{id:guid}")]
    public async Task<IActionResult> GetById(Guid id)
    {
        var building = await _buildingService.GetByIdAsync(id);
        if (building is null)
        {
            return NotFound(new { message = "Building not found." });
        }

        return Ok(building);
    }

    [HttpPost]
    public async Task<IActionResult> Create(CreateBuildingRequest request)
    {
        var building = await _buildingService.CreateAsync(request);
        return CreatedAtAction(nameof(GetById), new { id = building.Id }, building);
    }

    [HttpPut("{id:guid}")]
    public async Task<IActionResult> Update(Guid id, UpdateBuildingRequest request)
    {
        var building = await _buildingService.UpdateAsync(id, request);
        if (building is null)
        {
            return NotFound(new { message = "Building not found." });
        }

        return Ok(building);
    }

    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> Delete(Guid id)
    {
        var deleted = await _buildingService.DeleteAsync(id);
        if (!deleted)
        {
            return NotFound(new { message = "Building not found." });
        }

        return NoContent();
    }
}
