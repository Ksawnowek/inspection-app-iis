import React, { useRef } from "react";
import SignatureCanvas from "react-signature-canvas";

type Props = {
  open: boolean;
  onClose: () => void;
  onSave: (dataUrl: string) => void;
};

export default function SignatureDialog({ open, onClose, onSave }: Props) {
  const ref = useRef<SignatureCanvas>(null);
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
        <div style={{ display:"flex", gap:8, marginTop:8 }}>
          <button onClick={() => ref.current?.clear()}>Wyczyść</button>
          <button onClick={() => { const data = ref.current?.toDataURL("image/png"); if (data) onSave(data); }}>Zapisz</button>
          <button onClick={onClose}>Anuluj</button>
        </div>
      </div>
    </div>
  );
}
