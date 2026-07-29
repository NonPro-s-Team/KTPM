namespace RMS.Domain.Exceptions;

public class BusinessRuleException : DomainException
{
    public string RuleCode => Code;

    public BusinessRuleException(string ruleCode, string message)
        : base(ruleCode, message)
    {
    }
}
