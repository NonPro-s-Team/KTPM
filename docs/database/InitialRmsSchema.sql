IF OBJECT_ID(N'[__EFMigrationsHistory]') IS NULL
BEGIN
    CREATE TABLE [__EFMigrationsHistory] (
        [MigrationId] nvarchar(150) NOT NULL,
        [ProductVersion] nvarchar(32) NOT NULL,
        CONSTRAINT [PK___EFMigrationsHistory] PRIMARY KEY ([MigrationId])
    );
END;
GO

BEGIN TRANSACTION;
IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260730085239_InitialRmsSchema'
)
BEGIN
    CREATE TABLE [Rooms] (
        [Id] uniqueidentifier NOT NULL,
        [RoomNumber] nvarchar(50) NOT NULL,
        [MonthlyRent] decimal(18,2) NOT NULL,
        [Description] nvarchar(1000) NULL,
        [Status] int NOT NULL,
        [RowVersion] rowversion NOT NULL,
        [CreatedAt] datetimeoffset NOT NULL,
        [UpdatedAt] datetimeoffset NULL,
        CONSTRAINT [PK_Rooms] PRIMARY KEY ([Id]),
        CONSTRAINT [CK_Rooms_MonthlyRent] CHECK ([MonthlyRent] >= 0)
    );
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260730085239_InitialRmsSchema'
)
BEGIN
    CREATE TABLE [Users] (
        [Id] uniqueidentifier NOT NULL,
        [Username] nvarchar(100) NOT NULL,
        [PasswordHash] nvarchar(512) NOT NULL,
        [Role] int NOT NULL,
        [Status] int NOT NULL,
        [FailedLoginAttempts] int NOT NULL,
        [LockedAt] datetimeoffset NULL,
        [RowVersion] rowversion NOT NULL,
        [CreatedAt] datetimeoffset NOT NULL,
        [UpdatedAt] datetimeoffset NULL,
        CONSTRAINT [PK_Users] PRIMARY KEY ([Id]),
        CONSTRAINT [CK_Users_FailedLoginAttempts] CHECK ([FailedLoginAttempts] >= 0)
    );
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260730085239_InitialRmsSchema'
)
BEGIN
    CREATE TABLE [Tenants] (
        [Id] uniqueidentifier NOT NULL,
        [UserId] uniqueidentifier NOT NULL,
        [FullName] nvarchar(200) NOT NULL,
        [PhoneNumber] nvarchar(20) NOT NULL,
        [CitizenId] nvarchar(50) NOT NULL,
        [RowVersion] rowversion NOT NULL,
        [CreatedAt] datetimeoffset NOT NULL,
        [UpdatedAt] datetimeoffset NULL,
        CONSTRAINT [PK_Tenants] PRIMARY KEY ([Id]),
        CONSTRAINT [FK_Tenants_Users_UserId] FOREIGN KEY ([UserId]) REFERENCES [Users] ([Id]) ON DELETE NO ACTION
    );
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260730085239_InitialRmsSchema'
)
BEGIN
    CREATE TABLE [MaintenanceRequests] (
        [Id] uniqueidentifier NOT NULL,
        [TenantId] uniqueidentifier NOT NULL,
        [RoomId] uniqueidentifier NOT NULL,
        [Title] nvarchar(200) NOT NULL,
        [Description] nvarchar(2000) NOT NULL,
        [Status] int NOT NULL,
        [StartedAt] datetimeoffset NULL,
        [ResolvedAt] datetimeoffset NULL,
        [ClosedAt] datetimeoffset NULL,
        [RowVersion] rowversion NOT NULL,
        [CreatedAt] datetimeoffset NOT NULL,
        [UpdatedAt] datetimeoffset NULL,
        CONSTRAINT [PK_MaintenanceRequests] PRIMARY KEY ([Id]),
        CONSTRAINT [FK_MaintenanceRequests_Rooms_RoomId] FOREIGN KEY ([RoomId]) REFERENCES [Rooms] ([Id]) ON DELETE NO ACTION,
        CONSTRAINT [FK_MaintenanceRequests_Tenants_TenantId] FOREIGN KEY ([TenantId]) REFERENCES [Tenants] ([Id]) ON DELETE NO ACTION
    );
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260730085239_InitialRmsSchema'
)
BEGIN
    CREATE TABLE [RentalContracts] (
        [Id] uniqueidentifier NOT NULL,
        [RoomId] uniqueidentifier NOT NULL,
        [TenantId] uniqueidentifier NOT NULL,
        [StartDate] date NOT NULL,
        [EndDate] date NOT NULL,
        [MonthlyRent] decimal(18,2) NOT NULL,
        [Status] int NOT NULL,
        [ActivatedAt] datetimeoffset NULL,
        [TerminatedAt] datetimeoffset NULL,
        [CancelledAt] datetimeoffset NULL,
        [RowVersion] rowversion NOT NULL,
        [CreatedAt] datetimeoffset NOT NULL,
        [UpdatedAt] datetimeoffset NULL,
        CONSTRAINT [PK_RentalContracts] PRIMARY KEY ([Id]),
        CONSTRAINT [CK_RentalContracts_DateRange] CHECK ([EndDate] > [StartDate]),
        CONSTRAINT [CK_RentalContracts_MonthlyRent] CHECK ([MonthlyRent] >= 0),
        CONSTRAINT [FK_RentalContracts_Rooms_RoomId] FOREIGN KEY ([RoomId]) REFERENCES [Rooms] ([Id]) ON DELETE NO ACTION,
        CONSTRAINT [FK_RentalContracts_Tenants_TenantId] FOREIGN KEY ([TenantId]) REFERENCES [Tenants] ([Id]) ON DELETE NO ACTION
    );
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260730085239_InitialRmsSchema'
)
BEGIN
    CREATE TABLE [MaintenanceRequestUpdates] (
        [Id] uniqueidentifier NOT NULL,
        [MaintenanceRequestId] uniqueidentifier NOT NULL,
        [PreviousStatus] int NOT NULL,
        [NewStatus] int NOT NULL,
        [Note] nvarchar(2000) NULL,
        [UpdatedByUserId] uniqueidentifier NOT NULL,
        [OccurredAt] datetimeoffset NOT NULL,
        [CreatedAt] datetimeoffset NOT NULL,
        CONSTRAINT [PK_MaintenanceRequestUpdates] PRIMARY KEY ([Id]),
        CONSTRAINT [FK_MaintenanceRequestUpdates_MaintenanceRequests_MaintenanceRequestId] FOREIGN KEY ([MaintenanceRequestId]) REFERENCES [MaintenanceRequests] ([Id]) ON DELETE NO ACTION,
        CONSTRAINT [FK_MaintenanceRequestUpdates_Users_UpdatedByUserId] FOREIGN KEY ([UpdatedByUserId]) REFERENCES [Users] ([Id]) ON DELETE NO ACTION
    );
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260730085239_InitialRmsSchema'
)
BEGIN
    CREATE TABLE [Invoices] (
        [Id] uniqueidentifier NOT NULL,
        [ContractId] uniqueidentifier NOT NULL,
        [BillingPeriodKey] int NOT NULL,
        [RentAmount] decimal(18,2) NOT NULL,
        [ElectricityStartReading] decimal(18,3) NOT NULL,
        [ElectricityEndReading] decimal(18,3) NOT NULL,
        [WaterStartReading] decimal(18,3) NOT NULL,
        [WaterEndReading] decimal(18,3) NOT NULL,
        [ElectricityUnitPrice] decimal(18,2) NOT NULL,
        [WaterUnitPrice] decimal(18,2) NOT NULL,
        [ElectricityAmount] decimal(18,2) NOT NULL,
        [WaterAmount] decimal(18,2) NOT NULL,
        [TotalAmount] decimal(18,2) NOT NULL,
        [PaidAmount] decimal(18,2) NOT NULL,
        [Status] int NOT NULL,
        [IssuedAt] datetimeoffset NULL,
        [PaidAt] datetimeoffset NULL,
        [CancelledAt] datetimeoffset NULL,
        [RowVersion] rowversion NOT NULL,
        [CreatedAt] datetimeoffset NOT NULL,
        [UpdatedAt] datetimeoffset NULL,
        CONSTRAINT [PK_Invoices] PRIMARY KEY ([Id]),
        CONSTRAINT [CK_Invoices_Amounts] CHECK ([RentAmount] >= 0 AND [ElectricityAmount] >= 0 AND [WaterAmount] >= 0 AND [TotalAmount] >= 0 AND [PaidAmount] >= 0 AND [PaidAmount] <= [TotalAmount]),
        CONSTRAINT [CK_Invoices_BillingPeriod] CHECK ([BillingPeriodKey] BETWEEN 200001 AND 210012 AND [BillingPeriodKey] % 100 BETWEEN 1 AND 12),
        CONSTRAINT [CK_Invoices_ElectricityReadings] CHECK ([ElectricityEndReading] >= [ElectricityStartReading]),
        CONSTRAINT [CK_Invoices_WaterReadings] CHECK ([WaterEndReading] >= [WaterStartReading]),
        CONSTRAINT [FK_Invoices_RentalContracts_ContractId] FOREIGN KEY ([ContractId]) REFERENCES [RentalContracts] ([Id]) ON DELETE NO ACTION
    );
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260730085239_InitialRmsSchema'
)
BEGIN
    CREATE TABLE [Payments] (
        [Id] uniqueidentifier NOT NULL,
        [InvoiceId] uniqueidentifier NOT NULL,
        [Amount] decimal(18,2) NOT NULL,
        [PaidAt] datetimeoffset NOT NULL,
        [Note] nvarchar(max) NULL,
        [RecordedByUserId] uniqueidentifier NOT NULL,
        [CreatedAt] datetimeoffset NOT NULL,
        CONSTRAINT [PK_Payments] PRIMARY KEY ([Id]),
        CONSTRAINT [CK_Payments_Amount] CHECK ([Amount] > 0),
        CONSTRAINT [FK_Payments_Invoices_InvoiceId] FOREIGN KEY ([InvoiceId]) REFERENCES [Invoices] ([Id]) ON DELETE NO ACTION,
        CONSTRAINT [FK_Payments_Users_RecordedByUserId] FOREIGN KEY ([RecordedByUserId]) REFERENCES [Users] ([Id]) ON DELETE NO ACTION
    );
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260730085239_InitialRmsSchema'
)
BEGIN
    CREATE UNIQUE INDEX [UX_Invoices_Contract_BillingPeriod] ON [Invoices] ([ContractId], [BillingPeriodKey]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260730085239_InitialRmsSchema'
)
BEGIN
    CREATE INDEX [IX_MaintenanceRequests_RoomId_Status] ON [MaintenanceRequests] ([RoomId], [Status]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260730085239_InitialRmsSchema'
)
BEGIN
    CREATE INDEX [IX_MaintenanceRequests_Status_CreatedAt] ON [MaintenanceRequests] ([Status], [CreatedAt]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260730085239_InitialRmsSchema'
)
BEGIN
    CREATE INDEX [IX_MaintenanceRequests_TenantId_Status] ON [MaintenanceRequests] ([TenantId], [Status]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260730085239_InitialRmsSchema'
)
BEGIN
    CREATE INDEX [IX_MaintenanceRequestUpdates_Request_OccurredAt] ON [MaintenanceRequestUpdates] ([MaintenanceRequestId], [OccurredAt]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260730085239_InitialRmsSchema'
)
BEGIN
    CREATE INDEX [IX_MaintenanceRequestUpdates_UpdatedByUserId] ON [MaintenanceRequestUpdates] ([UpdatedByUserId]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260730085239_InitialRmsSchema'
)
BEGIN
    CREATE INDEX [IX_Payments_InvoiceId_PaidAt] ON [Payments] ([InvoiceId], [PaidAt]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260730085239_InitialRmsSchema'
)
BEGIN
    CREATE INDEX [IX_Payments_RecordedByUserId] ON [Payments] ([RecordedByUserId]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260730085239_InitialRmsSchema'
)
BEGIN
    CREATE INDEX [IX_RentalContracts_RoomId] ON [RentalContracts] ([RoomId]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260730085239_InitialRmsSchema'
)
BEGIN
    CREATE INDEX [IX_RentalContracts_TenantId_Status] ON [RentalContracts] ([TenantId], [Status]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260730085239_InitialRmsSchema'
)
BEGIN
    EXEC(N'CREATE UNIQUE INDEX [UX_RentalContracts_Room_Active] ON [RentalContracts] ([RoomId]) WHERE [Status] = 2');
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260730085239_InitialRmsSchema'
)
BEGIN
    CREATE UNIQUE INDEX [UX_Rooms_RoomNumber] ON [Rooms] ([RoomNumber]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260730085239_InitialRmsSchema'
)
BEGIN
    CREATE UNIQUE INDEX [UX_Tenants_UserId] ON [Tenants] ([UserId]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260730085239_InitialRmsSchema'
)
BEGIN
    CREATE UNIQUE INDEX [UX_Users_Username] ON [Users] ([Username]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260730085239_InitialRmsSchema'
)
BEGIN
    INSERT INTO [__EFMigrationsHistory] ([MigrationId], [ProductVersion])
    VALUES (N'20260730085239_InitialRmsSchema', N'10.0.10');
END;

COMMIT;
GO

