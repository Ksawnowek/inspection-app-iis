import { Button, Modal } from 'react-bootstrap';
import { useState, useEffect } from "react";
import toast from 'react-hot-toast';

type HoursData = {
  ZNAG_GodzSwieta: string;
  ZNAG_GodzSobNoc: string;
  ZNAG_GodzDojazdu: string;
  ZNAG_GodzNaprawa: string;
  ZNAG_GodzWyjazd: string;
  ZNAG_GodzDieta: string;
  ZNAG_GodzKm: string;
  ZNAG_UwagiGodziny: string;
};

type HoursEditModalProps = {
  show: boolean;
  onHide: () => void;
  elementId: number;
  initialData: HoursData;
  onSave: (data: HoursData) => Promise<void>;
};

export function HoursEditModal({
  show,
  onHide,
  elementId,
  initialData,
  onSave
}: HoursEditModalProps) {

  const [data, setData] = useState<HoursData>(initialData);
  const [isSaving, setIsSaving] = useState(false);

  const handleChange = (field: keyof HoursData, value: string) => {
    setData(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await toast.promise(
        onSave(data),
        {
          loading: 'Zapisywanie...',
          success: 'Zapisano pomyślnie!',
          error: (err) => `Błąd: ${err.message || 'Nie udało się zapisać'}`,
        }
      );
      onHide();
    } catch (error) {
      console.error("Błąd zapisu (obsłużony przez toast):", error);
    } finally {
      setIsSaving(false);
    }
  };

  useEffect(() => {
    if (show) {
      setData(initialData);
    }
  }, [initialData, show]);

  return (
    <Modal show={show} onHide={onHide} centered size="lg">
      <Modal.Header closeButton>
        <Modal.Title>Zarządzaj godzinami</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <form>
          <div className="row">
            <div className="col-md-6 mb-3">
              <label htmlFor="godzSwieta" className="form-label">
                Godziny świąteczne
              </label>
              <input
                id="godzSwieta"
                type="text"
                value={data.ZNAG_GodzSwieta}
                onChange={(e) => handleChange('ZNAG_GodzSwieta', e.target.value)}
                className="form-control"
                placeholder="np. 8h"
              />
            </div>

            <div className="col-md-6 mb-3">
              <label htmlFor="godzSobNoc" className="form-label">
                Godziny sobota/noc
              </label>
              <input
                id="godzSobNoc"
                type="text"
                value={data.ZNAG_GodzSobNoc}
                onChange={(e) => handleChange('ZNAG_GodzSobNoc', e.target.value)}
                className="form-control"
                placeholder="np. 4h"
              />
            </div>
          </div>

          <div className="row">
            <div className="col-md-6 mb-3">
              <label htmlFor="godzDojazdu" className="form-label">
                Godziny dojazdu
              </label>
              <input
                id="godzDojazdu"
                type="text"
                value={data.ZNAG_GodzDojazdu}
                onChange={(e) => handleChange('ZNAG_GodzDojazdu', e.target.value)}
                className="form-control"
                placeholder="np. 2h"
              />
            </div>

            <div className="col-md-6 mb-3">
              <label htmlFor="godzNaprawa" className="form-label">
                Godziny naprawy
              </label>
              <input
                id="godzNaprawa"
                type="text"
                value={data.ZNAG_GodzNaprawa}
                onChange={(e) => handleChange('ZNAG_GodzNaprawa', e.target.value)}
                className="form-control"
                placeholder="np. 6h"
              />
            </div>
          </div>

          <div className="row">
            <div className="col-md-6 mb-3">
              <label htmlFor="godzWyjazd" className="form-label">
                Godziny wyjazd
              </label>
              <input
                id="godzWyjazd"
                type="text"
                value={data.ZNAG_GodzWyjazd}
                onChange={(e) => handleChange('ZNAG_GodzWyjazd', e.target.value)}
                className="form-control"
                placeholder="np. 1h"
              />
            </div>

            <div className="col-md-6 mb-3">
              <label htmlFor="godzDieta" className="form-label">
                Dieta
              </label>
              <input
                id="godzDieta"
                type="text"
                value={data.ZNAG_GodzDieta}
                onChange={(e) => handleChange('ZNAG_GodzDieta', e.target.value)}
                className="form-control"
                placeholder="np. 50 zł"
              />
            </div>
          </div>

          <div className="mb-3">
            <label htmlFor="godzKm" className="form-label">
              Kilometry
            </label>
            <input
              id="godzKm"
              type="text"
              value={data.ZNAG_GodzKm}
              onChange={(e) => handleChange('ZNAG_GodzKm', e.target.value)}
              className="form-control"
              placeholder="np. 150 km"
            />
          </div>

          <div className="mb-3">
            <label htmlFor="uwagiGodziny" className="form-label">
              Uwagi do godzin
            </label>
            <textarea
              id="uwagiGodziny"
              value={data.ZNAG_UwagiGodziny}
              onChange={(e) => handleChange('ZNAG_UwagiGodziny', e.target.value)}
              className="form-control"
              rows={3}
              placeholder="Dodatkowe uwagi..."
            />
          </div>
        </form>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onHide}>
          Anuluj
        </Button>
        <Button variant="primary" onClick={handleSave} disabled={isSaving}>
          {isSaving ? "Zapisywanie..." : "Zapisz"}
        </Button>
      </Modal.Footer>
    </Modal>
  );
}
