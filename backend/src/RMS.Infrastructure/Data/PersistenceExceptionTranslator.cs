using Microsoft.Data.SqlClient;
using Microsoft.EntityFrameworkCore;
using RMS.Application.Common.Exceptions;
using RMS.Domain.Constants;

namespace RMS.Infrastructure.Data;

internal static class PersistenceExceptionTranslator
{
    private const int DuplicateIndexError = 2601;
    private const int DuplicateConstraintError = 2627;

    public static ConflictException Translate(
        DbUpdateConcurrencyException exception)
    {
        ArgumentNullException.ThrowIfNull(exception);

        return new ConflictException(
            ApplicationErrorCodes.ConcurrencyConflict,
            "The data was changed by another operation. Reload and try again.");
    }

    public static ConflictException? TryTranslate(DbUpdateException exception)
    {
        ArgumentNullException.ThrowIfNull(exception);

        if (exception.GetBaseException() is not SqlException sqlException
            || sqlException.Number is not DuplicateIndexError
                and not DuplicateConstraintError)
        {
            return null;
        }

        return sqlException.Message switch
        {
            var message when message.Contains(
                "UX_RentalContracts_Room_Active",
                StringComparison.OrdinalIgnoreCase) =>
                new ConflictException(
                    BusinessRuleCodes.SingleActiveContractPerRoom,
                    "The room already has an active rental contract."),
            var message when message.Contains(
                "UX_Invoices_Contract_BillingPeriod",
                StringComparison.OrdinalIgnoreCase) =>
                new ConflictException(
                    BusinessRuleCodes.SingleInvoicePerBillingPeriod,
                    "An invoice already exists for this contract and billing period."),
            var message when message.Contains(
                "UX_Users_Username",
                StringComparison.OrdinalIgnoreCase) =>
                new ConflictException(
                    ApplicationErrorCodes.UsernameAlreadyExists,
                    "The username is already in use."),
            var message when message.Contains(
                "UX_Rooms_RoomNumber",
                StringComparison.OrdinalIgnoreCase) =>
                new ConflictException(
                    ApplicationErrorCodes.RoomNumberAlreadyExists,
                    "The room number is already in use."),
            _ => new ConflictException(
                ApplicationErrorCodes.Conflict,
                "A database constraint was violated.")
        };
    }
}
