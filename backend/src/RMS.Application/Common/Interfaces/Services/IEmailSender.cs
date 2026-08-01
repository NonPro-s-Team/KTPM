using RMS.Application.Common.Models;

namespace RMS.Application.Common.Interfaces.Services;

/// <summary>
/// Sends transactional email. Implementations must not throw on delivery
/// failure — they should log internally so callers never need to guard
/// business flows (invitations, password resets) against mail delivery
/// outages.
/// </summary>
public interface IEmailSender
{
    Task SendAsync(OutgoingEmail email, CancellationToken cancellationToken = default);
}
