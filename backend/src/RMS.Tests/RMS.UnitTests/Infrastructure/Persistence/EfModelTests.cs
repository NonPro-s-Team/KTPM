using FluentAssertions;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata;
using RMS.Domain.Entities;
using RMS.Infrastructure.Data;

namespace RMS.UnitTests.Infrastructure.Persistence;

public sealed class EfModelTests
{
    private readonly IModel _model;

    public EfModelTests()
    {
        var options = new DbContextOptionsBuilder<AppDbContext>()
            .UseSqlServer(
                "Server=localhost;Database=RMS_ModelTests;"
                + "Integrated Security=True;TrustServerCertificate=True")
            .Options;
        using var context = new AppDbContext(options);
        _model = context.Model;
    }

    [Fact]
    public void Model_ContainsOnlyOfficialEntityTypes()
    {
        var entityTypes = _model.GetEntityTypes()
            .Select(entityType => entityType.ClrType)
            .ToArray();

        entityTypes.Should().BeEquivalentTo(
            [
                typeof(User),
                typeof(Tenant),
                typeof(Room),
                typeof(RentalContract),
                typeof(Invoice),
                typeof(Payment),
                typeof(MaintenanceRequest),
                typeof(MaintenanceRequestUpdate),
                typeof(UserInvitation),
                typeof(PasswordResetToken)
            ]);
        entityTypes.All(
                type => _model.FindEntityType(type)!.FindPrimaryKey() != null)
            .Should()
            .BeTrue();
        entityTypes.Select(type => type.Name)
            .Should()
            .NotContain(
                [
                    "Contract",
                    "UtilityReading",
                    "RepairRequest",
                    "Dashboard"
                ]);
    }

    [Fact]
    public void MoneyAndReadingProperties_HaveExpectedPrecision()
    {
        AssertPrecision<Room>(nameof(Room.MonthlyRent), 18, 2);
        AssertPrecision<RentalContract>(
            nameof(RentalContract.MonthlyRent),
            18,
            2);
        foreach (var name in new[]
        {
            nameof(Invoice.RentAmount),
            nameof(Invoice.ElectricityUnitPrice),
            nameof(Invoice.WaterUnitPrice),
            nameof(Invoice.ElectricityAmount),
            nameof(Invoice.WaterAmount),
            nameof(Invoice.TotalAmount),
            nameof(Invoice.PaidAmount)
        })
        {
            AssertPrecision<Invoice>(name, 18, 2);
        }

        foreach (var name in new[]
        {
            nameof(Invoice.ElectricityStartReading),
            nameof(Invoice.ElectricityEndReading),
            nameof(Invoice.WaterStartReading),
            nameof(Invoice.WaterEndReading)
        })
        {
            AssertPrecision<Invoice>(name, 18, 3);
        }

        AssertPrecision<Payment>(nameof(Payment.Amount), 18, 2);
    }

    [Fact]
    public void MutableAggregates_HaveRequiredRowVersionTokens()
    {
        foreach (var type in new[]
        {
            typeof(User),
            typeof(Tenant),
            typeof(Room),
            typeof(RentalContract),
            typeof(Invoice),
            typeof(MaintenanceRequest)
        })
        {
            var rowVersion = _model.FindEntityType(type)!
                .FindProperty("RowVersion");

            rowVersion.Should().NotBeNull();
            rowVersion!.IsConcurrencyToken.Should().BeTrue();
            rowVersion.IsNullable.Should().BeFalse();
            rowVersion.ValueGenerated.Should().Be(ValueGenerated.OnAddOrUpdate);
        }

        _model.FindEntityType(typeof(Payment))!
            .FindProperty("RowVersion")
            .Should()
            .BeNull();
        _model.FindEntityType(typeof(MaintenanceRequestUpdate))!
            .FindProperty("RowVersion")
            .Should()
            .BeNull();
    }

    [Fact]
    public void UniqueIndexes_AreConfigured()
    {
        FindIndex<User>(nameof(User.Username))
            .ShouldBeUnique("UX_Users_Username");
        FindIndex<Room>(nameof(Room.RoomNumber))
            .ShouldBeUnique("UX_Rooms_RoomNumber");
        FindIndex<Tenant>(nameof(Tenant.UserId))
            .ShouldBeUnique("UX_Tenants_UserId");
        FindIndex<Invoice>(
                nameof(Invoice.ContractId),
                nameof(Invoice.BillingPeriod))
            .ShouldBeUnique("UX_Invoices_Contract_BillingPeriod");

        var roomIndexes = _model.FindEntityType(typeof(RentalContract))!
            .GetIndexes()
            .Where(index => index.Properties
                .Select(property => property.Name)
                .SequenceEqual([nameof(RentalContract.RoomId)]))
            .ToArray();
        var activeContractIndex = roomIndexes.Single(
            index =>
                index.GetDatabaseName()
                == "UX_RentalContracts_Room_Active");
        activeContractIndex.ShouldBeUnique(
            "UX_RentalContracts_Room_Active");
        activeContractIndex.GetFilter().Should().Be("[Status] = 2");
        roomIndexes.Should().ContainSingle(
            index =>
                index.GetDatabaseName() == "IX_RentalContracts_RoomId"
                && !index.IsUnique);
    }

    [Fact]
    public void BillingPeriod_IsMappedToScalarIntegerColumn()
    {
        var entityType = _model.FindEntityType(typeof(Invoice))!;
        var property = entityType.FindProperty(nameof(Invoice.BillingPeriod))!;
        var table = StoreObjectIdentifier.Table("Invoices", null);

        property.GetColumnName(table).Should().Be("BillingPeriodKey");
        property.GetColumnType().Should().Be("int");
        property.GetValueConverter().Should().NotBeNull();
    }

    [Fact]
    public void AllRelationships_UseRestrictDeleteBehavior()
    {
        // PasswordResetToken.UserId is the sole intentional exception: reset
        // tokens are ephemeral and tightly scoped to their user, so they
        // should be removed automatically if the user is ever deleted.
        _model.GetEntityTypes()
            .SelectMany(entity => entity.GetForeignKeys())
            .Where(foreignKey =>
                foreignKey.DeclaringEntityType.ClrType != typeof(PasswordResetToken))
            .Should()
            .OnlyContain(
                foreignKey =>
                    foreignKey.DeleteBehavior == DeleteBehavior.Restrict);

        _model.FindEntityType(typeof(PasswordResetToken))!
            .GetForeignKeys()
            .Should()
            .ContainSingle(
                foreignKey => foreignKey.DeleteBehavior == DeleteBehavior.Cascade);
    }

    private void AssertPrecision<TEntity>(
        string propertyName,
        int precision,
        int scale)
    {
        var property = _model.FindEntityType(typeof(TEntity))!
            .FindProperty(propertyName)!;

        property.GetPrecision().Should().Be(precision);
        property.GetScale().Should().Be(scale);
    }

    private IIndex FindIndex<TEntity>(params string[] propertyNames)
    {
        return _model.FindEntityType(typeof(TEntity))!
            .GetIndexes()
            .Single(index => index.Properties
                .Select(property => property.Name)
                .SequenceEqual(propertyNames));
    }
}

internal static class IndexAssertions
{
    public static void ShouldBeUnique(
        this IIndex index,
        string databaseName)
    {
        index.IsUnique.Should().BeTrue();
        index.GetDatabaseName().Should().Be(databaseName);
    }
}
