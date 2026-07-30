using FluentAssertions;
using Microsoft.EntityFrameworkCore;
using RMS.Application.Common.Exceptions;
using RMS.Domain.Constants;
using RMS.Domain.Entities;
using RMS.Domain.Enums;
using RMS.Infrastructure.Repositories;
using RMS.IntegrationTests.Fixtures;

namespace RMS.IntegrationTests.Repositories;

[Collection(SqlServerCollection.Name)]
public sealed class InvoicePaymentRepositoryTests :
    SqlServerIntegrationTestBase
{
    public InvoicePaymentRepositoryTests(
        SqlServerContainerFixture fixture)
        : base(fixture)
    {
    }

    [Fact]
    public async Task InvoiceRepository_RoundTripsBillingPeriod()
    {
        await using var context = Fixture.CreateDbContext();
        var graph = await TestData.SeedActiveContractGraphAsync(context);
        var invoice = TestData.Invoice(graph.Contract, month: 11, year: 2026);
        new InvoiceRepository(context).Add(invoice);
        await context.SaveChangesAsync();
        context.ChangeTracker.Clear();

        var result = await new InvoiceRepository(context)
            .GetByIdAsync(invoice.Id);

        result.Should().NotBeNull();
        result!.BillingPeriod.Month.Should().Be(11);
        result.BillingPeriod.Year.Should().Be(2026);
    }

    [Fact]
    public async Task Invoice_FirstPeriodForContract_Succeeds()
    {
        await using var context = Fixture.CreateDbContext();
        var graph = await TestData.SeedActiveContractGraphAsync(context);
        var invoice = TestData.Invoice(graph.Contract);
        context.Invoices.Add(invoice);

        await context.SaveChangesAsync();

        (await context.Invoices.AnyAsync(item => item.Id == invoice.Id))
            .Should()
            .BeTrue();
    }

    [Fact]
    public async Task Invoice_DuplicateContractAndPeriod_ThrowsBR10()
    {
        await using var context = Fixture.CreateDbContext();
        var graph = await TestData.SeedActiveContractGraphAsync(context);
        context.Invoices.Add(TestData.Invoice(graph.Contract));
        await context.SaveChangesAsync();
        context.Invoices.Add(TestData.Invoice(graph.Contract));

        var action = () => context.SaveChangesAsync();

        var exception = await action.Should()
            .ThrowAsync<ConflictException>();
        exception.Which.Code.Should()
            .Be(BusinessRuleCodes.SingleInvoicePerBillingPeriod);
        exception.Which.Message.Should()
            .NotContain("UX_Invoices");
    }

    [Fact]
    public async Task Invoice_SameContractDifferentPeriod_Succeeds()
    {
        await using var context = Fixture.CreateDbContext();
        var graph = await TestData.SeedActiveContractGraphAsync(context);
        context.Invoices.AddRange(
            TestData.Invoice(graph.Contract, month: 6),
            TestData.Invoice(graph.Contract, month: 7));

        await context.SaveChangesAsync();

        (await context.Invoices.CountAsync(
                invoice => invoice.ContractId == graph.Contract.Id))
            .Should()
            .Be(2);
    }

    [Fact]
    public async Task Invoice_SamePeriodDifferentContract_Succeeds()
    {
        await using var context = Fixture.CreateDbContext();
        var first = await TestData.SeedActiveContractGraphAsync(
            context,
            "INVOICE-ROOM-1");
        var second = await TestData.SeedActiveContractGraphAsync(
            context,
            "INVOICE-ROOM-2");
        context.Invoices.AddRange(
            TestData.Invoice(first.Contract),
            TestData.Invoice(second.Contract));

        await context.SaveChangesAsync();

        (await context.Invoices.CountAsync()).Should().Be(2);
    }

    [Fact]
    public async Task InvoiceRepository_GetById_IncludesPayments()
    {
        Guid invoiceId;
        Guid paymentId;
        await using (var seedContext = Fixture.CreateDbContext())
        {
            var graph =
                await TestData.SeedIssuedInvoiceGraphAsync(seedContext);
            var payment = graph.Invoice.RegisterPayment(
                100_000m,
                "First payment",
                graph.Recorder.Id,
                TestData.Now);
            await seedContext.SaveChangesAsync();
            invoiceId = graph.Invoice.Id;
            paymentId = payment.Id;
        }

        await using var context = Fixture.CreateDbContext();
        var result = await new InvoiceRepository(context)
            .GetByIdAsync(invoiceId);

        result.Should().NotBeNull();
        result!.Payments.Should().ContainSingle();
        result.Payments.Single().Id.Should().Be(paymentId);
        context.Entry(result).Collection(invoice => invoice.Payments).IsLoaded
            .Should()
            .BeTrue();
    }

    [Fact]
    public async Task InvoiceRepository_OutstandingFilter_IsCorrect()
    {
        await using var context = Fixture.CreateDbContext();
        var graph = await TestData.SeedActiveContractGraphAsync(context);
        var recorder = TestData.User(UserRole.Admin);
        context.Users.Add(recorder);

        var draft = TestData.Invoice(graph.Contract, month: 1);
        var issued = TestData.Invoice(
            graph.Contract,
            month: 2,
            issued: true);
        var partiallyPaid = TestData.Invoice(
            graph.Contract,
            month: 3,
            issued: true);
        partiallyPaid.RegisterPayment(
            100_000m,
            null,
            recorder.Id,
            TestData.Now);
        var paid = TestData.Invoice(
            graph.Contract,
            month: 4,
            issued: true);
        paid.RegisterPayment(
            paid.TotalAmount,
            null,
            recorder.Id,
            TestData.Now);
        var overdue = TestData.Invoice(
            graph.Contract,
            month: 5,
            issued: true);
        overdue.MarkOverdue(TestData.Now);
        var cancelled = TestData.Invoice(graph.Contract, month: 6);
        cancelled.Cancel(TestData.Now);
        context.Invoices.AddRange(
            draft,
            issued,
            partiallyPaid,
            paid,
            overdue,
            cancelled);
        await context.SaveChangesAsync();
        context.ChangeTracker.Clear();
        var repository = new InvoiceRepository(context);

        var all = await repository.GetAllOutstandingAsync();
        var tenant = await repository.GetOutstandingByTenantIdAsync(
            graph.Tenant.Id);

        all.Select(invoice => invoice.Id).Should().BeEquivalentTo(
            [issued.Id, partiallyPaid.Id, overdue.Id]);
        tenant.Select(invoice => invoice.Id).Should().BeEquivalentTo(
            [issued.Id, partiallyPaid.Id, overdue.Id]);
    }

    [Fact]
    public async Task RegisterPayment_PersistsPaymentAndInvoiceState()
    {
        await using var context = Fixture.CreateDbContext();
        var graph = await TestData.SeedIssuedInvoiceGraphAsync(context);
        var payment = graph.Invoice.RegisterPayment(
            100_000m,
            "Partial",
            graph.Recorder.Id,
            TestData.Now);

        await context.SaveChangesAsync();
        context.ChangeTracker.Clear();

        var invoice = await context.Invoices.SingleAsync(
            item => item.Id == graph.Invoice.Id);
        invoice.Status.Should().Be(InvoiceStatus.PartiallyPaid);
        invoice.PaidAmount.Should().Be(100_000m);
        (await context.Payments.AnyAsync(item => item.Id == payment.Id))
            .Should()
            .BeTrue();
    }

    [Fact]
    public async Task Payment_HistoryIsPreserved()
    {
        await using var context = Fixture.CreateDbContext();
        var graph = await TestData.SeedIssuedInvoiceGraphAsync(context);
        graph.Invoice.RegisterPayment(
            100_000m,
            "First",
            graph.Recorder.Id,
            TestData.Now);
        graph.Invoice.RegisterPayment(
            200_000m,
            "Second",
            graph.Recorder.Id,
            TestData.Now.AddMinutes(1));

        await context.SaveChangesAsync();
        context.ChangeTracker.Clear();

        var result = await new InvoiceRepository(context)
            .GetByIdAsync(graph.Invoice.Id);
        result!.Payments.Select(payment => payment.Note)
            .Should()
            .Equal("First", "Second");
        result.PaidAmount.Should().Be(300_000m);
    }

    [Fact]
    public async Task Payment_RecordedByUserForeignKey_IsEnforced()
    {
        await using var context = Fixture.CreateDbContext();
        var contractGraph =
            await TestData.SeedActiveContractGraphAsync(context);
        var invoice = TestData.Invoice(
            contractGraph.Contract,
            issued: true);
        invoice.RegisterPayment(
            100_000m,
            null,
            Guid.NewGuid(),
            TestData.Now);
        context.Invoices.Add(invoice);

        var action = () => context.SaveChangesAsync();

        await action.Should().ThrowAsync<DbUpdateException>();
    }
}
