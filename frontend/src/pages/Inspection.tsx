import React, { useEffect, useState } from 'react'
import API from '../api'; import SignaturePad from '../components/SignaturePad'
type Group={ name:string, items:{code:string,label:string,ptype:string}[] }
type Header={ inspection_id:number, order_id:number, product_code:string, customer_name:string, checklist_type:string, remarks?:string|null, pdf_path?:string|null, status:number }
export default function Inspection({ inspectionId, onBack }:{ inspectionId:number, onBack:()=>void }){
  const [header,setHeader]=useState<Header|null>(null); const [groups,setGroups]=useState<Group[]>([])
  const [vals,setVals]=useState<Record<string,string>>({}); const [remarks,setRemarks]=useState<string>(''); const [sig,setSig]=useState<string|null>(null)
  useEffect(()=>{ API.get(`/inspections/${inspectionId}`).then(r=>{ setHeader(r.data.inspection); setVals(r.data.values||{}); setRemarks(r.data.inspection?.remarks||'') }) },[inspectionId])
  useEffect(()=>{ if(!header) return; API.get(`/orders/${header.order_id}/params`).then(r=> setGroups(r.data)) },[header])
  const save=async()=>{ if(!header) return; await API.put(`/inspections/${header.inspection_id}`, { order_id:header.order_id, product_code:header.product_code, customer_name:header.customer_name, checklist_type:header.checklist_type, filled_values:vals, remarks, signature_base64:sig }); alert('Zapisano.') }
  const genPdf=async()=>{ await save(); await API.post(`/inspections/${inspectionId}/pdf`); window.open(`/api/inspections/${inspectionId}/pdf`,'_blank') }
  const change=(code:string,value:string)=> setVals(v=>({...v,[code]:value}))
  return (<div>
    <button onClick={onBack}>&larr; Powrót</button><h2>Protokół #{inspectionId}</h2>
    {groups.map(g=>(<fieldset key={g.name} style={{marginBottom:12}}><legend><b>{g.name}</b></legend>
      {g.items.map(i=>(<div key={i.code} style={{display:'grid', gridTemplateColumns:'1fr 180px', gap:8, alignItems:'center', margin:'4px 0'}}>
        <label htmlFor={i.code}>{i.code} – {i.label}</label>
        <select id={i.code} value={vals[i.code]||''} onChange={e=>change(i.code, e.target.value)}>
          <option value=""></option><option value="OK">OK</option><option value="NP">NP</option><option value="NR">NR</option><option value="NA">NA</option>
        </select></div>))}
    </fieldset>))}
    <div style={{marginTop:12}}><label>Uwagi ogólne</label><br/><textarea value={remarks} onChange={e=>setRemarks(e.target.value)} rows={4} style={{width:'100%'}}/></div>
    <div style={{marginTop:16}}><h3>Podpis klienta</h3><SignaturePad value={sig} onChange={setSig} /></div>
    <div style={{marginTop:16, display:'flex', gap:8}}><button onClick={save}>Zapisz</button><button onClick={genPdf}>Generuj PDF i wyślij na FTP</button></div>
  </div>)
}
