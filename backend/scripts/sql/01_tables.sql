IF OBJECT_ID('dbo.Orders','U') IS NULL
BEGIN
CREATE TABLE dbo.Orders(
    Id INT IDENTITY PRIMARY KEY,
    CustomerName NVARCHAR(200) NOT NULL,
    ContractNo NVARCHAR(50) NULL,
    TaskNo NVARCHAR(50) NULL,
    ReviewType VARCHAR(10) NULL,
    Frequency VARCHAR(10) NULL,
    ProductCode VARCHAR(50) NULL,
    ProductName NVARCHAR(200) NULL
);
END;
IF OBJECT_ID('dbo.ProductParams','U') IS NULL
BEGIN
CREATE TABLE dbo.ProductParams(
    ParamId INT IDENTITY PRIMARY KEY,
    ProductCode VARCHAR(50) NOT NULL,
    ParamGroup NVARCHAR(100) NOT NULL,
    ParamCode VARCHAR(20) NOT NULL,
    ParamLabel NVARCHAR(255) NOT NULL,
    ParamType VARCHAR(20) NOT NULL DEFAULT 'select',
    IsActive BIT NOT NULL DEFAULT 1
);
CREATE INDEX IX_ProductParams_ProductCode ON dbo.ProductParams(ProductCode);
END;
IF OBJECT_ID('dbo.Inspections','U') IS NULL
BEGIN
CREATE TABLE dbo.Inspections(
    InspectionId INT IDENTITY PRIMARY KEY,
    OrderId INT NOT NULL,
    ProductCode VARCHAR(50) NOT NULL,
    ChecklistType VARCHAR(10) NOT NULL,
    CustomerName NVARCHAR(200) NOT NULL,
    Remarks NVARCHAR(MAX) NULL,
    ClientSignature VARBINARY(MAX) NULL,
    PdfPath NVARCHAR(400) NULL,
    Status TINYINT NOT NULL DEFAULT 0,
    CreatedAt DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
    UpdatedAt DATETIME2 NULL
);
END;
IF OBJECT_ID('dbo.InspectionParamValues','U') IS NULL
BEGIN
CREATE TABLE dbo.InspectionParamValues(
    InspectionId INT NOT NULL,
    ParamCode VARCHAR(20) NOT NULL,
    Value NVARCHAR(20) NOT NULL,
    Note NVARCHAR(400) NULL,
    UpdatedAt DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
    CONSTRAINT PK_InspectionParamValues PRIMARY KEY(InspectionId, ParamCode),
    CONSTRAINT FK_InspectionParamValues_Inspection FOREIGN KEY(InspectionId) REFERENCES dbo.Inspections(InspectionId)
);
END;
