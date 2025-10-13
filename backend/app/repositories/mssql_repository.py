\
import json
from typing import List, Dict
from ..infrastructure.db import get_conn
from ..domain.entities import Order, ParamItem, ParamGroup, Inspection

class OrderRepository:
    def get_order(self, order_id:int) -> Order:
        with get_conn() as conn:
            cur=conn.cursor()
            cur.execute("EXEC dbo.usp_GetOrder ?", order_id)
            row=cur.fetchone()
            if not row: raise ValueError("Order not found")
            return Order(id=row.Id, customer_name=row.CustomerName, contract_no=row.ContractNo, task_no=row.TaskNo, review_type=row.ReviewType, frequency=row.Frequency, product_code=row.ProductCode, product_name=row.ProductName)

class ProductParamRepository:
    def get_groups_for_product(self, product_code:str) -> List[ParamGroup]:
        with get_conn() as conn:
            cur=conn.cursor(); cur.execute("EXEC dbo.usp_GetParamsByProduct ?", product_code)
            groups:Dict[str,List[ParamItem]]={}
            for r in cur.fetchall():
                groups.setdefault(r.ParamGroup,[]).append(ParamItem(code=r.ParamCode,label=r.ParamLabel,ptype=(r.ParamType or 'select')))
            return [ParamGroup(name=k, items=v) for k,v in groups.items()]

class InspectionRepository:
    def upsert_inspection(self, insp:Inspection) -> int:
        with get_conn() as conn:
            cur=conn.cursor()
            params=(getattr(insp,'inspection_id',None) or None, insp.order_id, insp.product_code, insp.customer_name, insp.checklist_type, insp.remarks, None, insp.pdf_path, insp.status)
            cur.execute(r"""
DECLARE @id INT = ?;
EXEC dbo.usp_UpsertInspection
     @InspectionId=@id OUTPUT,
     @OrderId=?, @ProductCode=?, @CustomerName=?, @ChecklistType=?,
     @Remarks=?, @ClientSignature=?, @PdfPath=?, @Status=?;
SELECT @id;
""", params)
            new_id=cur.fetchone()[0]; conn.commit(); return int(new_id)
    def save_values(self, inspection_id:int, values:Dict[str,str]) -> None:
        with get_conn() as conn:
            cur=conn.cursor()
            cur.execute("EXEC dbo.usp_SaveInspectionValues @InspectionId=?, @ValuesJson=?", (inspection_id, json.dumps(values, ensure_ascii=False))); conn.commit()
    def set_pdf_path(self, inspection_id:int, pdf_path:str, status:int) -> None:
        with get_conn() as conn:
            cur=conn.cursor(); cur.execute("EXEC dbo.usp_SetInspectionPdfPath @InspectionId=?, @PdfPath=?, @Status=?", (inspection_id, pdf_path, status)); conn.commit()
    def get_inspection(self, inspection_id:int):
        with get_conn() as conn:
            cur=conn.cursor(); cur.execute("EXEC dbo.usp_GetInspection ?", inspection_id); r=cur.fetchone()
            if not r: raise ValueError("Inspection not found")
            return Inspection(inspection_id=r.InspectionId, order_id=r.OrderId, product_code=r.ProductCode, customer_name=r.CustomerName, checklist_type=r.ChecklistType, remarks=r.Remarks, pdf_path=r.PdfPath, status=r.Status)
    def get_values(self, inspection_id:int) -> Dict[str,str]:
        with get_conn() as conn:
            cur=conn.cursor(); cur.execute("EXEC dbo.usp_GetInspectionValues ?", inspection_id)
            res:Dict[str,str]={}
            for r in cur.fetchall(): res[r.ParamCode]=r.Value
            return res
