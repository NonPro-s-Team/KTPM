using RMS.Application.Common.Models;
using RMS.Domain.Entities;
using RMS.Domain.Enums;

namespace RMS.Application.Common.Interfaces.Persistence;

public interface IRentalContractRepository
{
    Task<RentalContract?> GetByIdAsync(
        Guid contractId,
        CancellationToken cancellationToken = default);

    Task<PagedResult<RentalContract>> GetPagedAsync(
        PagedRequest request,
        ContractStatus? status,
        Guid? tenantId,
        CancellationToken cancellationToken = default);

    Task<bool> HasActiveContractForRoomAsync(
        Guid roomId,
        Guid? excludeContractId,
        CancellationToken cancellationToken = default);

    Task<RentalContract?> GetActiveContractByTenantIdAsync(
        Guid tenantId,
        CancellationToken cancellationToken = default);

    void Add(RentalContract contract);
}
