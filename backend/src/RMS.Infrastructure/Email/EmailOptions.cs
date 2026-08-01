namespace RMS.Infrastructure.Email;

public sealed class EmailOptions
{
    public const string SectionName = "Email";

    public string ConnectionString { get; init; } = string.Empty;
    public string SenderAddress { get; init; } = string.Empty;
    public string SenderDisplayName { get; init; } = "TroConnect";
}
