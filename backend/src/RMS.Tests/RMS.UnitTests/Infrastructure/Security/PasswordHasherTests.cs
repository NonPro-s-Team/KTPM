using FluentAssertions;
using RMS.Infrastructure.Security;

namespace RMS.UnitTests.Infrastructure.Security;

public sealed class PasswordHasherTests
{
    private readonly PasswordHasher _sut = new();

    [Fact]
    public void HashAndVerify_ValidPassword_Works()
    {
        const string password = "Correct horse battery staple";

        var hash = _sut.Hash(password);

        hash.Should().NotBe(password);
        _sut.Verify(password, hash).Should().BeTrue();
        _sut.Verify("wrong password", hash).Should().BeFalse();
    }

    [Fact]
    public void Hash_SamePasswordTwice_UsesDifferentSalts()
    {
        const string password = "Correct horse battery staple";

        _sut.Hash(password).Should().NotBe(_sut.Hash(password));
    }

    [Theory]
    [InlineData("")]
    [InlineData("   ")]
    public void Hash_EmptyPassword_Throws(string password)
    {
        var action = () => _sut.Hash(password);

        action.Should().Throw<ArgumentException>();
    }

    [Fact]
    public void Verify_InvalidHash_ReturnsFalse()
    {
        _sut.Verify("password", "not-a-bcrypt-hash").Should().BeFalse();
    }
}
