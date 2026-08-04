namespace TroConnect.Api.Data.Entities;

public class Room
{
    public Guid Id { get; set; }
    public Guid BuildingId { get; set; }
    public string Name { get; set; } = string.Empty;
    public decimal BasePrice { get; set; }
    public decimal ServicePrice { get; set; }
    public int MaxOccupancy { get; set; }

    // Deducted from the total rent when the room is occupied by exactly 1 person; null = no discount.
    public decimal? SingleOccupantDiscountAmount { get; set; }

    public DateTimeOffset CreatedAt { get; set; }
    public DateTimeOffset UpdatedAt { get; set; }
}
