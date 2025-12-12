import React, { useEffect, useRef, useState } from "react";
import { Button, Form } from 'react-bootstrap';
import SignatureCanvas from "react-signature-canvas";
import toast from 'react-hot-toast';

type Props = {
  open: boolean;
  onClose: () => void;
  onSave: (dataUrl: string, applyToAll?: boolean) => void;
  oldSignature?: string | null;
};

export default function SignatureDialog({
  open,
  onClose,
  onSave,
  oldSignature
}: Props) {
  const ref = useRef<SignatureCanvas>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [applyToAll, setApplyToAll] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [pendingSignature, setPendingSignature] = useState<string | null>(null);

  useEffect(() => {
    if (open && ref.current && oldSignature) {
      ref.current.fromDataURL(oldSignature);
    }
  }, [open, oldSignature]);

  const handleConfirmSave = async () => {
    if (!pendingSignature) return;

    setShowConfirmDialog(false);
    setIsSaving(true);
    try {
      await toast.promise(
        onSave(pendingSignature, applyToAll),
        {
          loading: 'Zapisywanie...',
          success: 'Zapisano pomyślnie!',
          error: (err) => `Błąd: ${err.message || 'Nie udało się zapisać'}`,
        }
      );
      setPendingSignature(null);
      onClose();
    } catch (error) {
      console.error("Błąd zapisu:", error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancelSave = () => {
    setShowConfirmDialog(false);
    setPendingSignature(null);
  };

  const handleSave = (data: string) => {
    setPendingSignature(data);
    setShowConfirmDialog(true);
  };


  if (!open) return null;

  return (
    <>
      <div style={{ position:"fixed", inset:0, background:"#0008", display:"grid", placeItems:"center", zIndex: 1050 }}>
        <div style={{ background:"#fff", padding:16, width:420 }}>
          <h3>Podpis klienta</h3>
          <SignatureCanvas
            ref={ref}
            penColor="black"
            canvasProps={{ width: 380, height: 200, style: { border: "1px solid #ccc" } }}
          />

          {/* Checkbox do zastosowania podpisu do wszystkich protokołów */}
          <Form.Group className="mt-3 mb-2">
            <Form.Check
              type="checkbox"
              id="apply-to-all-checkbox"
              label="Zastosuj do wszystkich protokołów"
              checked={applyToAll}
              onChange={(e) => setApplyToAll(e.target.checked)}
            />
          </Form.Group>

          <div style={{ display:"flex", gap:8, marginTop:8 }}>
            <Button
              variant = "primary"
              onClick={() => {
                if (ref.current && !ref.current.isEmpty()) {
                  const data = ref.current.toDataURL("image/png");
                  if (data) handleSave(data);
                } else {
                  toast.error("Podpis jest pusty");
                }
              }}
              disabled={isSaving}
              style={{ padding: '8px 12px', borderRadius: 4, background: '#007bff', color: 'white', border: 'none' }}
            >
              {isSaving ? "Zapisywanie..." : "Zapisz"}
            </Button>

            <Button
            variant="secondary"
            onClick={() => ref.current?.clear()}
            >
              Wyczyść
            </Button>

            <Button
              variant="secondary"
              onClick={onClose}
              >
              Anuluj
            </Button>
          </div>
        </div>
      </div>

      {/* Dialog potwierdzenia */}
      {showConfirmDialog && (
        <div style={{ position:"fixed", inset:0, background:"#000a", display:"grid", placeItems:"center", zIndex: 1060 }}>
          <div style={{ background:"#fff", padding:24, width:400, borderRadius: 8, boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
            <h4 style={{ marginBottom: 16 }}>Potwierdzenie podpisu</h4>
            <p style={{ marginBottom: 20 }}>
              Po złożeniu podpisu nie będzie możliwości wprowadzania zmian w zadaniu. Czy jesteś pewien?
            </p>
            <div style={{ display:"flex", gap:8, justifyContent:"flex-end" }}>
              <Button
                variant="secondary"
                onClick={handleCancelSave}
              >
                Anuluj
              </Button>
              <Button
                variant="primary"
                onClick={handleConfirmSave}
              >
                Potwierdzam
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
