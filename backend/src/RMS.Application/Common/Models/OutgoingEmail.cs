namespace RMS.Application.Common.Models;

public sealed record OutgoingEmail(
    string ToEmail,
    string Subject,
    string HtmlBody,
    string? PlainTextBody = null);
