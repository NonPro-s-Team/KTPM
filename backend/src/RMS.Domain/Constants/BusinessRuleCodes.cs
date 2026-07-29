namespace RMS.Domain.Constants;

public static class BusinessRuleCodes
{
    public const string RoomManagementPermission = "BR-01";
    public const string ActiveContractRequiresOccupiedRoom = "BR-02";
    public const string AvailableRoomRequiredForContract = "BR-03";
    public const string SingleActiveContractPerRoom = "BR-04";
    public const string ContractEndDateAfterStartDate = "BR-05";
    public const string ContractRequiresRoomAndTenant = "BR-06";
    public const string ContractActivationOccupiesRoom = "BR-07";
    public const string ContractTerminationReleasesRoom = "BR-08";
    public const string UtilityEndReadingsNotBelowStart = "BR-09";
    public const string SingleInvoicePerBillingPeriod = "BR-10";
    public const string DraftInvoiceHiddenFromTenant = "BR-11";
    public const string PaymentAmountMustBePositive = "BR-12";
    public const string PaymentCannotExceedInvoiceTotal = "BR-13";
    public const string FullPaymentMarksInvoicePaid = "BR-14";
    public const string PartialPaymentMarksInvoicePartiallyPaid = "BR-15";
    public const string TenantOwnDataOnly = "BR-16";
    public const string TenantMaintenanceRequiresActiveContract = "BR-17";
    public const string MaintenanceUpdatePermission = "BR-18";
    public const string PaidInvoiceImmutable = "BR-19";
    public const string PaymentHistoryRequired = "BR-20";
}

