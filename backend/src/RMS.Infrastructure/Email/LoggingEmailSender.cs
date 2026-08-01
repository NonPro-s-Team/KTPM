using Microsoft.Extensions.Logging;
using RMS.Application.Common.Interfaces.Services;
using RMS.Application.Common.Models;

namespace RMS.Infrastructure.Email;

/// <summary>
/// Development fallback used when Email:ConnectionString is not configured —
/// logs the email instead of sending it, so invite/reset-password links are
/// still visible (in the console) without needing a real ACS resource.
/// </summary>
public sealed class LoggingEmailSender : IEmailSender
{
    private readonly ILogger<LoggingEmailSender> _logger;

    public LoggingEmailSender(ILogger<LoggingEmailSender> logger)
    {
        _logger = logger;
    }

    public Task SendAsync(
        OutgoingEmail email,
        CancellationToken cancellationToken = default)
    {
        _logger.LogInformation(
            "[Dev email] To: {ToEmail} | Subject: {Subject}\n{HtmlBody}",
            email.ToEmail,
            email.Subject,
            email.HtmlBody);

        return Task.CompletedTask;
    }
}
