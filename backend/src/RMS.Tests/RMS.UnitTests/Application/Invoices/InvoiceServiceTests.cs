using FluentAssertions;
using Moq;
using RMS.Application.Common.Exceptions;
using RMS.Application.Common.Interfaces.Persistence;
using RMS.Application.Common.Models;
using RMS.Application.Invoices;
using RMS.Application.Invoices.Models;
using RMS.Domain.Constants;
using RMS.Domain.Entities;
using RMS.Domain.Enums;
using RMS.Domain.Exceptions;
using RMS.Domain.ValueObjects;
using RMS.UnitTests.Application.TestDoubles;

namespace RMS.UnitTests.Application.Invoices;

public class InvoiceServiceTests
{
    private readonly Mock<IInvoiceRepository> _invoices = new();
    private readonly Mock<IRentalContractRepository> _contracts = new();
    private readonly Mock<ITenantRepository> _tenants = new();
    private readonly Mock<IUnitOfWork> _unitOfWork = new();
    private readonly FakeCurrentUserService _currentUser = new();
    private readonly FakeDateTimeProvider _clock = new();
    private readonly InvoiceService _service;

    public InvoiceServiceTests()
    {
        _unitOfWork
            .Setup(unit => unit.SaveChangesAsync(It.IsAny<CancellationToken>()))
            .ReturnsAsync(1);
        _service = new InvoiceService(
            _invoices.Object,
            _contracts.Object,
            _tenants.Object,
            _currentUser,
            _clock,
            _unitOfWork.Object);
    }

    [Fact]
    public async Task CreateInvoice_ActiveContract_CreatesDraftInvoice()
    {
        // Arrange
        var contract = CreateActiveContract();
        SetupContract(contract);
        Invoice? addedInvoice = null;
        _invoices.Setup(repository => repository.Add(It.IsAny<Invoice>()))
            .Callback<Invoice>(invoice => addedInvoice = invoice);

        // Act
        var response = await _service.CreateInvoiceAsync(
            CreateRequest(contract.Id));

        // Assert
        addedInvoice.Should().NotBeNull();
        addedInvoice!.Status.Should().Be(InvoiceStatus.Draft);
        response.Status.Should().Be(InvoiceStatus.Draft);
        response.ContractId.Should().Be(contract.Id);
        _unitOfWork.Verify(
            unit => unit.SaveChangesAsync(It.IsAny<CancellationToken>()),
            Times.Once);
    }

    [Fact]
    public async Task CreateInvoice_NonActiveContract_IsRejected()
    {
        // Arrange
        var contract = DomainTestFactory.CreateContract(
            Guid.NewGuid(),
            Guid.NewGuid());
        SetupContract(contract);

        // Act
        Func<Task> act = () => _service.CreateInvoiceAsync(
            CreateRequest(contract.Id));

        // Assert
        var exception = await act.Should().ThrowAsync<ConflictException>();
        exception.Which.Code.Should()
            .Be(ApplicationErrorCodes.ContractNotActive);
        VerifyInvoiceNotPersisted();
    }

    [Fact]
    public async Task CreateInvoice_DuplicatePeriod_ThrowsBR10()
    {
        // Arrange
        var contract = CreateActiveContract();
        SetupContract(contract);
        _invoices
            .Setup(repository => repository.ExistsForContractAndPeriodAsync(
                contract.Id,
                It.Is<BillingPeriod>(period =>
                    period.Month == 7 && period.Year == 2026),
                It.IsAny<CancellationToken>()))
            .ReturnsAsync(true);

        // Act
        Func<Task> act = () => _service.CreateInvoiceAsync(
            CreateRequest(contract.Id));

        // Assert
        var exception = await act.Should().ThrowAsync<ConflictException>();
        exception.Which.Code.Should()
            .Be(BusinessRuleCodes.SingleInvoicePerBillingPeriod);
        VerifyInvoiceNotPersisted();
    }

