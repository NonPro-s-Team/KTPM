namespace RMS.Application.Features.Tenants.Dtos;

public class TenantDto
{
    public Guid Id { get; set; }
    public string FullName { get; set; } = string.Empty;
    public string Phone { get; set; } = string.Empty;
    public string IdNumber { get; set; } = string.Empty;
    public Guid UserId { get; set; }
}
