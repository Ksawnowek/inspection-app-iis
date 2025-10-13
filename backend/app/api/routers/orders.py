from fastapi import APIRouter, HTTPException
from ...services.inspection_service import InspectionService
router=APIRouter(prefix="/api/orders", tags=["orders"]); svc=InspectionService()
@router.get("/{order_id}")
def get_order(order_id:int):
    try:
        order,_=svc.get_order_with_params(order_id); return order
    except Exception as e: raise HTTPException(404, str(e))
@router.get("/{order_id}/params")
def get_params(order_id:int):
    try:
        order,groups=svc.get_order_with_params(order_id); return groups
    except Exception as e: raise HTTPException(404, str(e))
