from typing import Optional, Dict, List
from pydantic import BaseModel
class Order(BaseModel):
    id:int; customer_name:str
    contract_no:Optional[str]=None; task_no:Optional[str]=None
    review_type:Optional[str]=None; frequency:Optional[str]=None
    product_code:Optional[str]=None; product_name:Optional[str]=None
class ParamItem(BaseModel):
    code:str; label:str; ptype:str
class ParamGroup(BaseModel):
    name:str; items:List[ParamItem]
class InspectionCreate(BaseModel):
    order_id:int; product_code:str; customer_name:str
    checklist_type:str="M5"; filled_values:Dict[str,str]={}
    remarks:Optional[str]=None; signature_base64:Optional[str]=None
class Inspection(BaseModel):
    inspection_id:int; order_id:int; product_code:str; customer_name:str
    checklist_type:str; remarks:Optional[str]=None; pdf_path:Optional[str]=None; status:int=0
class InspectionWithValues(Inspection):
    values:Dict[str,str]={}
