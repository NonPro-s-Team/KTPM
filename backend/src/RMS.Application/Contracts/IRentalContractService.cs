using RMS.Application.Common.Models;
using RMS.Application.Contracts.Models;

namespace RMS.Application.Contracts;

public interface IRentalContractService
{
    Task<RentalContractResponse> CreateDraftAsync(
        CreateRentalContractRequest request,
        CancellationToken cancellationToken = default);

    Task<RentalContractResponse> UpdateDraftAsync(
        Guid contractId,
        UpdateDraftContractRequest request,
        CancellationToken cancellationToken = default);

    Task<RentalContractResponse> ActivateAsync(
        Guid contractId,
        CancellationToken cancellationToken = default);

    Task<RentalContractResponse> TerminateAsync(
        Guid contractId,
        CancellationToken cancellationToken = default);

    Task<RentalContractResponse> CancelDraftAsync(
        Guid contractId,
        CancellationToken cancellationToken = default);

    Task<RentalContractResponse> GetContractAsync(
        Guid contractId,
        CancellationToken cancellationToken = default);

    Task<PagedResult<RentalContractResponse>> GetContractsAsync(
        ContractFilterRequest request,
        CancellationToken cancellationToken = default);
}
