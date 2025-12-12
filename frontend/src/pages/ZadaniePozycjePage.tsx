import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getZadanie, getZadaniePozycje, setDoPrzegladu, patchZadanieMultiple, podpiszZadanie, podpiszWszystkieProtokoly, downloadZadaniePdf } from "../api/zadania";
import { Zadanie, ZadaniePozycja } from "../types";
import { Button, Form, Row, Col, Card } from 'react-bootstrap';
import Spinner from "../components/Spinner";
import DoPrzegladuButton from "../components/DoPrzegladuButton";
import SignatureDialog from "../components/SignatureDialog";
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';
import TopBar from "../components/TopBar";
import BackButton from "../components/BackButton";

const USER = "koordynator";

export default function ZadaniePozycjePage() {
  const { znagId } = useParams();
  const [loading, setLoading] = useState(true);
  const [zadanie, setZadanie] = useState<Zadanie | null>(null);
  const [rows, setRows] = useState<ZadaniePozycja[]>([]);
  const { user } = useAuth();
  const navigate = useNavigate();

  // Pola formularza
  const [obserwacje, setObserwacje] = useState("");
  const [opisPrac, setOpisPrac] = useState("");
  const [dataWykonania, setDataWykonania] = useState("");
  const [klientNazwisko, setKlientNazwisko] = useState("");
  const [klientDzial, setKlientDzial] = useState("");
  const [klientDataZatw, setKlientDataZatw] = useState("");

  // Pola godzin
  const [godzSwieta, setGodzSwieta] = useState("");
  const [godzSobNoc, setGodzSobNoc] = useState("");
  const [godzDojazdu, setGodzDojazdu] = useState("");
  const [godzNaprawa, setGodzNaprawa] = useState("");
  const [godzWyjazd, setGodzWyjazd] = useState("");
  const [godzDieta, setGodzDieta] = useState("");
  const [godzKm, setGodzKm] = useState("");

  // Modal podpisu
  const [showSignatureDialog, setShowSignatureDialog] = useState(false);

  const showDoPrzegladu = user.role === "Kierownik";
  const isSerwisant = user.role === "Serwisant";

  useEffect(() => {
    if (!znagId) return;

    // Pobierz dane zadania
    getZadanie(Number(znagId))
      .then((data) => {
        setZadanie(data);
        setObserwacje(data.vZNAG_Uwagi || "");
        setOpisPrac(data.vZNAG_UwagiGodziny || "");
        setKlientNazwisko(data.vZNAG_KlientNazwisko || "");
        setKlientDzial(data.vZNAG_KlientDzial || "");

        // Godziny
        setGodzSwieta(data.vZNAG_GodzSwieta || "");
        setGodzSobNoc(data.vZNAG_GodzSobNoc || "");
        setGodzDojazdu(data.vZNAG_GodzDojazdu || "");
        setGodzNaprawa(data.vZNAG_GodzNaprawa || "");
        setGodzWyjazd(data.vZNAG_GodzWyjazd || "");
        setGodzDieta(data.vZNAG_GodzDieta || "");
        setGodzKm(data.vZNAG_GodzKm || "");

        if (data.vZNAG_DataWykonania) {
          const date = new Date(data.vZNAG_DataWykonania);
          setDataWykonania(formatDateTimeLocal(date));
        }

        if (data.vZNAG_KlientDataZatw) {
          const date = new Date(data.vZNAG_KlientDataZatw);
          setKlientDataZatw(formatDateTimeLocal(date));
        }
      })
      .catch(err => console.error("Błąd pobierania zadania:", err));

    // Pobierz urządzenia
    getZadaniePozycje(Number(znagId))
      .then(pozycje => {
        // Dla serwisantów filtruj tylko urządzenia do przeglądu
        if (isSerwisant) {
          setRows(pozycje.filter(p => p.ZPOZ_UrzadzenieDoPrzegladu === true));
        } else {
          setRows(pozycje);
        }
      })
      .finally(() => setLoading(false));
  }, [znagId, isSerwisant]);

  const formatDateTimeLocal = (date: Date): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  };

  const handleSave = async () => {
    if (!znagId) return;

    try {
      const updateData: any = {
        ZNAG_Uwagi: obserwacje,
        ZNAG_UwagiGodziny: opisPrac,
        ZNAG_GodzSwieta: godzSwieta,
        ZNAG_GodzSobNoc: godzSobNoc,
        ZNAG_GodzDojazdu: godzDojazdu,
        ZNAG_GodzNaprawa: godzNaprawa,
        ZNAG_GodzWyjazd: godzWyjazd,
        ZNAG_GodzDieta: godzDieta,
        ZNAG_GodzKm: godzKm,
      };

      if (dataWykonania) {
        updateData.ZNAG_DataWykonania = new Date(dataWykonania).toISOString();
      }

      if (klientNazwisko) updateData.ZNAG_KlientNazwisko = klientNazwisko;
      if (klientDzial) updateData.ZNAG_KlientDzial = klientDzial;
      if (klientDataZatw) {
        updateData.ZNAG_KlientDataZatw = new Date(klientDataZatw).toISOString();
      }

      await toast.promise(
        patchZadanieMultiple(Number(znagId), updateData),
        {
          loading: 'Zapisuję zmiany...',
          success: 'Zmiany zapisane pomyślnie!',
          error: (err) => `Błąd: ${err.message || 'Nie udało się zapisać'}`,
        }
      );
    } catch (error) {
      console.error("Błąd zapisu:", error);
    }
  };

  const handlePrint = async () => {
    if (!znagId) return;

    try {
      await toast.promise(
        downloadZadaniePdf(Number(znagId)),
        {
          loading: 'Generuję PDF...',
          success: 'PDF został pobrany!',
          error: (err) => `Błąd: ${err.message || 'Nie udało się wygenerować PDF'}`,
        }
      );
    } catch (error) {
      console.error("Błąd generowania PDF:", error);
    }
  };

  async function handleSign(dataUrl: string, applyToAll: boolean = false) {
    if (!znagId) return;

    try {
      await podpiszZadanie(Number(znagId), dataUrl);

      // Jeśli checkbox "zastosuj do wszystkich protokołów" był zaznaczony
      if (applyToAll) {
        const result = await podpiszWszystkieProtokoly(Number(znagId), dataUrl, "Klient");
        if (result.signed_count > 0) {
          toast.success(`Podpisano ${result.signed_count} protokołów`);
        }
      }

      // Odśwież zadanie
      const updatedZadanie = await getZadanie(Number(znagId));
      setZadanie(updatedZadanie);
      setShowSignatureDialog(false);
    } catch (error) {
      console.error("Błąd podpisu:", error);
    }
  }

  async function toggle(zpoz: ZadaniePozycja, value: boolean) {
    try {
      await toast.promise(
        setDoPrzegladu(zpoz.ZPOZ_Id, value, USER),
        {
          loading: 'Wykonuje operacje...',
          success: 'Oznaczono pomyślnie!',
          error: (err) => `Błąd: ${err.message || 'Operacja niepowiodła się'}`,
        }
      );

      setRows((prev) => prev.map(r =>
        r.ZPOZ_Id === zpoz.ZPOZ_Id
          ? { ...r, ZPOZ_UrzadzenieDoPrzegladu: value }
          : r
      ));
    } catch (error) {
      console.error("Operacja nie powiodła się:", error);
    }
  }

  if (loading) return <Spinner />;

  return (
    <>
      <TopBar title={"Zadanie #" + znagId}/>
      <div className="container" style={{ marginTop: '70px' }}>
        <BackButton/>

        {/* Formularz edycji zadania */}
        <Card className="mt-3 mb-4">
          <Card.Header>
            <h5 className="mb-0">Edycja zgłoszenia</h5>
            {zadanie && (
              <small className="text-muted">
                {zadanie.vZNAG_KlientNazwa} - {zadanie.vZNAG_KlientMiasto}
              </small>
            )}
          </Card.Header>
          <Card.Body>
            <Form>
              {/* Obserwacje serwisantów / wnioski */}
              <Form.Group className="mb-3">
                <Form.Label><strong>Obserwacje serwisantów / wnioski</strong></Form.Label>
                <Form.Control
                  as="textarea"
                  rows={3}
                  value={obserwacje}
                  onChange={(e) => setObserwacje(e.target.value)}
                  placeholder="Wprowadź obserwacje..."
                />
              </Form.Group>

              {/* Opis prac / Zgłoszenie */}
              <Form.Group className="mb-3">
                <Form.Label><strong>Opis prac / Zgłoszenie</strong></Form.Label>
                <Form.Control
                  as="textarea"
                  rows={3}
                  value={opisPrac}
                  onChange={(e) => setOpisPrac(e.target.value)}
                  placeholder="Wprowadź opis prac..."
                />
              </Form.Group>

              {/* Data realizacji przeglądu */}
              <h6 className="mt-4 mb-3">Data realizacji przeglądu</h6>
              <Form.Group className="mb-3">
                <Form.Label>Data wykonania</Form.Label>
                <Form.Control
                  type="datetime-local"
                  value={dataWykonania}
                  onChange={(e) => setDataWykonania(e.target.value)}
                />
              </Form.Group>

              {/* Dane klienta */}
              <h6 className="mt-4 mb-3">Dane klienta</h6>
              <Row>
                <Col md={4}>
                  <Form.Group className="mb-3">
                    <Form.Label>Nazwisko</Form.Label>
                    <Form.Control
                      type="text"
                      value={klientNazwisko}
                      onChange={(e) => setKlientNazwisko(e.target.value)}
                      placeholder="Nazwisko klienta"
                    />
                  </Form.Group>
                </Col>
                <Col md={4}>
                  <Form.Group className="mb-3">
                    <Form.Label>Dział</Form.Label>
                    <Form.Control
                      type="text"
                      value={klientDzial}
                      onChange={(e) => setKlientDzial(e.target.value)}
                      placeholder="Dział klienta"
                    />
                  </Form.Group>
                </Col>
                <Col md={4}>
                  <Form.Group className="mb-3">
                    <Form.Label>Data zatwierdzenia</Form.Label>
                    <Form.Control
                      type="datetime-local"
                      value={klientDataZatw}
                      onChange={(e) => setKlientDataZatw(e.target.value)}
                    />
                  </Form.Group>
                </Col>
              </Row>

              {/* Przyciski akcji */}
              <div className="d-flex gap-2">
                <Button variant="primary" onClick={handleSave}>
                  Zapisz zmiany
                </Button>
                <Button variant="secondary" onClick={handlePrint}>
                  Drukuj zadanie
                </Button>
              </div>
            </Form>
          </Card.Body>
        </Card>

        {/* Sekcja Godziny */}
        <Card className="mt-3 mb-4">
          <Card.Header>
            <h5 className="mb-0">Godziny</h5>
          </Card.Header>
          <Card.Body>
            <Row>
              <Col md={4}>
                <Form.Group className="mb-3">
                  <Form.Label>Święta</Form.Label>
                  <Form.Control
                    type="text"
                    value={godzSwieta}
                    onChange={(e) => setGodzSwieta(e.target.value)}
                    placeholder="np. 2h"
                  />
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group className="mb-3">
                  <Form.Label>Sob/Noc</Form.Label>
                  <Form.Control
                    type="text"
                    value={godzSobNoc}
                    onChange={(e) => setGodzSobNoc(e.target.value)}
                    placeholder="np. 3h"
                  />
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group className="mb-3">
                  <Form.Label>Dojazd</Form.Label>
                  <Form.Control
                    type="text"
                    value={godzDojazdu}
                    onChange={(e) => setGodzDojazdu(e.target.value)}
                    placeholder="np. 1h"
                  />
                </Form.Group>
              </Col>
            </Row>
            <Row>
              <Col md={4}>
                <Form.Group className="mb-3">
                  <Form.Label>Naprawa</Form.Label>
                  <Form.Control
                    type="text"
                    value={godzNaprawa}
                    onChange={(e) => setGodzNaprawa(e.target.value)}
                    placeholder="np. 4h"
                  />
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group className="mb-3">
                  <Form.Label>Wyjazd</Form.Label>
                  <Form.Control
                    type="text"
                    value={godzWyjazd}
                    onChange={(e) => setGodzWyjazd(e.target.value)}
                    placeholder="np. 2h"
                  />
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group className="mb-3">
                  <Form.Label>Dieta</Form.Label>
                  <Form.Control
                    type="text"
                    value={godzDieta}
                    onChange={(e) => setGodzDieta(e.target.value)}
                    placeholder="np. 50 zl"
                  />
                </Form.Group>
              </Col>
            </Row>
            <Row>
              <Col md={4}>
                <Form.Group className="mb-3">
                  <Form.Label>Km</Form.Label>
                  <Form.Control
                    type="text"
                    value={godzKm}
                    onChange={(e) => setGodzKm(e.target.value)}
                    placeholder="np. 100km"
                  />
                </Form.Group>
              </Col>
            </Row>

            {/* Przycisk zapisu */}
            <Button variant="primary" onClick={handleSave}>
              Zapisz
            </Button>
          </Card.Body>
        </Card>

        {/* Sekcja Podpis klienta */}
        <Card className="mt-3 mb-4">
          <Card.Header>
            <h5 className="mb-0">Podpis klienta</h5>
          </Card.Header>
          <Card.Body>
            <div className="d-flex align-items-center justify-content-between">
              <div>
                <strong>Status podpisu:</strong> {zadanie?.vZNAG_KlientPodpis ? "Złożony" : "Brak podpisu"}
              </div>
              <Button
                variant="primary"
                onClick={() => setShowSignatureDialog(true)}
              >
                {zadanie?.vZNAG_KlientPodpis ? "Pokaż / Zmień podpis" : "Złóż podpis"}
              </Button>
            </div>
          </Card.Body>
        </Card>

        {/* Tabela urządzeń */}
        <h5 className="mb-3">Lista urządzeń</h5>
        <table style={{ width: "100%", borderCollapse: "collapse" }} className="table table-secondary table-striped table-shadow">
          <thead>
            <tr style={{ borderBottom: "1px solid #ccc" }}>
              <th style={{ padding: 8, textAlign: "left" }}>Numer</th>
              <th style={{ padding: 8, textAlign: "left" }}>Opis</th>
              {showDoPrzegladu && (
                <th style={{ padding: 8, textAlign: "left" }}>Do przeglądu</th>
              )}
              <th style={{ padding: 8, textAlign: "left" }}>Akcje</th>
            </tr>
          </thead>
          <tbody>
            {rows.map(r => (
              <tr key={r.ZPOZ_Id} style={{ borderBottom: "1px solid #eee" }}>
                <td style={{ padding: 8 }}>
                  <b>{r.ZPOZ_UrzadzenieNumer}</b>
                </td>

                <td style={{ padding: 8 }}>
                  {r.ZPOZ_UrzadzenieOpis}
                </td>

                {showDoPrzegladu && (
                  <td style={{ padding: 8 }}>
                    <DoPrzegladuButton
                      isDoPrzegladu={r.ZPOZ_UrzadzenieDoPrzegladu === true}
                      onChange={(v) => toggle(r, v)}
                    />
                  </td>
                )}

                <td style={{ padding: 8 }}>
                  {r.ZPOZ_UrzadzenieDoPrzegladu === true && (
                    <Button
                      variant="primary"
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/protokol/${r.ZPOZ_Id}`);
                      }}
                    >
                      Otwórz protokół
                    </Button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {rows.length === 0 && (
          <div className="alert alert-info">
            {isSerwisant
              ? "Brak urządzeń do przeglądu."
              : "Brak urządzeń w zadaniu."}
          </div>
        )}

        {/* Dialog podpisu */}
        <SignatureDialog
          open={showSignatureDialog}
          onClose={() => setShowSignatureDialog(false)}
          onSave={handleSign}
          oldSignature={zadanie?.vZNAG_KlientPodpis || null}
        />
      </div>
    </>
  );
}
