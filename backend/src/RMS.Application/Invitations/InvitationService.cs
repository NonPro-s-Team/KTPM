using RMS.Application.Common.Exceptions;
using RMS.Application.Common.Interfaces.Persistence;
using RMS.Application.Common.Interfaces.Security;
using RMS.Application.Common.Interfaces.Services;
using RMS.Application.Common.Models;
using RMS.Application.Common.Security;
using RMS.Application.Common.Validation;
using RMS.Application.Invitations.Models;
using RMS.Domain.Entities;
using RMS.Domain.Enums;

namespace RMS.Application.Invitations;

public sealed class InvitationService : IInvitationService
{
    private static readonly TimeSpan InvitationLifetime = TimeSpan.FromDays(7);

    private readonly IUserRepository _userRepository;
    private readonly IUserInvitationRepository _invitationRepository;
    private readonly IPasswordHasher _passwordHasher;
    private readonly ISecureTokenGenerator _secureTokenGenerator;
    private readonly IEmailSender _emailSender;
    private readonly IEmailLinkBuilder _emailLinkBuilder;
    private readonly ICurrentUserService _currentUser;
    private readonly IDateTimeProvider _dateTimeProvider;
    private readonly IUnitOfWork _unitOfWork;

    public InvitationService(
        IUserRepository userRepository,
        IUserInvitationRepository invitationRepository,
        IPasswordHasher passwordHasher,
        ISecureTokenGenerator secureTokenGenerator,
        IEmailSender emailSender,
        IEmailLinkBuilder emailLinkBuilder,
        ICurrentUserService currentUser,
        IDateTimeProvider dateTimeProvider,
        IUnitOfWork unitOfWork)
    {
        _userRepository = userRepository;
        _invitationRepository = invitationRepository;
        _passwordHasher = passwordHasher;
        _secureTokenGenerator = secureTokenGenerator;
        _emailSender = emailSender;
        _emailLinkBuilder = emailLinkBuilder;
        _currentUser = currentUser;
        _dateTimeProvider = dateTimeProvider;
        _unitOfWork = unitOfWork;
    }

    public async Task<InvitationResponse> CreateInvitationAsync(
        CreateInvitationRequest request,
        CancellationToken cancellationToken = default)
    {
        AuthorizationGuard.EnsureAdmin(_currentUser);
        request = RequestGuard.NotNull(request, nameof(request));

        var email = RequestGuard.Email(request.Email, nameof(request.Email));
        var role = RequestGuard.DefinedEnum(request.Role, nameof(request.Role));
        if (role == UserRole.Tenant)
        {
            throw new ValidationException(
                "Invitations support only Staff or Admin roles.");
        }

        if (await _userRepository.EmailExistsAsync(email, null, cancellationToken))
        {
            throw new ConflictException(
                ApplicationErrorCodes.EmailAlreadyExists,
                "The email is already in use.");
        }

        var now = _dateTimeProvider.UtcNow;
        var activeInvitations = await _invitationRepository.GetActiveByEmailAsync(
            email,
            cancellationToken);
        foreach (var activeInvitation in activeInvitations)
        {
            activeInvitation.Revoke(now);
        }

        var token = _secureTokenGenerator.GenerateToken();
        var invitation = new UserInvitation(
            email,
            role,
            _secureTokenGenerator.Hash(token),
            _currentUser.UserId,
            now.Add(InvitationLifetime),
            now);
        _invitationRepository.Add(invitation);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        var acceptUrl = _emailLinkBuilder.BuildInvitationAcceptUrl(token);
        await _emailSender.SendAsync(
            new OutgoingEmail(
                email,
                "Lời mời tạo tài khoản TroConnect",
                $"""
                <p>Bạn được mời tạo tài khoản {DescribeRole(role)} trên TroConnect.</p>
                <p><a href="{acceptUrl}">Bấm vào đây để tạo tài khoản</a> (liên kết có hiệu lực trong 7 ngày).</p>
                <p>Nếu bạn không mong đợi email này, vui lòng bỏ qua.</p>
                """),
            cancellationToken);

        return new InvitationResponse(
            invitation.Id,
            invitation.Email,
            invitation.Role,
            invitation.ExpiresAt,
            invitation.CreatedAt);
    }

    public async Task<InvitationPreviewResponse> GetInvitationByTokenAsync(
        string token,
        CancellationToken cancellationToken = default)
    {
        var invitation = await GetUsableInvitationAsync(token, cancellationToken);
        return new InvitationPreviewResponse(
            invitation.Email,
            invitation.Role,
            invitation.ExpiresAt);
    }

    public async Task<AcceptInvitationResponse> AcceptInvitationAsync(
        AcceptInvitationRequest request,
        CancellationToken cancellationToken = default)
    {
        request = RequestGuard.NotNull(request, nameof(request));
        var username = RequestGuard.Required(
            request.Username,
            nameof(request.Username),
            User.UsernameMaxLength);
        var password = RequestGuard.Password(request.Password, nameof(request.Password));

        var invitation = await GetUsableInvitationAsync(
            request.Token,
            cancellationToken);

        if (await _userRepository.UsernameExistsAsync(
                username,
                null,
                cancellationToken))
        {
            throw new ConflictException(
                ApplicationErrorCodes.UsernameAlreadyExists,
                "The username is already in use.");
        }

        if (await _userRepository.EmailExistsAsync(
                invitation.Email,
                null,
                cancellationToken))
        {
            throw new ConflictException(
                ApplicationErrorCodes.EmailAlreadyExists,
                "The email is already in use.");
        }

        var now = _dateTimeProvider.UtcNow;
        var passwordHash = _passwordHasher.Hash(password);
        var user = new User(username, passwordHash, invitation.Role, now);
        user.SetEmail(invitation.Email, now);
        invitation.MarkAccepted(now);

        _userRepository.Add(user);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return new AcceptInvitationResponse(user.Id, user.Username, user.Role);
    }

    private async Task<UserInvitation> GetUsableInvitationAsync(
        string token,
        CancellationToken cancellationToken)
    {
        token = RequestGuard.Required(token, nameof(token));
        var tokenHash = _secureTokenGenerator.Hash(token);
        var invitation = await _invitationRepository.GetByTokenHashAsync(
            tokenHash,
            cancellationToken);

        if (invitation is null
            || invitation.AcceptedAt is not null
            || invitation.RevokedAt is not null)
        {
            throw new ValidationException(
                ApplicationErrorCodes.InvalidInvitationToken,
                "The invitation link is invalid.");
        }

        if (_dateTimeProvider.UtcNow >= invitation.ExpiresAt)
        {
            throw new ValidationException(
                ApplicationErrorCodes.InvitationExpired,
                "The invitation link has expired.");
        }

        return invitation;
    }

    private static string DescribeRole(UserRole role) => role switch
    {
        UserRole.Admin => "quản trị viên",
        UserRole.Staff => "nhân viên",
        _ => role.ToString(),
    };
}
