using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace TroConnect.Api.Features.Tenants;

[ApiController]
[Authorize]
[Route("api/tenants")]
public class TenantsController : ControllerBase
{
    private readonly TenantService _tenantService;

    public TenantsController(TenantService tenantService)
    {
        _tenantService = tenantService;
    }

    [HttpGet]
    public async Task<IActionResult> GetAll([FromQuery] string? search)
    {
        var tenants = await _tenantService.GetAllAsync(search);
        return Ok(tenants);
    }

    [HttpGet("{id:guid}")]
    public async Task<IActionResult> GetById(Guid id)
    {
        var tenant = await _tenantService.GetByIdAsync(id);
        if (tenant is null)
        {
            return NotFound(new { message = "Tenant not found." });
        }

        return Ok(tenant);
    }

    [HttpPost]
    public async Task<IActionResult> Create(CreateTenantRequest request)
    {
        var result = await _tenantService.CreateAsync(request);
        if (result.Error == TenantMutationError.DuplicateIdNumber)
        {
            return BadRequest(new { message = "A tenant profile with this ID number already exists." });
        }

        return CreatedAtAction(nameof(GetById), new { id = result.Tenant!.Id }, result.Tenant);
    }

    [HttpPut("{id:guid}")]
    public async Task<IActionResult> Update(Guid id, UpdateTenantRequest request)
    {
        var result = await _tenantService.UpdateAsync(id, request);
        if (result is null)
        {
            return NotFound(new { message = "Tenant not found." });
        }

        if (result.Error == TenantMutationError.DuplicateIdNumber)
        {
            return BadRequest(new { message = "A tenant profile with this ID number already exists." });
        }

        return Ok(result.Tenant);
    }

    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> Delete(Guid id)
    {
        var deleted = await _tenantService.DeleteAsync(id);
        if (!deleted)
        {
            return NotFound(new { message = "Tenant not found." });
        }

        return NoContent();
    }
}
