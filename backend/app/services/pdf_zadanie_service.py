# -*- coding: utf-8 -*-
from pathlib import Path
from datetime import datetime
from jinja2 import Environment, FileSystemLoader, select_autoescape
import subprocess

TEMPL_DIR = Path(__file__).resolve().parent.parent / "templates"

env = Environment(
    loader=FileSystemLoader(str(TEMPL_DIR)),
    autoescape=select_autoescape(["html", "xml"])
)

def render_zadanie_pdf(out_path: str, naglowek: dict, pozycje: list[dict], serwisanci: list[str] | None = None):
    """Wyrenderuj HTML z Jinja2 i zapisz jako PDF przez wkhtmltopdf."""
    serwisanci = serwisanci or []
    html = env.get_template("zadanie.html").render(
        today=datetime.now().strftime("%d-%m-%Y"),
        naglowek=naglowek,
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
