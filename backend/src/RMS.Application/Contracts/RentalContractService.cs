using RMS.Application.Common.Exceptions;
using RMS.Application.Common.Interfaces.Persistence;
using RMS.Application.Common.Interfaces.Security;
using RMS.Application.Common.Interfaces.Services;
using RMS.Application.Common.Mapping;
using RMS.Application.Common.Models;
using RMS.Application.Common.Security;
using RMS.Application.Common.Validation;
using RMS.Application.Contracts.Models;
using RMS.Domain.Constants;
using RMS.Domain.Entities;
using RMS.Domain.Enums;

namespace RMS.Application.Contracts;

public sealed class RentalContractService : IRentalContractService
{
    private readonly IRentalContractRepository _contractRepository;
    private readonly IRoomRepository _roomRepository;
    private readonly ITenantRepository _tenantRepository;
    private readonly ICurrentUserService _currentUser;
    private readonly IDateTimeProvider _dateTimeProvider;
    private readonly IUnitOfWork _unitOfWork;

    public RentalContractService(
        IRentalContractRepository contractRepository,
        IRoomRepository roomRepository,
        ITenantRepository tenantRepository,
        ICurrentUserService currentUser,
        IDateTimeProvider dateTimeProvider,
        IUnitOfWork unitOfWork)
    {
        _contractRepository = contractRepository;
        _roomRepository = roomRepository;
        _tenantRepository = tenantRepository;
        _currentUser = currentUser;
        _dateTimeProvider = dateTimeProvider;
        _unitOfWork = unitOfWork;
    }

    public async Task<RentalContractResponse> CreateDraftAsync(
        CreateRentalContractRequest request,
        CancellationToken cancellationToken = default)
    {
        AuthorizationGuard.EnsureAdminOrStaff(_currentUser);
        request = RequestGuard.NotNull(request, nameof(request));
        var roomId = RequestGuard.Required(request.RoomId, nameof(request.RoomId));
        var tenantId = RequestGuard.Required(
            request.TenantId,
            nameof(request.TenantId));
        var monthlyRent = RequestGuard.NonNegative(
            request.MonthlyRent,
            nameof(request.MonthlyRent));

        var room = await _roomRepository.GetByIdAsync(roomId, cancellationToken)
            ?? throw new NotFoundException("Room", roomId);
        _ = await _tenantRepository.GetByIdAsync(tenantId, cancellationToken)
            ?? throw new NotFoundException("Tenant", tenantId);

        EnsureRoomAvailable(room);

        if (await _contractRepository.HasActiveContractForRoomAsync(
                roomId,
                null,
                cancellationToken))
        {
            throw new ConflictException(
                BusinessRuleCodes.SingleActiveContractPerRoom,
                "The room already has an active rental contract.");
        }

        var contract = new RentalContract(
            roomId,
            tenantId,
            request.StartDate,
            request.EndDate,
            monthlyRent,
            _dateTimeProvider.UtcNow);

        _contractRepository.Add(contract);
        await _unitOfWork.SaveChangesAsync(cancellationToken);
        return contract.ToResponse();
    }

    public async Task<RentalContractResponse> UpdateDraftAsync(
        Guid contractId,
        UpdateDraftContractRequest request,
        CancellationToken cancellationToken = default)
    {
        AuthorizationGuard.EnsureAdminOrStaff(_currentUser);
        contractId = RequestGuard.Required(contractId, nameof(contractId));
        request = RequestGuard.NotNull(request, nameof(request));

        var contract = await LoadContractAsync(contractId, cancellationToken);
        contract.UpdateDraftTerms(
            request.StartDate,
            request.EndDate,
            RequestGuard.NonNegative(
                request.MonthlyRent,
                nameof(request.MonthlyRent)),
            _dateTimeProvider.UtcNow);

        await _unitOfWork.SaveChangesAsync(cancellationToken);
        return contract.ToResponse();
    }

