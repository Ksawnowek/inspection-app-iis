# -*- coding: utf-8 -*-
from pathlib import Path
from datetime import datetime
from jinja2 import Environment, FileSystemLoader, select_autoescape
import subprocess

from app.models.models import ProtokolPoz, ProtokolNagl, ZadanieNagl

TEMPL_DIR = Path(__file__).resolve().parent.parent / "templates"

env = Environment(
    loader=FileSystemLoader(str(TEMPL_DIR)),
    autoescape=select_autoescape(["html", "xml"])
)

def render_zadanie_pdf(out_path: str, naglowek: dict, podpis: str, pozycje: list[dict], serwisanci: list[str] | None = None):
    """Wyrenderuj HTML z Jinja2 i zapisz jako PDF przez wkhtmltopdf."""
    serwisanci = serwisanci or []
    html = env.get_template("zadanie.html").render(
        today=datetime.now().strftime("%d-%m-%Y"),
        naglowek=naglowek,
        podpis_klient=podpis,
        pozycje=pozycje,
        serwisanci=serwisanci
    )

    out = Path(out_path)
    out.parent.mkdir(parents=True, exist_ok=True)

    # zapisz tymczasowy html obok (wkhtmltopdf potrzebuje pliku)
    tmp_html = out.with_suffix(".tmp.html")
    tmp_html.write_text(html, encoding="utf-8")

    # --enable-local-file-access gdybyś linkował lokalne CSS/obrazki
    cmd = ["wkhtmltopdf", "--quiet", "--enable-local-file-access", str(tmp_html), str(out)]
    subprocess.run(cmd, check=True)

    # posprzątaj
    try: tmp_html.unlink()
    except: pass

    return str(out)

def render_protokol_pdf(out_path: str, protokol_nagl: ProtokolNagl, zadanie_nagl: ZadanieNagl, protokol_grupy: list[dict] | None = None):
    """
    protokol_nagl i zadanie_nagl to 1:1 tabele z bazy - odwołujesz się do nazw kolumn
    protokol_grupy - to słownik typu:
    {
    "Grupa 01" : [PPoz, PPoz, PPoz]
    "Grupa 02" : [PPoz, PPoz, PPoz]
    ...
    }
    elementy listy to klasa ProtokolPoz -> 1:1 tabela z bazy

    i nie wiem czy to tylko na konserwacje? jeśli tak to zmienić nazwę na protokol_konserwacja, żeby sie potem nie myliło
    """
    #TODO szablon protokolu
    html = env.get_template("protokol.html").render(
        today=datetime.now().strftime("%d-%m-%Y"),
        naglowek_zadanie=zadanie_nagl,
        naglowek_protokol = protokol_nagl,
        protokol_grupy=protokol_grupy
    )

    out = Path(out_path)
    out.parent.mkdir(parents=True, exist_ok=True)

    # zapisz tymczasowy html obok (wkhtmltopdf potrzebuje pliku)
    tmp_html = out.with_suffix(".tmp.html")
    tmp_html.write_text(html, encoding="utf-8")

    # --enable-local-file-access gdybyś linkował lokalne CSS/obrazki
    cmd = ["wkhtmltopdf", "--quiet", "--enable-local-file-access", str(tmp_html), str(out)]
    subprocess.run(cmd, check=True)

    # posprzątaj
    try:
        tmp_html.unlink()
    except:
        pass

    return str(out)