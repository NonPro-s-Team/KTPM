using Azure;
using Azure.Communication.Email;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using RMS.Application.Common.Interfaces.Services;
using RMS.Application.Common.Models;

namespace RMS.Infrastructure.Email;

public sealed class AcsEmailSender : IEmailSender
{
    private readonly EmailClient _emailClient;
    private readonly EmailOptions _options;
    private readonly ILogger<AcsEmailSender> _logger;

    public AcsEmailSender(
        EmailClient emailClient,
        IOptions<EmailOptions> options,
        ILogger<AcsEmailSender> logger)
    {
        _emailClient = emailClient;
        _options = options.Value;
        _logger = logger;
    }

    public async Task SendAsync(
        OutgoingEmail email,
        CancellationToken cancellationToken = default)
    {
        try
        {
            var message = new EmailMessage(
                senderAddress: _options.SenderAddress,
                content: new EmailContent(email.Subject)
                {
                    Html = email.HtmlBody,
                    PlainText = email.PlainTextBody,
                },
                recipients: new EmailRecipients(
                    [new EmailAddress(email.ToEmail)]));

            await _emailClient.SendAsync(
                WaitUntil.Started,
                message,
                cancellationToken);
        }
        catch (Exception exception)
        {
            _logger.LogError(
                exception,
                "Failed to send email with subject '{Subject}' to {ToEmail}.",
                email.Subject,
                email.ToEmail);
        }
    }
}
