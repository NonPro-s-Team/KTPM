using FluentAssertions;
using RMS.Domain.Constants;
using RMS.Domain.Exceptions;
using RMS.Domain.ValueObjects;

namespace RMS.UnitTests.Domain;

public class BillingPeriodTests
{
    [Theory]
    [InlineData(1)]
    [InlineData(2)]
    [InlineData(3)]
    [InlineData(4)]
    [InlineData(5)]
    [InlineData(6)]
    [InlineData(7)]
    [InlineData(8)]
    [InlineData(9)]
    [InlineData(10)]
    [InlineData(11)]
    [InlineData(12)]
    public void Constructor_MonthBetweenOneAndTwelve_CreatesBillingPeriod(
        int month)
    {
        // Arrange
        const int year = 2026;

        // Act
        var billingPeriod = new BillingPeriod(month, year);

        // Assert
        billingPeriod.Month.Should().Be(month);
        billingPeriod.Year.Should().Be(year);
    }

    [Fact]
    public void Constructor_MonthZero_ThrowsDomainException()
    {
        // Arrange
        const int invalidMonth = 0;

        // Act
        Action act = () => new BillingPeriod(invalidMonth, 2026);

        // Assert
        var exception = act.Should().Throw<DomainException>().Which;
        exception.Code.Should().Be(DomainErrorCodes.InvalidDateRange);
        exception.Message.Should().Contain("month");
    }

    [Fact]
    public void Constructor_MonthThirteen_ThrowsDomainException()
    {
        // Arrange
        const int invalidMonth = 13;

        // Act
        Action act = () => new BillingPeriod(invalidMonth, 2026);

        // Assert
        var exception = act.Should().Throw<DomainException>().Which;
        exception.Code.Should().Be(DomainErrorCodes.InvalidDateRange);
        exception.Message.Should().Contain("month");
    }

    [Fact]
    public void Equality_SameMonthAndYear_AreEqual()
    {
        // Arrange
        var first = new BillingPeriod(7, 2026);
        var second = new BillingPeriod(7, 2026);

        // Act
        var areEqual = first == second;

        // Assert
        areEqual.Should().BeTrue();
        first.Should().Be(second);
        first.GetHashCode().Should().Be(second.GetHashCode());
    }
}
