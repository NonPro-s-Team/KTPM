using RMS.Application.Common.Exceptions;
using RMS.Application.Common.Interfaces.Persistence;
using RMS.Application.Common.Interfaces.Security;
using RMS.Application.Common.Interfaces.Services;
using RMS.Application.Common.Mapping;
using RMS.Application.Common.Models;
using RMS.Application.Common.Security;
using RMS.Application.Common.Validation;
using RMS.Application.MaintenanceRequests.Models;
using RMS.Domain.Constants;
using RMS.Domain.Entities;
using RMS.Domain.Enums;

namespace RMS.Application.MaintenanceRequests;

public sealed class MaintenanceRequestService : IMaintenanceRequestService
{
    private readonly IMaintenanceRequestRepository _maintenanceRepository;
    private readonly IRentalContractRepository _contractRepository;
    private readonly ITenantRepository _tenantRepository;
    private readonly ICurrentUserService _currentUser;
    private readonly IDateTimeProvider _dateTimeProvider;
    private readonly IUnitOfWork _unitOfWork;

    public MaintenanceRequestService(
        IMaintenanceRequestRepository maintenanceRepository,
        IRentalContractRepository contractRepository,
        ITenantRepository tenantRepository,
        ICurrentUserService currentUser,
        IDateTimeProvider dateTimeProvider,
        IUnitOfWork unitOfWork)
    {
        _maintenanceRepository = maintenanceRepository;
        _contractRepository = contractRepository;
        _tenantRepository = tenantRepository;
        _currentUser = currentUser;
        _dateTimeProvider = dateTimeProvider;
        _unitOfWork = unitOfWork;
    }

    public async Task<MaintenanceRequestResponse> CreateAsync(
        CreateMaintenanceRequestRequest request,
        CancellationToken cancellationToken = default)
    {
        AuthorizationGuard.EnsureTenant(_currentUser);
        request = RequestGuard.NotNull(request, nameof(request));
        var title = RequestGuard.Required(
            request.Title,
            nameof(request.Title),
            MaintenanceRequest.TitleMaxLength);
        var description = RequestGuard.Required(
            request.Description,
            nameof(request.Description),
            MaintenanceRequest.DescriptionMaxLength);

        var tenant = await GetCurrentTenantAsync(cancellationToken);
        var contract =
            await _contractRepository.GetActiveContractByTenantIdAsync(
                tenant.Id,
                cancellationToken);

        if (contract is null)
        {
            throw new ForbiddenAccessException(
                BusinessRuleCodes.TenantMaintenanceRequiresActiveContract,
                "A tenant needs an active rental contract to create a maintenance request.");
        }

        var maintenanceRequest = new MaintenanceRequest(
            tenant.Id,
            contract.RoomId,
            title,
            description,
            _dateTimeProvider.UtcNow);

        _maintenanceRepository.Add(maintenanceRequest);
        await _unitOfWork.SaveChangesAsync(cancellationToken);
        return maintenanceRequest.ToResponse();
    }

    public async Task<MaintenanceRequestResponse> StartProgressAsync(
        Guid requestId,
        StartMaintenanceRequestRequest request,
        CancellationToken cancellationToken = default)
    {
        AuthorizationGuard.EnsureAdminOrStaff(
            _currentUser,
            BusinessRuleCodes.MaintenanceUpdatePermission);
        request = RequestGuard.NotNull(request, nameof(request));
        var maintenanceRequest = await LoadAsync(requestId, cancellationToken);

        maintenanceRequest.StartProgress(
            _currentUser.UserId,
            request.Note,
            _dateTimeProvider.UtcNow);

        await _unitOfWork.SaveChangesAsync(cancellationToken);
        return maintenanceRequest.ToResponse();
    }

    public async Task<MaintenanceRequestResponse> AddProgressNoteAsync(
        Guid requestId,
        AddMaintenanceProgressRequest request,
        CancellationToken cancellationToken = default)
    {
        AuthorizationGuard.EnsureAdminOrStaff(
            _currentUser,
            BusinessRuleCodes.MaintenanceUpdatePermission);
        request = RequestGuard.NotNull(request, nameof(request));
        var note = RequestGuard.Required(
            request.Note,
            nameof(request.Note),
            MaintenanceRequest.NoteMaxLength);
        var maintenanceRequest = await LoadAsync(requestId, cancellationToken);

        maintenanceRequest.AddProgressNote(
            _currentUser.UserId,
            note,
            _dateTimeProvider.UtcNow);

        await _unitOfWork.SaveChangesAsync(cancellationToken);
        return maintenanceRequest.ToResponse();
    }

