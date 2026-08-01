using RMS.Application.Invitations.Models;

namespace RMS.Application.Invitations;

public interface IInvitationService
{
    Task<InvitationResponse> CreateInvitationAsync(
        CreateInvitationRequest request,
        CancellationToken cancellationToken = default);

    Task<InvitationPreviewResponse> GetInvitationByTokenAsync(
        string token,
        CancellationToken cancellationToken = default);

    Task<AcceptInvitationResponse> AcceptInvitationAsync(
        AcceptInvitationRequest request,
        CancellationToken cancellationToken = default);
}
