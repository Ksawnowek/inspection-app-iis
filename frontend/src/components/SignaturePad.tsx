import React, { useRef, useState } from 'react'
import SignatureCanvas from 'react-signature-canvas'
export default function SignaturePad({ value, onChange }:{ value?:string|null, onChange:(b64:string|null)=>void }){
  const ref = useRef<SignatureCanvas>(null); const [saved, setSaved] = useState(false)
  const clear=()=>{ ref.current?.clear(); setSaved(false); onChange(null) }
  const save = ()=>{ if(!ref.current) return; const data=ref.current.getTrimmedCanvas().toDataURL('image/png'); setSaved(true); onChange(data) }
  return (<div>
    <SignatureCanvas ref={ref} penColor="black" canvasProps={{width:520, height:180, style:{border:'1px solid #aaa'}}}/>
    <div style={{marginTop:8, display:'flex', gap:8}}>
      <button onClick={clear}>Wyczyść</button><button onClick={save}>Zapisz podpis</button>{saved && <span>✓ Zapisano</span>}
    </div></div>)
}
