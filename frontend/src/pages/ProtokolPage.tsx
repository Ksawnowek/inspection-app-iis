import React, { useEffect, useMemo, useState, useCallback } from "react";
import { useParams, Link } from "react-router-dom";
import { getProtokolPoz, saveProtokol, podpiszProtokol, getProtokolNaglowek, patchProtokolPoz, generateProtokolPdf } from "../api/protokoly";
import { ProtokolNaglowek, ProtokolPozycja, ProtokolResponse, ZdjecieProtokolPoz } from "../types";
import ProtokolGroup from "../components/ProtokolGroup";
import PhotoButton from "../components/PhotoButton";
import SignatureDialog from "../components/SignatureDialog";
import { dodajZdjecie } from "../api/zdjecia";
import Spinner from "../components/Spinner";
import toast from 'react-hot-toast';
import TopBar from "../components/TopBar";

const USER = "serwisant";

export default function ProtokolPage() {
  const { pnaglId } = useParams();
  const [data, setData] = useState<Record<string, ProtokolPozycja[]>>(null);
  const [naglowekData, setNaglowekData] = useState<ProtokolNaglowek>(null);
  const [dirty, setDirty] = useState<Record<number, Partial<ProtokolPozycja>>>({});
  const [signOpen, setSignOpen] = useState(false);
  const [generatingPdf, setGeneratingPdf] = useState(false);

  useEffect(() => {
    if (!pnaglId) return;
    getProtokolNaglowek(Number(pnaglId)).then(setNaglowekData);
    getProtokolPoz(Number(pnaglId)).then(setData);
  }, [pnaglId]);


  const patchPoz = useCallback(async (ppozId: number, partial: Partial<ProtokolPozycja>) => {
    let originalItem: ProtokolPozycja | null = null;
    //Zapisanie zmian w UI -> żebyu podmieniło wartości np pola tekstowego
    setData(prev => {
      if (!prev) return prev;
      const newData = { ...prev };
      for (const groupName in newData) {
        const items = newData[groupName];
        const itemIndex = items.findIndex(item => item.PPOZ_Id === ppozId);
        if (itemIndex > -1) {
          const newItems = [...items];
          newItems[itemIndex] = { ...newItems[itemIndex], ...partial };
          newData[groupName] = newItems;
          break;
        }
      }
      return newData;
    });

    try {
      await toast.promise( 
        patchProtokolPoz(Number(ppozId), partial),
        {
          loading: 'Zapisywanie danych', 
          success: 'Dane zapisano pomyślnie!',
          error: (err) => `Błąd: ${err.message || 'Nie udało zapisać się zmian do bazy danych!'}`, 
        }
    );
    } catch (error) {
      console.error("Błąd zapisu automatycznego:", error);
      //przywrócenie do starego stanu, w razie błędu
      if (originalItem) {
        setData(prev => {
          if (!prev) return prev;
          const newData = { ...prev };
          
          for (const groupName in newData) {
            const items = newData[groupName];
            const itemIndex = items.findIndex(item => item.PPOZ_Id === ppozId);
            
            if (itemIndex > -1) {
              const newItems = [...items];
              newItems[itemIndex] = originalItem; 
              newData[groupName] = newItems;
              break;
            }
          }
          return newData;
        });
      }
    }
  }, [pnaglId]);  

  /**
   * Ta funkcja służy do aktualizacji *tylko* listy zdjęć dla danej pozycji.
   * Jest wywoływana, gdy dodanie lub usunięcie zdjęcia na serwerze się powiedzie.
   */
  const syncZdjeciaPozycji = useCallback((ppozId: number, nowaListaZdjec: ZdjecieProtokolPoz[]) => {
    setData(prev => {
      if (!prev) return prev;
      const newData = { ...prev };
      for (const groupName in newData) {
        const items = newData[groupName];
        const itemIndex = items.findIndex(item => item.PPOZ_Id === ppozId);
        if (itemIndex > -1) {
          const newItems = [...items];
          // Tworzymy kopię itemu, ale z podmienioną listą zdjęć
          newItems[itemIndex] = { 
            ...newItems[itemIndex], 
            ZdjeciaProtokolPoz: nowaListaZdjec 
          };
          newData[groupName] = newItems;
          break;
        }
      }
      return newData;
    });
  }, []);



  async function handleSign(dataUrl: string) {
    if (!pnaglId) return;
    await podpiszProtokol(Number(pnaglId), dataUrl, USER);
    setSignOpen(false);
    alert("Podpis zapisany.");
  }

  const handlePdf = async () => {
    if (!pnaglId) return;
    try {
      setGeneratingPdf(true);
      const blob = await generateProtokolPdf(Number(pnaglId));
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `protokol_${pnaglId}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (e: any) {
      alert(`Nie udało się wygenerować PDF:\n${e?.message ?? e}`);
    } finally {
      setGeneratingPdf(false);
    }
  };

  if (!data) return <Spinner />;


  return (
    <>
    <TopBar title={"Protokół " + naglowekData.PNAGL_Klient + " " + naglowekData.PNAGL_NrUrzadzenia}/>
    <div className="container" style={{ marginTop: '70px' }}>
      <Link to="/">← Wróć</Link>
      <h2>{naglowekData.PNAGL_Tytul}</h2>
      <div style={{ marginBottom:12 }}>
        <div><b>Klient:</b> {naglowekData.PNAGL_Klient}</div>
        <div><b>Miejscowość:</b> {naglowekData.PNAGL_Miejscowosc}</div>
        <div><b>Nr urządzenia:</b> {naglowekData.PNAGL_NrUrzadzenia}</div>
      </div>

      {data && Object.entries(data).map(([grp, items]) => (
        <ProtokolGroup
          key={grp}
          group={grp}
          items={items}
          onChange={patchPoz}
          onSyncZdjecia={syncZdjeciaPozycji}
        />
      ))}

      <div style={{ display:"flex", gap:8 }}>
        {/* <button onClick={handleSave} disabled={Object.keys(dirty).length === 0}>Zapisz zmiany</button> */}
        <button onClick={() => setSignOpen(true)}>Podpis klienta</button>
        <button onClick={handlePdf} disabled={generatingPdf}>
          {generatingPdf ? "Generuję…" : "Wydrukuj PDF"}
        </button>
      </div>

      <SignatureDialog open={signOpen} onClose={() => setSignOpen(false)} onSave={handleSign} />
    </div>
    </>
  );
}