    [Fact]
    public async Task CreateInvoice_UsesContractRentSnapshot()
    {
        // Arrange
        const decimal contractRent = 4_250_000m;
        var contract = DomainTestFactory.CreateContract(
            Guid.NewGuid(),
            Guid.NewGuid(),
            ContractStatus.Active,
            contractRent);
        SetupContract(contract);

        // Act
        var response = await _service.CreateInvoiceAsync(
            CreateRequest(contract.Id));

        // Assert
        response.RentAmount.Should().Be(contractRent);
        _invoices.Verify(
            repository => repository.Add(
                It.Is<Invoice>(invoice =>
                    invoice.RentAmount == contractRent)),
            Times.Once);
    }

    [Fact]
    public async Task CreateInvoice_InvalidReading_PropagatesBR09()
    {
        // Arrange
        var contract = CreateActiveContract();
        SetupContract(contract);
        var request = CreateRequest(contract.Id) with
        {
            ElectricityEndReading = 99m
        };

        // Act
        Func<Task> act = () => _service.CreateInvoiceAsync(request);

        // Assert
        var exception = await act.Should()
            .ThrowAsync<BusinessRuleViolationException>();
        exception.Which.Code.Should()
            .Be(BusinessRuleCodes.UtilityEndReadingsNotBelowStart);
        VerifyInvoiceNotPersisted();
    }

    [Fact]
    public async Task IssueInvoice_Draft_BecomesIssued()
    {
        // Arrange
        var invoice = DomainTestFactory.CreateInvoice(Guid.NewGuid());
        SetupInvoice(invoice);

        // Act
        var response = await _service.IssueInvoiceAsync(invoice.Id);

        // Assert
        invoice.Status.Should().Be(InvoiceStatus.Issued);
        invoice.IssuedAt.Should().Be(_clock.UtcNow);
        response.Status.Should().Be(InvoiceStatus.Issued);
        _unitOfWork.Verify(
            unit => unit.SaveChangesAsync(It.IsAny<CancellationToken>()),
            Times.Once);
    }

    [Fact]
    public async Task RegisterPayment_Staff_CreatesPayment()
    {
        // Arrange
        _currentUser.Role = UserRole.Staff;
        _currentUser.UserId = DomainTestFactory.StaffUserId;
        var invoice = DomainTestFactory.CreateInvoice(
            Guid.NewGuid(),
            InvoiceStatus.Issued);
        SetupInvoice(invoice);

        // Act
        var response = await _service.RegisterPaymentAsync(
            invoice.Id,
            new RegisterPaymentRequest(500_000m, "Cash"));

        // Assert
        response.Amount.Should().Be(500_000m);
        response.Note.Should().Be("Cash");
        invoice.Payments.Should().ContainSingle();
        _unitOfWork.Verify(
            unit => unit.SaveChangesAsync(It.IsAny<CancellationToken>()),
            Times.Once);
    }

    [Fact]
    public async Task RegisterPayment_UsesCurrentUserAsRecorder()
    {
        // Arrange
        _currentUser.Role = UserRole.Staff;
        _currentUser.UserId = DomainTestFactory.StaffUserId;
        var invoice = DomainTestFactory.CreateInvoice(
            Guid.NewGuid(),
            InvoiceStatus.Issued);
        SetupInvoice(invoice);

        // Act
        var response = await _service.RegisterPaymentAsync(
            invoice.Id,
            new RegisterPaymentRequest(500_000m, null));

        // Assert
        response.RecordedByUserId.Should().Be(_currentUser.UserId);
        invoice.Payments.Single().RecordedByUserId.Should()
            .Be(_currentUser.UserId);
    }

    [Fact]
    public async Task RegisterPayment_Partial_InvoiceBecomesPartiallyPaid()
    {
        // Arrange
        var invoice = DomainTestFactory.CreateInvoice(
            Guid.NewGuid(),
            InvoiceStatus.Issued);
        SetupInvoice(invoice);

        // Act
        await _service.RegisterPaymentAsync(
            invoice.Id,
            new RegisterPaymentRequest(500_000m, null));

        // Assert
        invoice.Status.Should().Be(InvoiceStatus.PartiallyPaid);
        invoice.PaidAmount.Should().Be(500_000m);
        invoice.PaidAt.Should().BeNull();
    }

