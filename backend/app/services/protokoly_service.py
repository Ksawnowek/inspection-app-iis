import os
from typing import Dict, List
from fpdf import FPDF

STORAGE_DIR = os.getenv("STORAGE_DIR", "./storage")
PDF_SUBDIR   = os.getenv("PDF_SUBDIR", "pdfs")

def ensure_dir(path: str):
    os.makedirs(path, exist_ok=True)

def pdf_output_path(pnagl_id: int) -> str:
    base = os.path.join(STORAGE_DIR, PDF_SUBDIR)
    ensure_dir(base)
    return os.path.join(base, f"protokol_{pnagl_id}.pdf")

def generuj_pdf(naglowek: Dict, pozycje: List[Dict], sciezka: str):
    pdf = FPDF()
    pdf.add_page()
    pdf.set_font("Arial", "B", 14)
    pdf.cell(0, 10, f"{naglowek.get('PNAGL_Tytul','Protokół')}", ln=True)
    pdf.set_font("Arial", size=11)
    pdf.cell(0, 8, f"Klient: {naglowek.get('PNAGL_Klient','')}", ln=True)
    pdf.cell(0, 8, f"Miejscowość: {naglowek.get('PNAGL_Miejscowosc','')}", ln=True)
    pdf.cell(0, 8, f"Urządzenie nr: {naglowek.get('PNAGL_NrUrzadzenia','')}", ln=True)
    pdf.ln(6)
    pdf.set_font("Arial", "B", 12)
    pdf.cell(0, 8, "Pozycje:", ln=True)
    pdf.set_font("Arial", size=10)

    for p in pozycje:
        pdf.multi_cell(0, 6, f"{p['PPOZ_Lp']}. {p['PPOZ_Operacja']}")
        oceny = f"NP:{p.get('PPOZ_OcenaNP','')} O:{p.get('PPOZ_OcenaO','')} NR:{p.get('PPOZ_OcenaNR','')} NA:{p.get('PPOZ_OcenaNA','')}"
        pdf.cell(0, 6, oceny, ln=True)
        if p.get("PPOZ_Uwagi"):
            pdf.multi_cell(0, 6, f"Uwagi: {p['PPOZ_Uwagi']}")
        pdf.ln(1)

    ensure_dir(os.path.dirname(sciezka))
    pdf.output(sciezka)
    return sciezka