    public async Task<MaintenanceRequestResponse> ResolveAsync(
        Guid requestId,
        ResolveMaintenanceRequestRequest request,
        CancellationToken cancellationToken = default)
    {
        AuthorizationGuard.EnsureAdminOrStaff(
            _currentUser,
            BusinessRuleCodes.MaintenanceUpdatePermission);
        request = RequestGuard.NotNull(request, nameof(request));
        var resolutionNote = RequestGuard.Required(
            request.ResolutionNote,
            nameof(request.ResolutionNote),
            MaintenanceRequest.NoteMaxLength);
        var maintenanceRequest = await LoadAsync(requestId, cancellationToken);

        maintenanceRequest.Resolve(
            _currentUser.UserId,
            resolutionNote,
            _dateTimeProvider.UtcNow);

        await _unitOfWork.SaveChangesAsync(cancellationToken);
        return maintenanceRequest.ToResponse();
    }

    public async Task<MaintenanceRequestResponse> CloseAsync(
        Guid requestId,
        CloseMaintenanceRequestRequest request,
        CancellationToken cancellationToken = default)
    {
        AuthorizationGuard.EnsureAdminOrStaff(
            _currentUser,
            BusinessRuleCodes.MaintenanceUpdatePermission);
        request = RequestGuard.NotNull(request, nameof(request));
        var maintenanceRequest = await LoadAsync(requestId, cancellationToken);

        maintenanceRequest.Close(
            _currentUser.UserId,
            request.Note,
            _dateTimeProvider.UtcNow);

        await _unitOfWork.SaveChangesAsync(cancellationToken);
        return maintenanceRequest.ToResponse();
    }

    public async Task<MaintenanceRequestResponse> GetByIdAsync(
        Guid requestId,
        CancellationToken cancellationToken = default)
    {
        AuthorizationGuard.EnsureAuthenticated(_currentUser);
        var maintenanceRequest = await LoadAsync(requestId, cancellationToken);

        if (_currentUser.Role == UserRole.Tenant)
        {
            var tenant = await GetCurrentTenantAsync(cancellationToken);
            AuthorizationGuard.EnsureTenantOwnership(
                maintenanceRequest.TenantId,
                tenant.Id,
                BusinessRuleCodes.TenantOwnDataOnly);
        }
        else
        {
            AuthorizationGuard.EnsureAdminOrStaff(_currentUser);
        }

        return maintenanceRequest.ToResponse();
    }

    public async Task<PagedResult<MaintenanceRequestResponse>> GetPagedAsync(
        MaintenanceRequestFilterRequest request,
        CancellationToken cancellationToken = default)
    {
        AuthorizationGuard.EnsureAuthenticated(_currentUser);
        request = RequestGuard.NotNull(request, nameof(request));
        var page = RequestGuard.Pagination(
            request.PageNumber,
            request.PageSize);
        var status = RequestGuard.DefinedEnum(
            request.Status,
            nameof(request.Status));

        Guid? tenantId = null;
        if (_currentUser.Role == UserRole.Tenant)
        {
            tenantId = (await GetCurrentTenantAsync(cancellationToken)).Id;
        }
        else
        {
            AuthorizationGuard.EnsureAdminOrStaff(_currentUser);
        }

        var maintenanceRequests = await _maintenanceRepository.GetPagedAsync(
            page,
            status,
            tenantId,
            cancellationToken);

        return maintenanceRequests.Map(item => item.ToResponse());
    }

    private async Task<MaintenanceRequest> LoadAsync(
        Guid requestId,
        CancellationToken cancellationToken)
    {
        requestId = RequestGuard.Required(requestId, nameof(requestId));
        return await _maintenanceRepository.GetByIdAsync(
            requestId,
            cancellationToken)
            ?? throw new NotFoundException("Maintenance request", requestId);
    }

    private async Task<Tenant> GetCurrentTenantAsync(
        CancellationToken cancellationToken)
    {
        return await _tenantRepository.GetByUserIdAsync(
            _currentUser.UserId,
            cancellationToken)
            ?? throw new NotFoundException("Tenant profile", _currentUser.UserId);
    }
}
