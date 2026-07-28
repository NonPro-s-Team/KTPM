using RMS.Domain.Enums;

namespace RMS.Application.Features.RepairRequests.Dtos;

public class UpdateRepairStatusRequest
{
    public RepairStatus Status { get; set; }
}
