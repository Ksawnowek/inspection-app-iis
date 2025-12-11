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

  useEffect(() => {
    if (open && ref.current && oldSignature) {
      ref.current.fromDataURL(oldSignature);
    }
  }, [open, oldSignature]);

  const handleSave = async (data: string) => {
      setIsSaving(true);
      try {
        await toast.promise(
          onSave(data, applyToAll),
          {
            loading: 'Zapisywanie...',
            success: 'Zapisano pomyślnie!',
            error: (err) => `Błąd: ${err.message || 'Nie udało się zapisać'}`,
          }
        );
        onClose();
      } catch (error) {
        console.error("Błąd zapisu:", error);
      } finally {
        setIsSaving(false);
      }
    };


  if (!open) return null;

  return (
    <div style={{ position:"fixed", inset:0, background:"#0008", display:"grid", placeItems:"center" }}>
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
                console.log("Podpis jest pusty, nie zapisano.");
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
  );
}
