import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { getZadaniePozycje, setDoPrzegladu } from "../api/zadania";
import { ZadaniePozycja } from "../types";
import DoPrzegladuSwitch from "../components/DoPrzegladuSwitch";

const USER = "koordynator"; // albo z logowania

export default function ZadaniePozycjePage() {
  const { znagId } = useParams();
  const [rows, setRows] = useState<ZadaniePozycja[]>([]);
  const [saving, setSaving] = useState<number | null>(null);

  useEffect(() => {
    if (!znagId) return;
    getZadaniePozycje(Number(znagId)).then(setRows);
  }, [znagId]);

  async function toggle(zpoz: ZadaniePozycja, value: boolean) {
    setSaving(zpoz.ZPOZ_Id);
    await setDoPrzegladu(zpoz.ZPOZ_Id, value, USER);
    setRows((prev) => prev.map(r => r.ZPOZ_Id === zpoz.ZPOZ_Id ? { ...r, ZPOZ_UrzadzenieDoPrzegladu: value ? 1 : 0 } : r));
    setSaving(null);
  }

  return (
    <div className="container">
      <h2>Zadanie #{znagId}</h2>
      <Link to="/">← Wróć</Link>
      <div style={{ marginTop:12 }}>
        {rows.map(r => (
          <div key={r.ZPOZ_Id} style={{ border:"1px solid #eee", padding:8, marginBottom:8 }}>
            <div><b>{r.ZPOZ_UrzadzenieNumer}</b> — {r.ZPOZ_UrzadzenieOpis}</div>
            <div style={{ display:"flex", gap:16, alignItems:"center", marginTop:6 }}>
              <DoPrzegladuSwitch
                checked={r.ZPOZ_UrzadzenieDoPrzegladu === 1}
                onChange={(v) => toggle(r, v)}
              />
              {saving === r.ZPOZ_Id && <span>Zapisywanie…</span>}
              {r.ZPOZ_UrzadzenieDoPrzegladu === 1 &&
                <Link to={`/protokol/${r.ZPOZ_Id}`}>Protokół</Link>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
