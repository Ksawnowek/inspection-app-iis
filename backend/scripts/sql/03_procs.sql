CREATE OR ALTER PROCEDURE dbo.usp_GetOrder @OrderId INT AS
BEGIN SET NOCOUNT ON; SELECT * FROM dbo.vw_OrderDetails WHERE Id=@OrderId; END
GO
CREATE OR ALTER PROCEDURE dbo.usp_GetParamsByProduct @ProductCode VARCHAR(50) AS
BEGIN SET NOCOUNT ON; SELECT * FROM dbo.vw_ProductParams WHERE ProductCode=@ProductCode ORDER BY ParamGroup, ParamCode; END
GO
CREATE OR ALTER PROCEDURE dbo.usp_UpsertInspection
(
    @InspectionId INT = NULL OUTPUT,
    @OrderId INT, @ProductCode VARCHAR(50), @CustomerName NVARCHAR(200), @ChecklistType VARCHAR(10),
    @Remarks NVARCHAR(MAX)=NULL, @ClientSignature VARBINARY(MAX)=NULL, @PdfPath NVARCHAR(400)=NULL, @Status TINYINT=0
)
AS
BEGIN
 SET NOCOUNT ON;
 IF @InspectionId IS NULL
 BEGIN
  INSERT INTO dbo.Inspections(OrderId, ProductCode, CustomerName, ChecklistType, Remarks, ClientSignature, PdfPath, Status)
  VALUES (@OrderId, @ProductCode, @CustomerName, @ChecklistType, @Remarks, @ClientSignature, @PdfPath, @Status);
  SET @InspectionId=SCOPE_IDENTITY();
 END
 ELSE
 BEGIN
  UPDATE dbo.Inspections SET Remarks=@Remarks, ClientSignature=COALESCE(@ClientSignature, ClientSignature),
    PdfPath=COALESCE(@PdfPath, PdfPath), Status=@Status, UpdatedAt=SYSUTCDATETIME() WHERE InspectionId=@InspectionId;
 END
END
GO
CREATE OR ALTER PROCEDURE dbo.usp_SaveInspectionValues (@InspectionId INT, @ValuesJson NVARCHAR(MAX)) AS
BEGIN
 SET NOCOUNT ON;
 DECLARE @vals TABLE(ParamCode VARCHAR(50), Value NVARCHAR(50));
 INSERT INTO @vals SELECT [key], value FROM OPENJSON(@ValuesJson);
 MERGE dbo.InspectionParamValues AS T
 USING (SELECT @InspectionId AS InspectionId, ParamCode, Value FROM @vals) AS S
 ON T.InspectionId=S.InspectionId AND T.ParamCode=S.ParamCode
 WHEN MATCHED THEN UPDATE SET T.Value=S.Value, T.UpdatedAt=SYSUTCDATETIME()
 WHEN NOT MATCHED THEN INSERT(InspectionId, ParamCode, Value) VALUES(S.InspectionId, S.ParamCode, S.Value)
 WHEN NOT MATCHED BY SOURCE AND T.InspectionId=@InspectionId THEN DELETE;
END
GO
CREATE OR ALTER PROCEDURE dbo.usp_GetInspection @InspectionId INT AS
BEGIN SET NOCOUNT ON; SELECT * FROM dbo.Inspections WHERE InspectionId=@InspectionId; END
GO
CREATE OR ALTER PROCEDURE dbo.usp_GetInspectionValues @InspectionId INT AS
BEGIN SET NOCOUNT ON; SELECT ParamCode, Value, Note FROM dbo.InspectionParamValues WHERE InspectionId=@InspectionId; END
GO
CREATE OR ALTER PROCEDURE dbo.usp_SetInspectionPdfPath (@InspectionId INT, @PdfPath NVARCHAR(400), @Status TINYINT) AS
BEGIN SET NOCOUNT ON; UPDATE dbo.Inspections SET PdfPath=@PdfPath, Status=@Status, UpdatedAt=SYSUTCDATETIME() WHERE InspectionId=@InspectionId; END
GO
