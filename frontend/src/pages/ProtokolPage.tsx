import React, { useEffect, useMemo, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { getProtokol, saveProtokol, podpiszProtokol } from "../api/protokoly";
import { ProtokolPozycja, ProtokolResponse } from "../types";
import ProtokolGroup from "../components/ProtokolGroup";
import PhotoButton from "../components/PhotoButton";
import SignatureDialog from "../components/SignatureDialog";
import { dodajZdjecie } from "../api/zdjecia";
import Spinner from "../components/Spinner";

const USER = "serwisant";

export default function ProtokolPage() {
  const { pnaglId } = useParams();
  const [data, setData] = useState<ProtokolResponse | null>(null);
  const [dirty, setDirty] = useState<Record<number, Partial<ProtokolPozycja>>>({});
  const [signOpen, setSignOpen] = useState(false);

  useEffect(() => {
    if (!pnaglId) return;
    getProtokol(Number(pnaglId)).then(setData);
  }, [pnaglId]);

  function patch(ppozId: number, partial: Partial<ProtokolPozycja>) {
    setData(prev => {
      if (!prev) return prev;
      const values = prev.values.map(v => v.PPOZ_Id === ppozId ? ({ ...v, ...partial }) : v);
      return { ...prev, values };
    });
    setDirty(prev => ({ ...prev, [ppozId]: { ...(prev[ppozId] || {}), ...partial } }));
  }

  const groups = useMemo(() => {
    const map = new Map<string, ProtokolPozycja[]>();
    data?.values.forEach(v => {
      const arr = map.get(v.PPOZ_GrupaOperacji) || [];
      arr.push(v); map.set(v.PPOZ_GrupaOperacji, arr);
    });
    return Array.from(map.entries());
  }, [data]);

  async function handleSave() {
    if (!pnaglId || !data) return;
    const values = Object.entries(dirty).map(([id, p]) => ({ PPOZ_Id: Number(id), ...p }));
    if (values.length === 0) return alert("Brak zmian.");
    await saveProtokol(Number(pnaglId), { user: USER, values });
    setDirty({});
    alert("Zapisano.");
  }

  async function handleSign(dataUrl: string) {
    if (!pnaglId) return;
    await podpiszProtokol(Number(pnaglId), dataUrl, USER);
    setSignOpen(false);
    alert("Podpis zapisany.");
  }

  if (!data) return <Spinner />;

  console.log(data)
  console.log(groups)

  return (
    <div className="container">
      <Link to="/">← Wróć</Link>
      <h2>{data.inspection.PNAGL_Tytul}</h2>
      <div style={{ marginBottom:12 }}>
        <div><b>Klient:</b> {data.inspection.PNAGL_Klient}</div>
        <div><b>Miejscowość:</b> {data.inspection.PNAGL_Miejscowosc}</div>
        <div><b>Nr urządzenia:</b> {data.inspection.PNAGL_NrUrzadzenia}</div>
      </div>

      {groups.map(([grp, items]) => (
        <ProtokolGroup
          key={grp}
          group={grp}
          items={items}
          onChange={patch}
        />
      ))}

      <div style={{ display:"flex", gap:8 }}>
        <button onClick={handleSave} disabled={Object.keys(dirty).length === 0}>Zapisz zmiany</button>
        <button onClick={() => setSignOpen(true)}>Podpis klienta</button>
      </div>

      <SignatureDialog open={signOpen} onClose={() => setSignOpen(false)} onSave={handleSign} />

      <hr />
      <h3>Zdjęcia do pozycji</h3>
      <p>Wybierz pozycję i zrób zdjęcie – dla przykładu bierzemy pierwszą pozycję.</p>
      {data.values[0] && (
        <PhotoButton
          onPick={async (file) => {
            await dodajZdjecie(data.values[0].PPOZ_Id, file);
            alert("Dodano zdjęcie.");
          }}
        />
      )}
    </div>
  );
}
