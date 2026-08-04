using Microsoft.EntityFrameworkCore;
using TroConnect.Api.Data;
using TroConnect.Api.Data.Entities;

namespace TroConnect.Api.Features.Tenants;

public class TenantService
{
    private readonly AppDbContext _db;

    public TenantService(AppDbContext db)
    {
        _db = db;
    }

    public async Task<List<TenantListDto>> GetAllAsync(string? search)
    {
        var query = _db.Tenants.AsQueryable();
        if (!string.IsNullOrWhiteSpace(search))
        {
            query = query.Where(t => t.FullName.Contains(search) || t.IdNumber.Contains(search));
        }

        return await query
            .OrderBy(t => t.FullName)
            .Select(t => new TenantListDto(t.Id, t.FullName, t.IdNumber, t.PhoneNumber))
            .ToListAsync();
    }

    public async Task<TenantDetailDto?> GetByIdAsync(Guid id)
    {
        var tenant = await _db.Tenants.FindAsync(id);
        return tenant is null ? null : ToDetailDto(tenant);
    }

    public async Task<TenantMutationResult> CreateAsync(CreateTenantRequest request)
    {
        var isDuplicate = await _db.Tenants.AnyAsync(t => t.IdNumber == request.IdNumber);
        if (isDuplicate)
        {
            return new TenantMutationResult(TenantMutationError.DuplicateIdNumber, null);
        }

        var tenant = new Tenant
        {
            Id = Guid.NewGuid(),
            FullName = request.FullName,
            IdNumber = request.IdNumber,
            PhoneNumber = request.PhoneNumber,
            Hometown = request.Hometown,
            DateOfBirth = request.DateOfBirth,
            Gender = request.Gender,
            Email = request.Email,
            CreatedAt = DateTimeOffset.UtcNow,
            UpdatedAt = DateTimeOffset.UtcNow
        };

        _db.Tenants.Add(tenant);
        await _db.SaveChangesAsync();

        return new TenantMutationResult(TenantMutationError.None, ToDetailDto(tenant));
    }

    public async Task<TenantMutationResult?> UpdateAsync(Guid id, UpdateTenantRequest request)
    {
        var tenant = await _db.Tenants.FindAsync(id);
        if (tenant is null)
        {
            return null;
        }

        var isDuplicate = await _db.Tenants.AnyAsync(t => t.IdNumber == request.IdNumber && t.Id != id);
        if (isDuplicate)
        {
            return new TenantMutationResult(TenantMutationError.DuplicateIdNumber, null);
        }

        tenant.FullName = request.FullName;
        tenant.IdNumber = request.IdNumber;
        tenant.PhoneNumber = request.PhoneNumber;
        tenant.Hometown = request.Hometown;
        tenant.DateOfBirth = request.DateOfBirth;
        tenant.Gender = request.Gender;
        tenant.Email = request.Email;
        tenant.UpdatedAt = DateTimeOffset.UtcNow;

        await _db.SaveChangesAsync();

        return new TenantMutationResult(TenantMutationError.None, ToDetailDto(tenant));
    }

    public async Task<bool> DeleteAsync(Guid id)
    {
        var tenant = await _db.Tenants.FindAsync(id);
        if (tenant is null)
        {
            return false;
        }

        // TODO: once the Contract module exists, block this delete (return a clear error instead)
        // if the tenant is attached to any Contract (as Representative or CoTenant) — see docs/contract-management.md.
        _db.Tenants.Remove(tenant);
        await _db.SaveChangesAsync();
        return true;
    }

    private static TenantDetailDto ToDetailDto(Tenant tenant)
    {
        return new TenantDetailDto(
            tenant.Id,
            tenant.FullName,
            tenant.IdNumber,
            tenant.PhoneNumber,
            tenant.Hometown,
            tenant.DateOfBirth,
            tenant.Gender,
            tenant.Email,
            tenant.CreatedAt,
            tenant.UpdatedAt);
    }
}
