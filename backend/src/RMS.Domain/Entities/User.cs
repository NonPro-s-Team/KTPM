namespace RMS.Domain.Entities;

public class User
{
    public Guid Id { get; set; }
    public string Username { get; set; } = string.Empty;
    public string PasswordHash { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public Enums.UserRole Role { get; set; }
    public bool IsLocked { get; set; }
    public int FailedLoginCount { get; set; }
    public DateTime CreatedAt { get; set; }
}
