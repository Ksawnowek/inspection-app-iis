from fastapi import APIRouter, HTTPException
from fastapi.responses import FileResponse
from ...services.inspection_service import InspectionService
from ...domain.entities import InspectionCreate
router=APIRouter(prefix="/api/inspections", tags=["inspections"]); svc=InspectionService()
@router.post("")
def create(payload:InspectionCreate):
    try: return {"inspection_id": svc.start_inspection(payload)}
    except Exception as e: raise HTTPException(400, str(e))
@router.get("/{inspection_id}")
def read(inspection_id:int):
    try:
        insp, vals = svc.get_inspection_with_values(inspection_id)
        return {"inspection": insp, "values": vals}
    except Exception as e: raise HTTPException(404, str(e))
@router.put("/{inspection_id}")
def update(inspection_id:int, payload:InspectionCreate):
    try: svc.save_inspection(inspection_id, payload); return {"ok":True}
    except Exception as e: raise HTTPException(400, str(e))
@router.post("/{inspection_id}/pdf")
def pdf(inspection_id:int):
    try: return {"pdf_path": svc.generate_pdf_and_upload(inspection_id)}
    except Exception as e: raise HTTPException(400, str(e))
@router.get("/{inspection_id}/pdf")
def download(inspection_id:int):
    try:
        insp,_=svc.get_inspection_with_values(inspection_id)
        if not insp.pdf_path: raise HTTPException(404, "PDF not generated")
        return FileResponse(insp.pdf_path, media_type="application/pdf", filename=f"inspection_{inspection_id}.pdf")
    except Exception as e: raise HTTPException(404, str(e))
