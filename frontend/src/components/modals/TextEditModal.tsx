import { Button, Modal } from 'react-bootstrap';
import {useState, useEffect} from "react";
import toast from 'react-hot-toast';

type TextEditModalProps = {
  title: string;
  name: string;
  oldValue: string;
  show: boolean;
  onHide: () => void;
  elementId: number;
  onSave: (valueName: string, newValue: string) => Promise<void>;
};

export function TextEditModal({ 
  name, 
  title, 
  oldValue, 
  show, 
  onHide, 
  elementId, 
  onSave 
}: TextEditModalProps) {

  const [data, setData] = useState(oldValue);
  const [isSaving, setIsSaving] = useState(false);
  const handleSave = async () => {
    setIsSaving(true); 
    try {
      await toast.promise(
        onSave(name, data), 
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
      setData(oldValue);
    }
  }, [oldValue, show]);

  return (
    <Modal show={show} onHide={onHide} centered>
      <Modal.Header closeButton>
        <Modal.Title>{title}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <form>
          <div className="form-group">
            <label htmlFor={name}>Podaj {title}</label>
            <textarea
            id={name}
            name = {name}
            value={data}
            onChange={(e) => setData(e.target.value)}
            className="form-control"
            rows = {5}
            >
            </textarea>
          </div>
        </form>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onHide}>Anuluj</Button>
        <Button variant="primary" onClick={handleSave} disabled={isSaving}>{isSaving ? "Zapisywanie..." : "Zapisz"}</Button>
      </Modal.Footer>
    </Modal>
  );
}