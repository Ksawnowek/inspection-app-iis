\
import os, base64
from reportlab.pdfgen import canvas
from reportlab.lib.pagesizes import A4
from reportlab.lib.units import mm
from ..domain.entities import InspectionCreate, Inspection
from ..repositories.mssql_repository import OrderRepository, ProductParamRepository, InspectionRepository
from ..core.config import settings

class InspectionService:
    def __init__(self):
        self.orders=OrderRepository(); self.params=ProductParamRepository(); self.insp=InspectionRepository()
        os.makedirs(os.path.join(settings.STORAGE_DIR, settings.PDF_SUBDIR), exist_ok=True)
        os.makedirs(os.path.join(settings.STORAGE_DIR, settings.SIG_SUBDIR), exist_ok=True)
    def start_inspection(self, data:InspectionCreate)->int:
        insp=Inspection(inspection_id=0, order_id=int(data.order_id), product_code=data.product_code, customer_name=data.customer_name, checklist_type=data.checklist_type, remarks=data.remarks or None, pdf_path=None, status=0)
        new_id=self.insp.upsert_inspection(insp)
        if data.filled_values: self.insp.save_values(new_id, data.filled_values)
        return new_id
    def save_inspection(self, inspection_id:int, data:InspectionCreate)->None:
        hdr=self.insp.get_inspection(inspection_id); hdr.remarks=data.remarks or hdr.remarks
        self.insp.upsert_inspection(hdr); self.insp.save_values(inspection_id, data.filled_values or {})
        if data.signature_base64:
            img=base64.b64decode(data.signature_base64.split(",")[-1])
            sig_path=os.path.join(settings.STORAGE_DIR, settings.SIG_SUBDIR, f"sig_{inspection_id}.png")
            with open(sig_path,"wb") as f: f.write(img)
    def get_order_with_params(self, order_id:int):
        order=self.orders.get_order(order_id); groups=self.params.get_groups_for_product(order.product_code or "")
        return order, groups
    def get_inspection_with_values(self, inspection_id:int):
        insp=self.insp.get_inspection(inspection_id); values=self.insp.get_values(inspection_id); return insp, values
    def generate_pdf_and_upload(self, inspection_id:int)->str:
        insp, values = self.get_inspection_with_values(inspection_id)
        order, groups = self.orders.get_order(insp.order_id), self.params.get_groups_for_product(insp.product_code)
        pdf_path=os.path.join(settings.STORAGE_DIR, settings.PDF_SUBDIR, f"inspection_{inspection_id}.pdf")
        c=canvas.Canvas(pdf_path, pagesize=A4); w,h=A4
        c.setFont("Helvetica-Bold",14); c.drawCentredString(w/2, h-20*mm, "FORMULARZ M-5 – Protokół przeglądu")
        c.setFont("Helvetica",9)
        c.drawString(20*mm, h-30*mm, f"Klient: {order.customer_name}")
        c.drawString(110*mm, h-30*mm, f"Kontrakt: {order.contract_no or ''}")
        c.drawString(20*mm, h-36*mm, f"Produkt: {order.product_name or ''} ({order.product_code or ''})")
        c.drawString(110*mm, h-36*mm, f"Typ przeglądu: {order.review_type or ''}")
        y=h-46*mm; c.setFont("Helvetica-Bold",10)
        for g in groups:
            c.drawString(20*mm, y, g.name); y-=6*mm; c.setFont("Helvetica",9)
            for item in g.items:
                v=values.get(item.code,""); c.drawString(22*mm, y, f"{item.code} – {item.label[:70]}"); c.drawRightString(w-20*mm, y, str(v)[:24]); y-=5*mm
                if y<40*mm: c.showPage(); y=h-20*mm
            c.setFont("Helvetica-Bold",10); y-=2*mm
        c.setFont("Helvetica-Bold",10); c.drawString(20*mm, y, "Uwagi:"); y-=6*mm
        c.setFont("Helvetica",9); c.drawString(20*mm, y, (insp.remarks or "")[:180]); y-=10*mm
        c.setFont("Helvetica",9); c.drawString(20*mm, 25*mm, "Podpis klienta:")
        sig_path=os.path.join(settings.STORAGE_DIR, settings.SIG_SUBDIR, f"sig_{inspection_id}.png")
        if os.path.exists(sig_path): c.drawImage(sig_path, 45*mm, 15*mm, width=40*mm, height=20*mm, preserveAspectRatio=True, mask='auto')
        c.drawString(110*mm, 25*mm, "Podpis serwisanta: ______________________"); c.showPage(); c.save()
        self.insp.set_pdf_path(inspection_id, pdf_path, status=1); self._upload(pdf_path); return pdf_path
    def _upload(self, filepath:str):
        import os
        if os.getenv("SFTP_HOST"):
            import paramiko
            from ..core.config import settings as s
            t=paramiko.Transport((s.SFTP["host"], s.SFTP["port"])); t.connect(username=s.SFTP["user"], password=s.SFTP["pass"])
            sftp=paramiko.SFTPClient.from_transport(t); d=s.SFTP["basedir"]
            try: sftp.chdir(d)
            except IOError: sftp.mkdir(d); sftp.chdir(d)
            sftp.put(filepath, f"{d}/{os.path.basename(filepath)}"); sftp.close(); t.close()
        elif os.getenv("FTP_HOST"):
            from ftplib import FTP_TLS
            from ..core.config import settings as s
            ftps=FTP_TLS(); ftps.connect(s.FTP["host"], s.FTP["port"]); ftps.login(s.FTP["user"], s.FTP["pass"]); ftps.prot_p()
            d=s.FTP["basedir"]
            try: ftps.cwd(d)
            except Exception:
                for part in d.strip("/").split("/"):
                    try: ftps.mkd(part)
                    except Exception: pass
                    ftps.cwd(part)
            with open(filepath,"rb") as f: ftps.storbinary(f"STOR {os.path.basename(filepath)}", f)
            ftps.quit()
