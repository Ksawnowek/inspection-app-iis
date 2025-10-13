CREATE OR ALTER VIEW dbo.vw_OrderDetails AS
SELECT o.Id, o.CustomerName, o.ContractNo, o.TaskNo, o.ReviewType, o.Frequency, o.ProductCode, o.ProductName FROM dbo.Orders o;
CREATE OR ALTER VIEW dbo.vw_ProductParams AS
SELECT ProductCode, ParamGroup, ParamCode, ParamLabel, ParamType FROM dbo.ProductParams WHERE IsActive=1;
