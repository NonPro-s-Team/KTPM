namespace TroConnect.Api.Common;

public class InviteOptions
{
    public const string SectionName = "Invite";

    public int ExpirationHours { get; set; } = 72;
    public string FrontendBaseUrl { get; set; } = string.Empty;
}
