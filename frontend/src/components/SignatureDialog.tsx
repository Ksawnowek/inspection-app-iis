import React, { useEffect, useRef, useState } from "react";
import { Button, Form } from 'react-bootstrap';
import SignatureCanvas from "react-signature-canvas";
import toast from 'react-hot-toast';
import ValidationDialog from './ValidationDialog';
import { getProtokolyZadania } from '../api/zadania';
import { getProtokolPoz } from '../api/protokoly';

type Props = {
  open: boolean;
  onClose: () => void;
  onSave: (dataUrl: string, applyToAll?: boolean) => void;
  oldSignature?: string | null;
  znagId?: number | null;
};

export default function SignatureDialog({
  open,
  onClose,
  onSave,
  oldSignature,
  znagId
}: Props) {
  const ref = useRef<SignatureCanvas>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [applyToAll, setApplyToAll] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [showValidationDialog, setShowValidationDialog] = useState(false);
  const [validationMessage, setValidationMessage] = useState<string>('');
  const [pendingSignature, setPendingSignature] = useState<string | null>(null);

  useEffect(() => {
    if (open && ref.current && oldSignature) {
      ref.current.fromDataURL(oldSignature);
    }
  }, [open, oldSignature]);

  const validateProtokoly = async (): Promise<{ isValid: boolean; message: string }> => {
    if (!znagId || !applyToAll) {
      return { isValid: true, message: '' };
    }

    try {
      // Pobierz listę protokołów dla zadania
      const protokoly = await getProtokolyZadania(znagId);

      // Filtruj tylko aktywne protokoły (bez podpisu)
      const aktywneProtokoly = protokoly.filter((p: any) => !p.PNAGL_PodpisKlienta);

      if (aktywneProtokoly.length === 0) {
        return { isValid: true, message: '' };
      }

      // Sprawdź każdy protokół
      const niekompletneProtokoly: string[] = [];

      for (const protokol of aktywneProtokoly) {
        const pozycje = await getProtokolPoz(protokol.PNAGL_Id);

        // Sprawdź wszystkie pozycje w protokole
        let czyWszystkieWypelnione = true;

        for (const grupa in pozycje) {
          const pozycjeGrupy = pozycje[grupa];

          for (const poz of pozycjeGrupy) {
            // Sprawdź czy przynajmniej jeden checkbox jest zaznaczony
            const czyMaZaznaczony = poz.PPOZ_OcenaNP || poz.PPOZ_OcenaNR || poz.PPOZ_OcenaO || poz.PPOZ_OcenaNA;

            if (!czyMaZaznaczony) {
              czyWszystkieWypelnione = false;
              break;
            }
          }

          if (!czyWszystkieWypelnione) break;
        }

        if (!czyWszystkieWypelnione) {
          niekompletneProtokoly.push(protokol.PNAGL_NrUrzadzenia);
        }
      }

      if (niekompletneProtokoly.length > 0) {
        const message = `Nie wszystkie parametry przy protokołach są wypełnione.\n\nNiekompletne protokoły: ${niekompletneProtokoly.join(', ')}\n\nCzy na pewno chcesz kontynuować?`;
        return { isValid: false, message };
      }

      return { isValid: true, message: '' };
    } catch (error) {
      console.error("Błąd walidacji protokołów:", error);
      return { isValid: true, message: '' }; // W przypadku błędu pozwalamy kontynuować
    }
  };

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

  const handleValidationConfirm = () => {
    setShowValidationDialog(false);
    setShowConfirmDialog(true);
  };

  const handleValidationCancel = () => {
    setShowValidationDialog(false);
    setPendingSignature(null);
  };

  const handleSave = async (data: string) => {
    setPendingSignature(data);

    // Walidacja protokołów jeśli applyToAll jest zaznaczone
    const validation = await validateProtokoly();

    if (!validation.isValid) {
      setValidationMessage(validation.message);
      setShowValidationDialog(true);
    } else {
      setShowConfirmDialog(true);
    }
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

      {/* Dialog walidacji z licznikiem */}
      <ValidationDialog
        open={showValidationDialog}
        onClose={handleValidationCancel}
        onConfirm={handleValidationConfirm}
        message={validationMessage}
        countdown={5}
      />

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
