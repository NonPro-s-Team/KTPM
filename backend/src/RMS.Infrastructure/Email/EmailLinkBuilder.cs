using Microsoft.Extensions.Options;
using RMS.Application.Common.Interfaces.Services;

namespace RMS.Infrastructure.Email;

public sealed class EmailLinkBuilder : IEmailLinkBuilder
{
    private readonly string _baseUrl;

    public EmailLinkBuilder(IOptions<FrontendOptions> options)
    {
        _baseUrl = options.Value.BaseUrl.TrimEnd('/');
    }

    public string BuildInvitationAcceptUrl(string token) =>
        $"{_baseUrl}/invite/{Uri.EscapeDataString(token)}";

    public string BuildPasswordResetUrl(string token) =>
        $"{_baseUrl}/reset-password/{Uri.EscapeDataString(token)}";
}
