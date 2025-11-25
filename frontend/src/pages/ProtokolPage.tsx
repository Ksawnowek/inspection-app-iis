import React, { useEffect, useMemo, useState, useCallback } from "react";
import { useParams, Link } from "react-router-dom";
import { getProtokolPoz, saveProtokol, podpiszProtokol, getProtokolNaglowek, patchProtokolPoz, generateProtokolPdf, patchProtokolNagl } from "../api/protokoly";
import { ProtokolNaglowek, ProtokolPozycja, ProtokolResponse, ZdjecieProtokolPoz } from "../types";
import ProtokolGroup from "../components/ProtokolGroup";
import PhotoButton from "../components/PhotoButton";
import SignatureDialog from "../components/SignatureDialog";
import { dodajZdjecie } from "../api/zdjecia";
import Spinner from "../components/Spinner";
import toast from 'react-hot-toast';
import TopBar from "../components/TopBar";
import { Button } from 'react-bootstrap';
import BackButton from "../components/BackButton";

const USER = "serwisant";

type ModalType = 'podpis' | null;

export default function ProtokolPage() {
  const { pnaglId } = useParams();
  const [data, setData] = useState<Record<string, ProtokolPozycja[]>>(null);
  const [naglowekData, setNaglowekData] = useState<ProtokolNaglowek>(null);
  const [dirty, setDirty] = useState<Record<number, Partial<ProtokolPozycja>>>({});
  const [signOpen, setSignOpen] = useState(false);
  const [generatingPdf, setGeneratingPdf] = useState(false);
  const [activeModal, setActiveModal] = useState<ModalType>(null);
  const [uwagiValue, setUwagiValue] = useState<string>('');
  /*
  Funcje otwierające/zamykające modala
  */

  const handleClose = () => {
      setActiveModal(null);
  };

  const handleShow = (modalName: ModalType) => {
    setActiveModal(modalName);
  };



  /*
  Pobranie nagłówka oraz pozycji zmapowanych w słownik: {grupa: [lista pozycji]}
  */
  useEffect(() => {
    if (!pnaglId) return;
    getProtokolNaglowek(Number(pnaglId)).then((nagl) => {
      setNaglowekData(nagl);
      setUwagiValue(nagl.PNAGL_Uwagi || '');
    });
    getProtokolPoz(Number(pnaglId)).then(setData);
  }, [pnaglId]);

  /*
    Funkcja patchująca nagłówek protokołu
  */
  const patchNagl = useCallback(async (partial: Partial<ProtokolNaglowek>) => {
    if (!pnaglId) return;

    // Zapisanie zmian w UI
    setNaglowekData(prev => {
      if (!prev) return prev;
      return { ...prev, ...partial };
    });

    try {
      await toast.promise(
        patchProtokolNagl(Number(pnaglId), partial),
        {
          loading: 'Zapisywanie uwag',
          success: 'Uwagi zapisano pomyślnie!',
          error: (err) => `Błąd: ${err.message || 'Nie udało się zapisać uwag!'}`,
        }
      );
    } catch (error) {
      console.error("Błąd zapisu uwag:", error);
      // Przywrócenie starego stanu w razie błędu
      getProtokolNaglowek(Number(pnaglId)).then((nagl) => {
        setNaglowekData(nagl);
        setUwagiValue(nagl.PNAGL_Uwagi || '');
      });
    }
  }, [pnaglId]);

  /*
    Zapisz uwagi po opuszczeniu pola (analogicznie jak UwagiInput dla pozycji)
  */
  const handleUwagiBlur = useCallback(() => {
    // Sprawdź czy wartość się zmieniła
    if (uwagiValue !== (naglowekData?.PNAGL_Uwagi || '')) {
      patchNagl({ PNAGL_Uwagi: uwagiValue });
    }
  }, [uwagiValue, naglowekData?.PNAGL_Uwagi, patchNagl]);

  /*
    Funkcja patchująca pozycje, wywoływana podczas każdej zmiany na pozycji
  */
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
    // Upewnij się, że nagłówek istnieje, zanim spróbujesz go użyć
    if (!naglowekData) {
        toast.error("Błąd: Nie załadowano danych nagłówka!");
        return;
    }

    const zadanieId = pnaglId;

    try {
        await toast.promise(
            podpiszProtokol(zadanieId, dataUrl, naglowekData.PNAGL_Klient),
            {
                loading: 'Zapisywanie podpisu...',
                success: 'Podpis zapisany!',
                error: 'Błąd zapisu podpisu.'
            }
        );

        setNaglowekData(poprzedniNaglowek => {
            if (!poprzedniNaglowek) return null;
            return {
                ...poprzedniNaglowek,
                PNAGL_PodpisKlienta: dataUrl
            };
        });

        handleClose();

    } catch (error) {
        console.error("Błąd przy zapisie podpisu:", error);
    }
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

  if (!data || !naglowekData) return <Spinner />;


  return (
    <>
    <TopBar title={"Protokół " + naglowekData.PNAGL_Klient + " " + naglowekData.PNAGL_NrUrzadzenia}/>
    <div className="container" style={{ marginTop: '70px' }}>
      <BackButton/>
      <div className="w-100 d-flex justify-content-between">
        <div>
          <h2>{naglowekData.PNAGL_Tytul}</h2>
          <div style={{ marginBottom:12 }}>
            <div><b>Klient:</b> {naglowekData.PNAGL_Klient}</div>
            <div><b>Miejscowość:</b> {naglowekData.PNAGL_Miejscowosc}</div>
            <div><b>Nr urządzenia:</b> {naglowekData.PNAGL_NrUrzadzenia}</div>
          </div>
          <div style={{ marginBottom:12 }}>
            <label htmlFor="pnagl-uwagi" style={{ display: 'block', fontWeight: 'bold', marginBottom: 4 }}>
              Uwagi do protokołu:
            </label>
            <textarea
              id="pnagl-uwagi"
              className="form-control"
              value={uwagiValue}
              onChange={(e) => setUwagiValue(e.target.value)}
              onBlur={handleUwagiBlur}
              rows={3}
              placeholder="Wpisz uwagi do protokołu..."
            />
          </div>
        </div>
        <div style={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          height: "100%", 
        }}>
          <div>

          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <Button
              variant="primary"
              onClick={() => handleShow('podpis')}
            >
              Podpis klienta
            </Button>
            <Button
              variant="primary"
              onClick={handlePdf} disabled={generatingPdf}
              >
              {generatingPdf ? "Generuję…" : "Wydrukuj PDF"}
            </Button>
          </div>
        </div>
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
        <Button
              variant="primary"
              onClick={() => handleShow('podpis')}
            >
              Podpis klienta
            </Button>
            <Button
              variant="primary"
              onClick={handlePdf} disabled={generatingPdf}
              >
              {generatingPdf ? "Generuję…" : "Wydrukuj PDF"}
            </Button>
      </div>

      <SignatureDialog
                open={activeModal === 'podpis'}
                onClose={handleClose}
                onSave={handleSign}
                oldSignature={naglowekData ? naglowekData.PNAGL_PodpisKlienta : null}
                 />
    </div>
    </>
  );
}
