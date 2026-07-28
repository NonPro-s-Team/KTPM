namespace RMS.Application.Features.RepairRequests.Dtos;

public class CreateRepairRequest
{
    public Guid RoomId { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
}
