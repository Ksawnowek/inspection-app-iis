import React, { useEffect, useState } from "react";
import { getZadania, generateZadaniePdf, patchZadanie, podpiszZadanie } from "../api/zadania";
import { Zadanie } from "../types";
// Usunięto Link, ponieważ jest teraz używany tylko w ZadaniaTable
import Spinner from "../components/Spinner";
import ZadaniaTable from "../components/ZadaniaTable"; // Import nowego komponentu
import { TextEditModal } from "../components/modals/TextEditModal";
import SignatureDialog from "../components/SignatureDialog";

type ModalType = 'edit-uwagi' | 'edit-godziny' | 'podpis' | null;

export default function ZadaniaPage() {
  const [rows, setRows] = useState<Zadanie[]>([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<number | null>(null);
  const [searchPhrase, setSearchPhrase] = useState('');
  const [expandedId, setExpandedId] = useState<number | null>(null); 
  const [activeModal, setActiveModal] = useState<ModalType>(null);
  const [selectedZadanie, setSelectedZadanie] = useState<Zadanie | null>(null);

  const handleClose = () => {
    setActiveModal(null);
    setSelectedZadanie(null);
  };
  
  const handleShow = (modalName: ModalType, zadanie: Zadanie) => {
    setSelectedZadanie(zadanie);
    setActiveModal(modalName); 
  };

  const handleSaveUwagi = async (valueName: string, newValue: string) => {
    if (!selectedZadanie) throw new Error("Nie wybrano zadania");
    const zadanieId = selectedZadanie.vZNAG_Id;
    await patchZadanie(zadanieId, valueName, newValue);
    setRows(prevRows =>
      prevRows.map(row =>
        row.vZNAG_Id === zadanieId ? { ...row, ["v" + valueName]: newValue } : row
      )
    );
  };

  async function handleSign(dataUrl: string) {
      if (!selectedZadanie) throw new Error("Nie wybrano zadania");
      const zadanieId = selectedZadanie.vZNAG_Id;
      await podpiszZadanie(zadanieId, dataUrl);
      handleClose();
      setRows(prevRows =>
      prevRows.map(row =>
        row.vZNAG_Id === zadanieId ? { ...row, vZNAG_KlientPodpis: dataUrl } : row
      )
    );
  }

  useEffect(() => {
    getZadania().then(setRows).finally(() => setLoading(false));
  }, []);

  // Ta funkcja zostaje tutaj, ponieważ zarządza stanem (busyId) i logiką API
  const handlePdf = async (id: number) => {
    try {
      setBusyId(id);
      // podaj tu serwisantów jeśli chcesz, na razie przykładowo:
      const blob = await generateZadaniePdf(id, ["Koordynator", "Serwisant"]);
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `zadanie_${id}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (e: any) {
      alert(`Nie udało się wygenerować PDF:\n${e?.message ?? e}`);
    } finally {
      setBusyId(null);
    }
  };

  // Ta funkcja zostaje tutaj, zarządza filtrowaniem i nawigacją
  const handleSearchSubmit = () => {
    let visibleRows = rows.filter(z => {
      const idAsString = String(z.vZNAG_Id);
      return idAsString.startsWith(searchPhrase);
    });
    if (visibleRows.length === 1) { // Poprawione porównanie
      let href = '/zadania/' + visibleRows[0].vZNAG_Id;
      window.location.href = href;
    }
  };

  // Ta funkcja zostaje tutaj, zarządza stanem (expandedId)
  const handleRowClick = (id: number) => { // Jawnie określony typ 'id'
    setExpandedId(expandedId === id ? null : id);
  };

  if (loading) return <Spinner />;

  return (
    <div className="container">
      <h2>Zadania</h2>
      <div className="search-bar p-2 d-flex w-100">
        <input
          className="w-100"
          type="text"
          name="searchPhrase"
          value={searchPhrase}
          onChange={(e) => setSearchPhrase(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              handleSearchSubmit();
            }
          }}
          placeholder="Wyszukaj ID..."
        />
      </div>

      {/* Tabela została zastąpiona nowym komponentem */}
      <ZadaniaTable
        rows={rows}
        searchPhrase={searchPhrase}
        expandedId={expandedId}
        busyId={busyId}
        onRowClick={handleRowClick}
        onPdfClick={handlePdf}

        onShowUwagiModal={(zadanie) => handleShow('edit-uwagi', zadanie)}
        onShowGodzinyModal={(zadanie) => handleShow('edit-godziny', zadanie)}
        onShowPodpisModal={(zadanie) => handleShow('podpis', zadanie)}
      />

      {selectedZadanie && (
        <>
          <TextEditModal
            show={activeModal === 'edit-uwagi'}
            onHide={handleClose}
            title="Edytuj uwagi"
            name="ZNAG_Uwagi"
            oldValue={selectedZadanie.vZNAG_Uwagi || ""}
            elementId={selectedZadanie.vZNAG_Id}
            onSave={handleSaveUwagi}
          />
          
          <TextEditModal
            show={activeModal === 'edit-godziny'}
            onHide={handleClose}
            title="Edytuj godziny"
            name="ZNAG_UwagiGodziny"
            oldValue={selectedZadanie.vZNAG_UwagiGodziny || ""}
            elementId={selectedZadanie.vZNAG_Id}
            onSave={handleSaveUwagi}
          />

          <SignatureDialog 
          open={activeModal === 'podpis'} 
          onClose={handleClose} 
          onSave={handleSign}
          oldSignature={selectedZadanie ? selectedZadanie.vZNAG_KlientPodpis : null}
           />
        </>
      )}

    </div>
  );
}