    public async Task<RentalContractResponse> ActivateAsync(
        Guid contractId,
        CancellationToken cancellationToken = default)
    {
        AuthorizationGuard.EnsureAdminOrStaff(_currentUser);
        contractId = RequestGuard.Required(contractId, nameof(contractId));

        var contract = await LoadContractAsync(contractId, cancellationToken);
        var room = await _roomRepository.GetByIdAsync(
            contract.RoomId,
            cancellationToken)
            ?? throw new NotFoundException("Room", contract.RoomId);

        EnsureRoomAvailable(room);

        if (await _contractRepository.HasActiveContractForRoomAsync(
                room.Id,
                contract.Id,
                cancellationToken))
        {
            throw new ConflictException(
                BusinessRuleCodes.SingleActiveContractPerRoom,
                "The room already has another active rental contract.");
        }

        var now = _dateTimeProvider.UtcNow;
        contract.Activate(now);
        room.ChangeStatus(
            RoomStatus.Occupied,
            hasActiveContract: true,
            now);

        await _unitOfWork.SaveChangesAsync(cancellationToken);
        return contract.ToResponse();
    }

    public async Task<RentalContractResponse> TerminateAsync(
        Guid contractId,
        CancellationToken cancellationToken = default)
    {
        AuthorizationGuard.EnsureAdminOrStaff(_currentUser);
        contractId = RequestGuard.Required(contractId, nameof(contractId));

        var contract = await LoadContractAsync(contractId, cancellationToken);
        var room = await _roomRepository.GetByIdAsync(
            contract.RoomId,
            cancellationToken)
            ?? throw new NotFoundException("Room", contract.RoomId);

        var now = _dateTimeProvider.UtcNow;
        contract.Terminate(now);
        room.ChangeStatus(
            RoomStatus.Available,
            hasActiveContract: false,
            now);

        await _unitOfWork.SaveChangesAsync(cancellationToken);
        return contract.ToResponse();
    }

    public async Task<RentalContractResponse> CancelDraftAsync(
        Guid contractId,
        CancellationToken cancellationToken = default)
    {
        AuthorizationGuard.EnsureAdminOrStaff(_currentUser);
        contractId = RequestGuard.Required(contractId, nameof(contractId));

        var contract = await LoadContractAsync(contractId, cancellationToken);
        contract.Cancel(_dateTimeProvider.UtcNow);
        await _unitOfWork.SaveChangesAsync(cancellationToken);
        return contract.ToResponse();
    }

    public async Task<RentalContractResponse> GetContractAsync(
        Guid contractId,
        CancellationToken cancellationToken = default)
    {
        AuthorizationGuard.EnsureAuthenticated(_currentUser);
        contractId = RequestGuard.Required(contractId, nameof(contractId));
        var contract = await LoadContractAsync(contractId, cancellationToken);

        if (_currentUser.Role == UserRole.Tenant)
        {
            var tenant = await GetCurrentTenantAsync(cancellationToken);
            AuthorizationGuard.EnsureTenantOwnership(
                contract.TenantId,
                tenant.Id,
                BusinessRuleCodes.TenantOwnDataOnly);
        }
        else
        {
            AuthorizationGuard.EnsureAdminOrStaff(_currentUser);
        }

        return contract.ToResponse();
    }

    public async Task<PagedResult<RentalContractResponse>> GetContractsAsync(
        ContractFilterRequest request,
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

        var contracts = await _contractRepository.GetPagedAsync(
            page,
            status,
            tenantId,
            cancellationToken);

        return contracts.Map(contract => contract.ToResponse());
    }

    private async Task<RentalContract> LoadContractAsync(
        Guid contractId,
        CancellationToken cancellationToken)
    {
        return await _contractRepository.GetByIdAsync(
            contractId,
            cancellationToken)
            ?? throw new NotFoundException("Rental contract", contractId);
    }

    private async Task<Tenant> GetCurrentTenantAsync(
        CancellationToken cancellationToken)
    {
        return await _tenantRepository.GetByUserIdAsync(
            _currentUser.UserId,
            cancellationToken)
            ?? throw new NotFoundException("Tenant profile", _currentUser.UserId);
    }

    private static void EnsureRoomAvailable(Room room)
    {
        if (room.Status != RoomStatus.Available)
        {
            throw new ConflictException(
                BusinessRuleCodes.AvailableRoomRequiredForContract,
                "Only an available room can be used for a rental contract.");
        }
    }
}
