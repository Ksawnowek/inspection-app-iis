import React, { useState } from 'react';
import { Modal, Button, Form } from 'react-bootstrap';
import toast from 'react-hot-toast';

export type FailureDetailsData = {
  ZNAG_Urzadzenie: string;
  ZNAG_Tonaz: string;
  ZNAG_AwariaNumer: string;
  ZNAG_OkrGwar: boolean;
};

interface FailureDetailsModalProps {
  show: boolean;
  onHide: () => void;
  elementId: number;
  initialData: FailureDetailsData;
  onSave: (data: FailureDetailsData) => Promise<void>;
}

export function FailureDetailsModal({ show, onHide, elementId, initialData, onSave }: FailureDetailsModalProps) {
  const [data, setData] = useState<FailureDetailsData>(initialData);
  const [isSaving, setIsSaving] = useState(false);

  React.useEffect(() => {
    if (show) {
      setData(initialData);
    }
  }, [show, initialData]);

  const handleChange = (field: keyof FailureDetailsData, value: string | boolean) => {
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
      console.error('Błąd podczas zapisywania:', error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Modal show={show} onHide={onHide} size="lg">
      <Modal.Header closeButton>
        <Modal.Title>Edytuj dane awarii / prac różnych - Zadanie #{elementId}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form>
          <Form.Group className="mb-3">
            <Form.Label>Urządzenie</Form.Label>
            <Form.Control
              type="text"
              value={data.ZNAG_Urzadzenie}
              onChange={(e) => handleChange('ZNAG_Urzadzenie', e.target.value)}
              placeholder="Nazwa urządzenia"
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Tonaż</Form.Label>
            <Form.Control
              type="text"
              value={data.ZNAG_Tonaz}
              onChange={(e) => handleChange('ZNAG_Tonaz', e.target.value)}
              placeholder="np. 5t, 10t"
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Numer awarii</Form.Label>
            <Form.Control
              type="text"
              value={data.ZNAG_AwariaNumer}
              onChange={(e) => handleChange('ZNAG_AwariaNumer', e.target.value)}
              placeholder="Numer awarii"
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Check
              type="checkbox"
              label="Okres gwarancyjny (OKR.GWAR.)"
              checked={data.ZNAG_OkrGwar}
              onChange={(e) => handleChange('ZNAG_OkrGwar', e.target.checked)}
            />
          </Form.Group>
        </Form>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onHide} disabled={isSaving}>
          Anuluj
        </Button>
        <Button variant="primary" onClick={handleSave} disabled={isSaving}>
          {isSaving ? 'Zapisuję...' : 'Zapisz'}
        </Button>
      </Modal.Footer>
    </Modal>
  );
}