    [Fact]
    public async Task RegisterPayment_Full_InvoiceBecomesPaid()
    {
        // Arrange
        var invoice = DomainTestFactory.CreateInvoice(
            Guid.NewGuid(),
            InvoiceStatus.Issued);
        SetupInvoice(invoice);
        var fullAmount = invoice.GetOutstandingAmount();

        // Act
        await _service.RegisterPaymentAsync(
            invoice.Id,
            new RegisterPaymentRequest(fullAmount, "Full payment"));

        // Assert
        invoice.Status.Should().Be(InvoiceStatus.Paid);
        invoice.PaidAmount.Should().Be(invoice.TotalAmount);
        invoice.PaidAt.Should().Be(_clock.UtcNow);
    }

    [Fact]
    public async Task RegisterPayment_Overpayment_PropagatesBR13()
    {
        // Arrange
        var invoice = DomainTestFactory.CreateInvoice(
            Guid.NewGuid(),
            InvoiceStatus.Issued);
        SetupInvoice(invoice);
        var amount = invoice.GetOutstandingAmount() + 0.01m;

        // Act
        Func<Task> act = () => _service.RegisterPaymentAsync(
            invoice.Id,
            new RegisterPaymentRequest(amount, null));

        // Assert
        var exception = await act.Should()
            .ThrowAsync<BusinessRuleViolationException>();
        exception.Which.Code.Should()
            .Be(BusinessRuleCodes.PaymentCannotExceedInvoiceTotal);
        invoice.Payments.Should().BeEmpty();
        _unitOfWork.Verify(
            unit => unit.SaveChangesAsync(It.IsAny<CancellationToken>()),
            Times.Never);
    }

    [Fact]
    public async Task GetInvoice_TenantCannotSeeDraft()
    {
        // Arrange
        var tenant = DomainTestFactory.CreateTenant();
        var invoice = DomainTestFactory.CreateInvoice(Guid.NewGuid());
        SetupTenantInvoiceAccess(tenant, invoice, isOwned: true);

        // Act
        Func<Task> act = () => _service.GetInvoiceAsync(invoice.Id);

        // Assert
        var exception = await act.Should()
            .ThrowAsync<ForbiddenAccessException>();
        exception.Which.Code.Should()
            .Be(BusinessRuleCodes.DraftInvoiceHiddenFromTenant);
    }

    [Fact]
    public async Task GetInvoice_TenantOwnIssuedInvoice_IsAllowed()
    {
        // Arrange
        var tenant = DomainTestFactory.CreateTenant();
        var invoice = DomainTestFactory.CreateInvoice(
            Guid.NewGuid(),
            InvoiceStatus.Issued);
        SetupTenantInvoiceAccess(tenant, invoice, isOwned: true);

        // Act
        var response = await _service.GetInvoiceAsync(invoice.Id);

        // Assert
        response.Invoice.Id.Should().Be(invoice.Id);
        response.Invoice.Status.Should().Be(InvoiceStatus.Issued);
    }

    [Fact]
    public async Task GetInvoice_OtherTenant_IsForbidden()
    {
        // Arrange
        var tenant = DomainTestFactory.CreateTenant();
        var invoice = DomainTestFactory.CreateInvoice(
            Guid.NewGuid(),
            InvoiceStatus.Issued);
        SetupTenantInvoiceAccess(tenant, invoice, isOwned: false);

        // Act
        Func<Task> act = () => _service.GetInvoiceAsync(invoice.Id);

        // Assert
        var exception = await act.Should()
            .ThrowAsync<ForbiddenAccessException>();
        exception.Which.Code.Should()
            .Be(BusinessRuleCodes.TenantOwnDataOnly);
    }

