namespace RMS.Domain.Exceptions;

public class BusinessRuleException : DomainException
{
    public string RuleCode { get; }

    public BusinessRuleException(string ruleCode, string message) : base(message)
    {
        RuleCode = ruleCode;
    }
}
