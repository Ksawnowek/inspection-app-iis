import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getZadanie, patchZadanieMultiple, podpiszZadanie } from "../api/zadania";
import { Zadanie } from "../types";
import Spinner from "../components/Spinner";
import SignatureDialog from "../components/SignatureDialog";
import TopBar from "../components/TopBar";
import BackButton from "../components/BackButton";
import { Form, Button, Row, Col, Card } from 'react-bootstrap';
import toast from 'react-hot-toast';

export default function AwariaPage() {
  const { znagId } = useParams();
  const [loading, setLoading] = useState(true);
  const [zadanie, setZadanie] = useState<Zadanie | null>(null);
  const [saving, setSaving] = useState(false);

  // Pola formularza
  const [uwagi, setUwagi] = useState("");
  const [godzSwieta, setGodzSwieta] = useState("");
  const [godzSobNoc, setGodzSobNoc] = useState("");
  const [godzDojazdu, setGodzDojazdu] = useState("");
  const [godzNaprawa, setGodzNaprawa] = useState("");
  const [godzWyjazd, setGodzWyjazd] = useState("");
  const [godzDieta, setGodzDieta] = useState("");
  const [godzKm, setGodzKm] = useState("");
  const [dataWykonania, setDataWykonania] = useState("");
  const [klientNazwisko, setKlientNazwisko] = useState("");
  const [klientDzial, setKlientDzial] = useState("");
  const [klientDataZatw, setKlientDataZatw] = useState("");

  // Modal podpisu
  const [showSignatureDialog, setShowSignatureDialog] = useState(false);
  const isPodpisany = zadanie?.vZNAG_KlientPodpis ? true : false;

  useEffect(() => {
    if (!znagId) return;
    getZadanie(Number(znagId))
      .then((data) => {
        setZadanie(data);
        // Wypełnij formularz danymi
        setUwagi(data.vZNAG_Uwagi || "");
        setGodzSwieta(data.vZNAG_GodzSwieta || "");
        setGodzSobNoc(data.vZNAG_GodzSobNoc || "");
        setGodzDojazdu(data.vZNAG_GodzDojazdu || "");
        setGodzNaprawa(data.vZNAG_GodzNaprawa || "");
        setGodzWyjazd(data.vZNAG_GodzWyjazd || "");
        setGodzDieta(data.vZNAG_GodzDieta || "");
        setGodzKm(data.vZNAG_GodzKm || "");
        setKlientNazwisko(data.vZNAG_KlientNazwisko || "");
        setKlientDzial(data.vZNAG_KlientDzial || "");

        // Formatuj datę dla input type="datetime-local"
        if (data.vZNAG_DataWykonania) {
          const date = new Date(data.vZNAG_DataWykonania);
          setDataWykonania(formatDateTimeLocal(date));
        }

        if (data.vZNAG_KlientDataZatw) {
          const date = new Date(data.vZNAG_KlientDataZatw);
          setKlientDataZatw(formatDateTimeLocal(date));
        }
      })
      .finally(() => setLoading(false));
  }, [znagId]);

  const formatDateTimeLocal = (date: Date): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  };

  async function handleSign(dataUrl: string, applyToAll: boolean = false) {
    if (!znagId) return;

    try {
      await podpiszZadanie(Number(znagId), dataUrl);

      // Odśwież zadanie
      const updatedZadanie = await getZadanie(Number(znagId));
      setZadanie(updatedZadanie);
      setShowSignatureDialog(false);
      toast.success('Podpis zapisany pomyślnie!');
    } catch (error) {
      console.error("Błąd podpisu:", error);
      toast.error('Błąd zapisu podpisu');
    }
  }

  const handleSave = async () => {
    if (!znagId) return;

    setSaving(true);
    try {
      const updateData: any = {
        ZNAG_Uwagi: uwagi,
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
    } finally {
      setSaving(false);
    }
  };

  const handleSaveHours = async () => {
    if (!znagId) return;

    try {
      const updateData: any = {
        ZNAG_GodzSwieta: godzSwieta,
        ZNAG_GodzSobNoc: godzSobNoc,
        ZNAG_GodzDojazdu: godzDojazdu,
        ZNAG_GodzNaprawa: godzNaprawa,
        ZNAG_GodzWyjazd: godzWyjazd,
        ZNAG_GodzDieta: godzDieta,
        ZNAG_GodzKm: godzKm,
      };

      await toast.promise(
        patchZadanieMultiple(Number(znagId), updateData),
        {
          loading: 'Zapisuję godziny...',
          success: 'Godziny zapisane pomyślnie!',
          error: (err) => `Błąd: ${err.message || 'Nie udało się zapisać'}`,
        }
      );
    } catch (error) {
      console.error("Błąd zapisu godzin:", error);
    }
  };

  if (loading) return <Spinner />;
  if (!zadanie) return <div className="alert alert-danger">Nie znaleziono zadania</div>;

  const isAwaria = zadanie.vZNAG_KategoriaKod === 'R';
  const title = isAwaria ? 'Awaria' : 'Prace różne';

  return (
    <>
      <TopBar title={`${title} #${znagId}`} />
      <div className="container" style={{ marginTop: '70px' }}>
        <BackButton />

        <div className="card mt-3">
          <div className="card-header">
            <h5 className="mb-0">
              {title} - {zadanie.vZNAG_KlientNazwa}
            </h5>
            <small className="text-muted">
              {zadanie.vZNAG_KlientMiasto || zadanie.vZNAG_Miejscowosc}
            </small>
          </div>

          <div className="card-body">
            <Form>
              {/* Uwagi */}
              <Form.Group className="mb-3">
                <Form.Label><strong>Uwagi</strong></Form.Label>
                <Form.Control
                  as="textarea"
                  rows={3}
                  value={uwagi}
                  onChange={(e) => setUwagi(e.target.value)}
                  placeholder="Wprowadź uwagi..."
                  disabled={isPodpisany}
                />
              </Form.Group>

              {/* Godziny */}
              <h6 className="mt-4 mb-3">Godziny</h6>
              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Święta</Form.Label>
                    <Form.Control
                      type="text"
                      value={godzSwieta}
                      onChange={(e) => setGodzSwieta(e.target.value)}
                      placeholder="0"
                      disabled={isPodpisany}
                    />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Sobota/Noc</Form.Label>
                    <Form.Control
                      type="text"
                      value={godzSobNoc}
                      onChange={(e) => setGodzSobNoc(e.target.value)}
                      placeholder="0"
                      disabled={isPodpisany}
                    />
                  </Form.Group>
                </Col>
              </Row>

              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Dojazd</Form.Label>
                    <Form.Control
                      type="text"
                      value={godzDojazdu}
                      onChange={(e) => setGodzDojazdu(e.target.value)}
                      placeholder="0"
                      disabled={isPodpisany}
                    />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Naprawa</Form.Label>
                    <Form.Control
                      type="text"
                      value={godzNaprawa}
                      onChange={(e) => setGodzNaprawa(e.target.value)}
                      placeholder="0"
                      disabled={isPodpisany}
                    />
                  </Form.Group>
                </Col>
              </Row>

              <Row>
                <Col md={4}>
                  <Form.Group className="mb-3">
                    <Form.Label>Wyjazd</Form.Label>
                    <Form.Control
                      type="text"
                      value={godzWyjazd}
                      onChange={(e) => setGodzWyjazd(e.target.value)}
                      placeholder="0"
                      disabled={isPodpisany}
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
                      placeholder="0"
                      disabled={isPodpisany}
                    />
                  </Form.Group>
                </Col>
                <Col md={4}>
                  <Form.Group className="mb-3">
                    <Form.Label>Km</Form.Label>
                    <Form.Control
                      type="text"
                      value={godzKm}
                      onChange={(e) => setGodzKm(e.target.value)}
                      placeholder="0"
                      disabled={isPodpisany}
                    />
                  </Form.Group>
                </Col>
              </Row>

              {/* Przycisk Zapisz dla godzin */}
              {!isPodpisany && (
                <div className="d-flex gap-2 mb-3">
                  <Button variant="primary" onClick={handleSaveHours}>
                    Zapisz
                  </Button>
                </div>
              )}

              {/* Data wykonania */}
              <h6 className="mt-4 mb-3">Data realizacji przeglądu</h6>
              <Form.Group className="mb-3">
                <Form.Label>Data wykonania</Form.Label>
                <Form.Control
                  type="datetime-local"
                  value={dataWykonania}
                  onChange={(e) => setDataWykonania(e.target.value)}
                  disabled={isPodpisany}
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
                      disabled={isPodpisany}
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
                      disabled={isPodpisany}
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
                      disabled={isPodpisany}
                    />
                  </Form.Group>
                </Col>
              </Row>

              {/* Podpis klienta */}
              <h6 className="mt-4 mb-3">Podpis klienta</h6>
              <Card className="mb-3">
                <Card.Body>
                  <div className="d-flex align-items-center justify-content-between">
                    <div>
                      <strong>Status podpisu:</strong> {zadanie?.vZNAG_KlientPodpis ? "Złożony" : "Brak podpisu"}
                    </div>
                    {!isPodpisany && (
                      <Button
                        variant="primary"
                        onClick={() => setShowSignatureDialog(true)}
                      >
                        Złóż podpis
                      </Button>
                    )}
                    {isPodpisany && zadanie?.vZNAG_KlientPodpis && (
                      <div style={{ maxWidth: '200px', border: '1px solid #ccc', padding: '5px' }}>
                        <img src={zadanie.vZNAG_KlientPodpis} alt="Podpis klienta" style={{ width: '100%' }} />
                      </div>
                    )}
                  </div>
                </Card.Body>
              </Card>

              {/* Przyciski akcji */}
              {!isPodpisany && (
                <div className="d-flex gap-2 mt-4">
                  <Button
                    variant="primary"
                    onClick={handleSave}
                    disabled={saving}
                  >
                    {saving ? 'Zapisuję...' : 'Zapisz zmiany'}
                  </Button>
                </div>
              )}
            </Form>
          </div>
        </div>

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