    [Fact]
    public async Task GetInvoices_TenantQueryExcludesDraft()
    {
        // Arrange
        var tenant = DomainTestFactory.CreateTenant();
        _currentUser.Role = UserRole.Tenant;
        _currentUser.UserId = tenant.UserId;
        _tenants
            .Setup(repository => repository.GetByUserIdAsync(
                tenant.UserId,
                It.IsAny<CancellationToken>()))
            .ReturnsAsync(tenant);
        _invoices
            .Setup(repository => repository.GetPagedAsync(
                It.IsAny<PagedRequest>(),
                null,
                tenant.Id,
                false,
                It.IsAny<CancellationToken>()))
            .ReturnsAsync(new PagedResult<Invoice>(
                [],
                pageNumber: 1,
                pageSize: 20,
                totalCount: 0));

        // Act
        await _service.GetInvoicesAsync(
            new InvoiceFilterRequest(1, 20, null));

        // Assert
        _invoices.Verify(
            repository => repository.GetPagedAsync(
                It.Is<PagedRequest>(page =>
                    page.PageNumber == 1 && page.PageSize == 20),
                null,
                tenant.Id,
                false,
                It.IsAny<CancellationToken>()),
            Times.Once);
    }

    [Fact]
    public async Task GetPaymentHistory_OtherTenant_IsForbidden()
    {
        // Arrange
        var tenant = DomainTestFactory.CreateTenant();
        var invoice = DomainTestFactory.CreateInvoice(
            Guid.NewGuid(),
            InvoiceStatus.Issued);
        SetupTenantInvoiceAccess(tenant, invoice, isOwned: false);

        // Act
        Func<Task> act = () => _service.GetPaymentHistoryAsync(invoice.Id);

        // Assert
        var exception = await act.Should()
            .ThrowAsync<ForbiddenAccessException>();
        exception.Which.Code.Should()
            .Be(BusinessRuleCodes.TenantOwnDataOnly);
    }

    private void SetupContract(RentalContract contract)
    {
        _contracts
            .Setup(repository => repository.GetByIdAsync(
                contract.Id,
                It.IsAny<CancellationToken>()))
            .ReturnsAsync(contract);
    }

    private void SetupInvoice(Invoice invoice)
    {
        _invoices
            .Setup(repository => repository.GetByIdAsync(
                invoice.Id,
                It.IsAny<CancellationToken>()))
            .ReturnsAsync(invoice);
    }

    private void SetupTenantInvoiceAccess(
        Tenant tenant,
        Invoice invoice,
        bool isOwned)
    {
        _currentUser.Role = UserRole.Tenant;
        _currentUser.UserId = tenant.UserId;
        SetupInvoice(invoice);
        _tenants
            .Setup(repository => repository.GetByUserIdAsync(
                tenant.UserId,
                It.IsAny<CancellationToken>()))
            .ReturnsAsync(tenant);
        _invoices
            .Setup(repository => repository.IsOwnedByTenantAsync(
                invoice.Id,
                tenant.Id,
                It.IsAny<CancellationToken>()))
            .ReturnsAsync(isOwned);
    }

    private void VerifyInvoiceNotPersisted()
    {
        _invoices.Verify(
            repository => repository.Add(It.IsAny<Invoice>()),
            Times.Never);
        _unitOfWork.Verify(
            unit => unit.SaveChangesAsync(It.IsAny<CancellationToken>()),
            Times.Never);
    }

    private static RentalContract CreateActiveContract()
    {
        return DomainTestFactory.CreateContract(
            Guid.NewGuid(),
            Guid.NewGuid(),
            ContractStatus.Active);
    }

    private static CreateInvoiceRequest CreateRequest(Guid contractId)
    {
        return new CreateInvoiceRequest(
            contractId,
            BillingMonth: 7,
            BillingYear: 2026,
            ElectricityStartReading: 100m,
            ElectricityEndReading: 120m,
            WaterStartReading: 50m,
            WaterEndReading: 55m,
            ElectricityUnitPrice: 3_500m,
            WaterUnitPrice: 15_000m);
    }
}
