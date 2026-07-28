namespace RMS.Domain.Entities;

public class Tenant
{
    public Guid Id { get; set; }
    public string FullName { get; set; } = string.Empty;
    public string Phone { get; set; } = string.Empty;
    public string IdNumber { get; set; } = string.Empty;
    public Guid UserId { get; set; }
    public User User { get; set; } = null!;
    public ICollection<Contract> Contracts { get; set; } = new List<Contract>();
}
