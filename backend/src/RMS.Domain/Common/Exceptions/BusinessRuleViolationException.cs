namespace RMS.Domain.Exceptions;

public sealed class BusinessRuleViolationException : BusinessRuleException
{
    public BusinessRuleViolationException(string businessRuleCode, string message)
        : base(businessRuleCode, message)
    {
    }
}

