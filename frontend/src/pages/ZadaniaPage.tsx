import React, { useEffect, useState } from "react";
import { getZadania, generateZadaniePdf, patchZadanie, patchZadanieMultiple, podpiszZadanie, podpiszWszystkieProtokoly } from "../api/zadania";
import { Zadanie } from "../types";
import Spinner from "../components/Spinner";
import ZadaniaTable from "../components/ZadaniaTable"; 
import { TextEditModal } from "../components/modals/TextEditModal";
import { HoursEditModal } from "../components/modals/HoursEditModal";
import { FailureDetailsModal } from "../components/modals/FailureDetailsModal";
import SignatureDialog from "../components/SignatureDialog";
import TopBar from "../components/TopBar";
import { Form } from 'react-bootstrap';

type ModalType = 'edit-uwagi' | 'edit-godziny' | 'podpis' | 'edit-details' | null;

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

  const handleSaveHours = async (hoursData: any) => {
    if (!selectedZadanie) throw new Error("Nie wybrano zadania");
    const zadanieId = selectedZadanie.vZNAG_Id;
    await patchZadanieMultiple(zadanieId, hoursData);
    setRows(prevRows =>
      prevRows.map(row =>
        row.vZNAG_Id === zadanieId ? { ...row, ...Object.fromEntries(
          Object.entries(hoursData).map(([k, v]) => ["v" + k, v])
        ) } : row
      )
    );
  };

  const handleSaveDetails = async (detailsData: any) => {
    if (!selectedZadanie) throw new Error("Nie wybrano zadania");
    const zadanieId = selectedZadanie.vZNAG_Id;
    await patchZadanieMultiple(zadanieId, detailsData);
    setRows(prevRows =>
      prevRows.map(row =>
        row.vZNAG_Id === zadanieId ? { ...row, ...Object.fromEntries(
          Object.entries(detailsData).map(([k, v]) => ["v" + k, v])
        ) } : row
      )
    );
  };

  async function handleSign(dataUrl: string, applyToAll: boolean = false) {
      if (!selectedZadanie) throw new Error("Nie wybrano zadania");
      const zadanieId = selectedZadanie.vZNAG_Id;
      await podpiszZadanie(zadanieId, dataUrl);

      // Jeśli checkbox "zastosuj do wszystkich protokołów" był zaznaczony
      if (applyToAll) {
        await podpiszWszystkieProtokoly(zadanieId, dataUrl, "Klient");
      }

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
      const klientNazwa = (z.vZNAG_KlientNazwa || '').toLowerCase();
      const searchLower = searchPhrase.toLowerCase();

      return idAsString.startsWith(searchPhrase) || klientNazwa.includes(searchLower);
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
    <>
    <TopBar title="Zadania"/>
    <div className="container" style={{ marginTop: '70px' }}>
      
      <div className="search-bar p-2 d-flex w-100">
        <Form.Control
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
          placeholder="Wyszukaj ID lub nazwę kontrahenta..."
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
        onShowDetailsModal={(zadanie) => handleShow('edit-details', zadanie)}
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

          <HoursEditModal
            show={activeModal === 'edit-godziny'}
            onHide={handleClose}
            elementId={selectedZadanie.vZNAG_Id}
            initialData={{
              ZNAG_GodzSwieta: selectedZadanie.vZNAG_GodzSwieta || "",
              ZNAG_GodzSobNoc: selectedZadanie.vZNAG_GodzSobNoc || "",
              ZNAG_GodzDojazdu: selectedZadanie.vZNAG_GodzDojazdu || "",
              ZNAG_GodzNaprawa: selectedZadanie.vZNAG_GodzNaprawa || "",
              ZNAG_GodzWyjazd: selectedZadanie.vZNAG_GodzWyjazd || "",
              ZNAG_GodzDieta: selectedZadanie.vZNAG_GodzDieta || "",
              ZNAG_GodzKm: selectedZadanie.vZNAG_GodzKm || "",
              ZNAG_UwagiGodziny: selectedZadanie.vZNAG_UwagiGodziny || "",
            }}
            onSave={handleSaveHours}
          />

          <SignatureDialog
          open={activeModal === 'podpis'}
          onClose={handleClose}
          onSave={handleSign}
          oldSignature={selectedZadanie ? selectedZadanie.vZNAG_KlientPodpis : null}
           />

          <FailureDetailsModal
            show={activeModal === 'edit-details'}
            onHide={handleClose}
            elementId={selectedZadanie.vZNAG_Id}
            initialData={{
              ZNAG_Urzadzenie: selectedZadanie.vZNAG_Urzadzenie || "",
              ZNAG_Tonaz: selectedZadanie.vZNAG_Tonaz || "",
              ZNAG_AwariaNumer: selectedZadanie.vZNAG_AwariaNumer || "",
              ZNAG_OkrGwar: selectedZadanie.vZNAG_OkrGwar || false,
            }}
            onSave={handleSaveDetails}
          />
        </>
      )}

    </div>
    </>
  );
}