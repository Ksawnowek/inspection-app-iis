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
import { Form, Button, Pagination } from 'react-bootstrap';
import toast from 'react-hot-toast';

type ModalType = 'edit-uwagi' | 'edit-godziny' | 'podpis' | 'edit-details' | null;

export default function ZadaniaPage() {
  const [rows, setRows] = useState<Zadanie[]>([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<number | null>(null);
  const [searchPhrase, setSearchPhrase] = useState('');
  const [searchQuery, setSearchQuery] = useState(''); // Faktyczne zapytanie wysyłane do API
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [activeModal, setActiveModal] = useState<ModalType>(null);
  const [selectedZadanie, setSelectedZadanie] = useState<Zadanie | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [total, setTotal] = useState(0);
  const pageSize = 25;

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
        const result = await podpiszWszystkieProtokoly(zadanieId, dataUrl, "Klient");
        if (result.signed_count > 0) {
          toast.success(`Podpisano ${result.signed_count} protokołów`);
        }
      }

      handleClose();
      setRows(prevRows =>
      prevRows.map(row =>
        row.vZNAG_Id === zadanieId ? { ...row, vZNAG_KlientPodpis: dataUrl } : row
      )
    );
  }

  useEffect(() => {
    setLoading(true);
    getZadania({
      search: searchQuery || undefined,
      page: currentPage,
      page_size: pageSize
    })
      .then((response) => {
        setRows(response.items);
        setTotalPages(response.total_pages);
        setTotal(response.total);
      })
      .finally(() => setLoading(false));
  }, [searchQuery, currentPage]);

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
    setSearchQuery(searchPhrase);
    setCurrentPage(1); // Resetuj do pierwszej strony przy nowym wyszukiwaniu
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
      
      <div className="search-bar p-2 d-flex gap-2 w-100">
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
        <Button
          variant="primary"
          onClick={handleSearchSubmit}
          disabled={loading}
          style={{ minWidth: '100px' }}
        >
          Szukaj
        </Button>
      </div>

      {/* Informacja o wynikach wyszukiwania */}
      {searchQuery && (
        <div className="alert alert-info mb-3">
          Wyniki wyszukiwania dla: <strong>{searchQuery}</strong> (znaleziono: {total})
          <Button
            variant="link"
            size="sm"
            onClick={() => {
              setSearchPhrase('');
              setSearchQuery('');
              setCurrentPage(1);
            }}
          >
            Wyczyść
          </Button>
        </div>
      )}

      {/* Tabela została zastąpiona nowym komponentem */}
      <ZadaniaTable
        rows={rows}
        searchPhrase=""
        expandedId={expandedId}
        busyId={busyId}
        onRowClick={handleRowClick}
        onPdfClick={handlePdf}

        onShowUwagiModal={(zadanie) => handleShow('edit-uwagi', zadanie)}
        onShowGodzinyModal={(zadanie) => handleShow('edit-godziny', zadanie)}
        onShowPodpisModal={(zadanie) => handleShow('podpis', zadanie)}
        onShowDetailsModal={(zadanie) => handleShow('edit-details', zadanie)}
      />

      {/* Paginacja */}
      {totalPages > 1 && (
        <div className="d-flex justify-content-center align-items-center mt-4 mb-4">
          <Pagination>
            <Pagination.First
              onClick={() => setCurrentPage(1)}
              disabled={currentPage === 1}
            />
            <Pagination.Prev
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
            />

            {/* Pierwsza strona */}
            {currentPage > 3 && (
              <>
                <Pagination.Item onClick={() => setCurrentPage(1)}>1</Pagination.Item>
                {currentPage > 4 && <Pagination.Ellipsis disabled />}
              </>
            )}

            {/* Strony wokół aktualnej */}
            {Array.from({ length: totalPages }, (_, i) => i + 1)
              .filter(page => Math.abs(page - currentPage) <= 2)
              .map(page => (
                <Pagination.Item
                  key={page}
                  active={page === currentPage}
                  onClick={() => setCurrentPage(page)}
                >
                  {page}
                </Pagination.Item>
              ))}

            {/* Ostatnia strona */}
            {currentPage < totalPages - 2 && (
              <>
                {currentPage < totalPages - 3 && <Pagination.Ellipsis disabled />}
                <Pagination.Item onClick={() => setCurrentPage(totalPages)}>
                  {totalPages}
                </Pagination.Item>
              </>
            )}

            <Pagination.Next
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
            />
            <Pagination.Last
              onClick={() => setCurrentPage(totalPages)}
              disabled={currentPage === totalPages}
            />
          </Pagination>

          <div className="ms-3 text-muted">
            Strona {currentPage} z {totalPages} (łącznie: {total} zadań)
          </div>
        </div>
      )}

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