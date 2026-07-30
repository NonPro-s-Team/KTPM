using RMS.Domain.Enums;

namespace RMS.Application.Invoices.Models;

public sealed record CreateInvoiceRequest(
    Guid ContractId,
    int BillingMonth,
    int BillingYear,
    decimal ElectricityStartReading,
    decimal ElectricityEndReading,
    decimal WaterStartReading,
    decimal WaterEndReading,
    decimal ElectricityUnitPrice,
    decimal WaterUnitPrice);

public sealed record UpdateDraftInvoiceRequest(
    decimal RentAmount,
    decimal ElectricityStartReading,
    decimal ElectricityEndReading,
    decimal WaterStartReading,
    decimal WaterEndReading,
    decimal ElectricityUnitPrice,
    decimal WaterUnitPrice);

public sealed record RegisterPaymentRequest(decimal Amount, string? Note);

public sealed record InvoiceFilterRequest(
    int PageNumber,
    int PageSize,
    InvoiceStatus? Status);

public sealed record InvoiceResponse(
    Guid Id,
    Guid ContractId,
    int BillingMonth,
    int BillingYear,
    decimal RentAmount,
    decimal ElectricityStartReading,
    decimal ElectricityEndReading,
    decimal WaterStartReading,
    decimal WaterEndReading,
    decimal ElectricityUnitPrice,
    decimal WaterUnitPrice,
    decimal ElectricityAmount,
    decimal WaterAmount,
    decimal TotalAmount,
    decimal PaidAmount,
    decimal OutstandingAmount,
    InvoiceStatus Status,
    DateTimeOffset? IssuedAt,
    DateTimeOffset? PaidAt,
    DateTimeOffset CreatedAt);

public sealed record PaymentResponse(
    Guid Id,
    Guid InvoiceId,
    decimal Amount,
    string? Note,
    Guid RecordedByUserId,
    DateTimeOffset PaidAt);

public sealed record InvoiceDetailsResponse(
    InvoiceResponse Invoice,
    IReadOnlyList<PaymentResponse> Payments);
