namespace RMS.Application.Tenants.Models;

public sealed record CreateTenantRequest(
    string Username,
    string InitialPassword,
    string FullName,
    string PhoneNumber,
    string CitizenId);

public sealed record UpdateTenantRequest(
    string FullName,
    string PhoneNumber,
    string CitizenId);

public sealed record TenantFilterRequest(int PageNumber, int PageSize);

public sealed record TenantResponse(
    Guid Id,
    Guid UserId,
    string Username,
    string FullName,
    string PhoneNumber,
    string CitizenId,
    DateTimeOffset CreatedAt,
    DateTimeOffset? UpdatedAt);
