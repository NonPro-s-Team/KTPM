using RMS.Application.Common.Exceptions;
using RMS.Application.Common.Interfaces.Persistence;
using RMS.Application.Common.Interfaces.Security;
using RMS.Application.Common.Interfaces.Services;
using RMS.Application.Common.Mapping;
using RMS.Application.Common.Models;
using RMS.Application.Common.Security;
using RMS.Application.Common.Validation;
using RMS.Application.Rooms.Models;
using RMS.Domain.Constants;
using RMS.Domain.Entities;
using RMS.Domain.Enums;

namespace RMS.Application.Rooms;

public sealed class RoomService : IRoomService
{
    private readonly IRoomRepository _roomRepository;
    private readonly IRentalContractRepository _contractRepository;
    private readonly ICurrentUserService _currentUser;
    private readonly IDateTimeProvider _dateTimeProvider;
    private readonly IUnitOfWork _unitOfWork;

    public RoomService(
        IRoomRepository roomRepository,
        IRentalContractRepository contractRepository,
        ICurrentUserService currentUser,
        IDateTimeProvider dateTimeProvider,
        IUnitOfWork unitOfWork)
    {
        _roomRepository = roomRepository;
        _contractRepository = contractRepository;
        _currentUser = currentUser;
        _dateTimeProvider = dateTimeProvider;
        _unitOfWork = unitOfWork;
    }

    public async Task<RoomResponse> CreateRoomAsync(
        CreateRoomRequest request,
        CancellationToken cancellationToken = default)
    {
        AuthorizationGuard.EnsureAdminOrStaff(
            _currentUser,
            BusinessRuleCodes.RoomManagementPermission);
        request = RequestGuard.NotNull(request, nameof(request));

        var roomNumber = RequestGuard.Required(
            request.RoomNumber,
            nameof(request.RoomNumber),
            Room.RoomNumberMaxLength);
        var monthlyRent = RequestGuard.NonNegative(
            request.MonthlyRent,
            nameof(request.MonthlyRent));

        if (await _roomRepository.RoomNumberExistsAsync(
                roomNumber,
                null,
                cancellationToken))
        {
            throw new ConflictException("The room number is already in use.");
        }

        var room = new Room(
            roomNumber,
            monthlyRent,
            request.Description,
            _dateTimeProvider.UtcNow);

        _roomRepository.Add(room);
        await _unitOfWork.SaveChangesAsync(cancellationToken);
        return room.ToResponse();
    }

    public async Task<RoomResponse> UpdateRoomAsync(
        Guid roomId,
        UpdateRoomRequest request,
        CancellationToken cancellationToken = default)
    {
        AuthorizationGuard.EnsureAdminOrStaff(
            _currentUser,
            BusinessRuleCodes.RoomManagementPermission);
        roomId = RequestGuard.Required(roomId, nameof(roomId));
        request = RequestGuard.NotNull(request, nameof(request));

        var room = await LoadRoomAsync(roomId, cancellationToken);
        var roomNumber = RequestGuard.Required(
            request.RoomNumber,
            nameof(request.RoomNumber),
            Room.RoomNumberMaxLength);

        if (await _roomRepository.RoomNumberExistsAsync(
                roomNumber,
                room.Id,
                cancellationToken))
        {
            throw new ConflictException("The room number is already in use.");
        }

        room.UpdateDetails(
            roomNumber,
            RequestGuard.NonNegative(
                request.MonthlyRent,
                nameof(request.MonthlyRent)),
            request.Description,
            _dateTimeProvider.UtcNow);

        await _unitOfWork.SaveChangesAsync(cancellationToken);
        return room.ToResponse();
    }

    public async Task<RoomResponse> ChangeRoomStatusAsync(
        Guid roomId,
        ChangeRoomStatusRequest request,
        CancellationToken cancellationToken = default)
    {
        AuthorizationGuard.EnsureAdminOrStaff(
            _currentUser,
            BusinessRuleCodes.RoomManagementPermission);
        roomId = RequestGuard.Required(roomId, nameof(roomId));
        request = RequestGuard.NotNull(request, nameof(request));
        var targetStatus = RequestGuard.DefinedEnum(
            request.TargetStatus,
            nameof(request.TargetStatus));

        var room = await LoadRoomAsync(roomId, cancellationToken);
        var hasActiveContract =
            await _contractRepository.HasActiveContractForRoomAsync(
                room.Id,
                null,
                cancellationToken);

        room.ChangeStatus(
            targetStatus,
            hasActiveContract,
            _dateTimeProvider.UtcNow);

        await _unitOfWork.SaveChangesAsync(cancellationToken);
        return room.ToResponse();
    }

    public async Task<RoomResponse> GetRoomByIdAsync(
        Guid roomId,
        CancellationToken cancellationToken = default)
    {
        AuthorizationGuard.EnsureAuthenticated(_currentUser);
        roomId = RequestGuard.Required(roomId, nameof(roomId));
        return (await LoadRoomAsync(roomId, cancellationToken)).ToResponse();
    }

    public async Task<PagedResult<RoomResponse>> GetRoomsAsync(
        RoomFilterRequest request,
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

        if (_currentUser.Role == UserRole.Tenant && status.HasValue)
        {
            throw new ForbiddenAccessException(
                BusinessRuleCodes.RoomManagementPermission,
                "Tenant users cannot filter rooms by status.");
        }

        if (_currentUser.Role is not UserRole.Tenant)
        {
            AuthorizationGuard.EnsureAdminOrStaff(_currentUser);
        }

        var rooms = await _roomRepository.GetPagedAsync(
            page,
            status,
            cancellationToken);

        return rooms.Map(room => room.ToResponse());
    }

    private async Task<Room> LoadRoomAsync(
        Guid roomId,
        CancellationToken cancellationToken)
    {
        return await _roomRepository.GetByIdAsync(roomId, cancellationToken)
            ?? throw new NotFoundException("Room", roomId);
    }
}
