using RMS.Application.Common.Exceptions;
using RMS.Application.Common.Interfaces.Persistence;
using RMS.Application.Common.Interfaces.Security;
using RMS.Application.Common.Interfaces.Services;
using RMS.Application.Common.Mapping;
using RMS.Application.Common.Models;
using RMS.Application.Common.Security;
using RMS.Application.Common.Validation;
using RMS.Application.Tenants.Models;
using RMS.Domain.Constants;
using RMS.Domain.Entities;
using RMS.Domain.Enums;

namespace RMS.Application.Tenants;

public sealed class TenantService : ITenantService
{
    private readonly IUserRepository _userRepository;
    private readonly ITenantRepository _tenantRepository;
    private readonly IPasswordHasher _passwordHasher;
    private readonly ICurrentUserService _currentUser;
    private readonly IDateTimeProvider _dateTimeProvider;
    private readonly IUnitOfWork _unitOfWork;

    public TenantService(
        IUserRepository userRepository,
        ITenantRepository tenantRepository,
        IPasswordHasher passwordHasher,
        ICurrentUserService currentUser,
        IDateTimeProvider dateTimeProvider,
        IUnitOfWork unitOfWork)
    {
        _userRepository = userRepository;
        _tenantRepository = tenantRepository;
        _passwordHasher = passwordHasher;
        _currentUser = currentUser;
        _dateTimeProvider = dateTimeProvider;
        _unitOfWork = unitOfWork;
    }

    public async Task<TenantResponse> CreateTenantAsync(
        CreateTenantRequest request,
        CancellationToken cancellationToken = default)
    {
        AuthorizationGuard.EnsureAdminOrStaff(_currentUser);
        request = RequestGuard.NotNull(request, nameof(request));

        var username = RequestGuard.Required(
            request.Username,
            nameof(request.Username),
            User.UsernameMaxLength);
        var initialPassword = RequestGuard.Password(
            request.InitialPassword,
            nameof(request.InitialPassword));
        var fullName = RequestGuard.Required(
            request.FullName,
            nameof(request.FullName),
            Tenant.FullNameMaxLength);
        var phoneNumber = RequestGuard.Required(
            request.PhoneNumber,
            nameof(request.PhoneNumber),
            Tenant.PhoneNumberMaxLength);
        var citizenId = RequestGuard.Required(
            request.CitizenId,
            nameof(request.CitizenId),
            Tenant.CitizenIdMaxLength);

        if (await _userRepository.UsernameExistsAsync(
                username,
                null,
                cancellationToken))
        {
            throw new ConflictException("The username is already in use.");
        }

        var now = _dateTimeProvider.UtcNow;
        var passwordHash = _passwordHasher.Hash(initialPassword);
        var user = new User(username, passwordHash, UserRole.Tenant, now);
        var tenant = new Tenant(
            user.Id,
            fullName,
            phoneNumber,
            citizenId,
            now);

        _userRepository.Add(user);
        _tenantRepository.Add(tenant);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return tenant.ToResponse(user.Username);
    }

    public async Task<TenantResponse> UpdateTenantAsync(
        Guid tenantId,
        UpdateTenantRequest request,
        CancellationToken cancellationToken = default)
    {
        AuthorizationGuard.EnsureAdminOrStaff(_currentUser);
        tenantId = RequestGuard.Required(tenantId, nameof(tenantId));
        request = RequestGuard.NotNull(request, nameof(request));

        var tenant = await _tenantRepository.GetByIdAsync(
            tenantId,
            cancellationToken)
            ?? throw new NotFoundException("Tenant", tenantId);

        tenant.UpdateProfile(
            RequestGuard.Required(
                request.FullName,
                nameof(request.FullName),
                Tenant.FullNameMaxLength),
            RequestGuard.Required(
                request.PhoneNumber,
                nameof(request.PhoneNumber),
                Tenant.PhoneNumberMaxLength),
            RequestGuard.Required(
                request.CitizenId,
                nameof(request.CitizenId),
                Tenant.CitizenIdMaxLength),
            _dateTimeProvider.UtcNow);

        await _unitOfWork.SaveChangesAsync(cancellationToken);
        return tenant.ToResponse();
    }

    public async Task<TenantResponse> GetTenantByIdAsync(
        Guid tenantId,
        CancellationToken cancellationToken = default)
    {
        AuthorizationGuard.EnsureAuthenticated(_currentUser);
        tenantId = RequestGuard.Required(tenantId, nameof(tenantId));

        var tenant = await _tenantRepository.GetByIdAsync(
            tenantId,
            cancellationToken)
            ?? throw new NotFoundException("Tenant", tenantId);

        if (_currentUser.Role == UserRole.Tenant)
        {
            if (tenant.UserId != _currentUser.UserId)
            {
                throw new ForbiddenAccessException(
                    BusinessRuleCodes.TenantOwnDataOnly,
                    "Tenants may access only their own profile.");
            }
        }
        else
        {
            AuthorizationGuard.EnsureAdminOrStaff(_currentUser);
        }

        return tenant.ToResponse();
    }

    public async Task<TenantResponse> GetCurrentTenantAsync(
        CancellationToken cancellationToken = default)
    {
        AuthorizationGuard.EnsureTenant(_currentUser);

        var tenant = await _tenantRepository.GetByUserIdAsync(
            _currentUser.UserId,
            cancellationToken)
            ?? throw new NotFoundException("Tenant profile", _currentUser.UserId);

        return tenant.ToResponse();
    }

    public async Task<PagedResult<TenantResponse>> GetTenantsAsync(
        TenantFilterRequest request,
        CancellationToken cancellationToken = default)
    {
        AuthorizationGuard.EnsureAdminOrStaff(_currentUser);
        request = RequestGuard.NotNull(request, nameof(request));
        var page = RequestGuard.Pagination(
            request.PageNumber,
            request.PageSize);

        var tenants = await _tenantRepository.GetPagedAsync(
            page,
            cancellationToken);

        return tenants.Map(tenant => tenant.ToResponse());
    }
}
