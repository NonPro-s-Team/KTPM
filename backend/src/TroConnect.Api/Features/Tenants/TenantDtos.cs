using System.ComponentModel.DataAnnotations;
using TroConnect.Api.Data.Entities;

namespace TroConnect.Api.Features.Tenants;

public record CreateTenantRequest(
    [Required] string FullName,
    [Required] string IdNumber,
    [Required] string PhoneNumber,
    [Required] string Hometown,
    DateOnly? DateOfBirth,
    TenantGender? Gender,
    [EmailAddress] string? Email
);

public record UpdateTenantRequest(
    [Required] string FullName,
    [Required] string IdNumber,
    [Required] string PhoneNumber,
    [Required] string Hometown,
    DateOnly? DateOfBirth,
    TenantGender? Gender,
    [EmailAddress] string? Email
);

public record TenantListDto(
    Guid Id,
    string FullName,
    string IdNumber,
    string PhoneNumber
);

public record TenantDetailDto(
    Guid Id,
    string FullName,
    string IdNumber,
    string PhoneNumber,
    string Hometown,
    DateOnly? DateOfBirth,
    TenantGender? Gender,
    string? Email,
    DateTimeOffset CreatedAt,
    DateTimeOffset UpdatedAt
);

public enum TenantMutationError
{
    None,
    DuplicateIdNumber
}

public record TenantMutationResult(TenantMutationError Error, TenantDetailDto? Tenant)
{
    public bool IsSuccess => Error == TenantMutationError.None;
}
