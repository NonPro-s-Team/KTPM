namespace RMS.Application.Common.Interfaces.Services;

public interface IEmailLinkBuilder
{
    string BuildInvitationAcceptUrl(string token);

    string BuildPasswordResetUrl(string token);
}
