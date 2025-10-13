import React, { useEffect, useState } from 'react'
import API from '../api'
type Order={ id:number; customer_name:string; contract_no?:string; task_no?:string; review_type?:string; frequency?:string; product_code?:string; product_name?:string }
export default function Orders({ orderId, onStart, onCreated }:{ orderId:number, onStart:(id:number)=>void, onCreated:(id:number)=>void }){
  const [order,setOrder]=useState<Order|null>(null); const [params,setParams]=useState<any[]>([])
  useEffect(()=>{ API.get(`/orders/${orderId}`).then(r=>setOrder(r.data)); API.get(`/orders/${orderId}/params`).then(r=>setParams(r.data)) },[orderId])
  const start=async()=>{ if(!order) return; const res=await API.post('/inspections',{ order_id:order.id, product_code:order.product_code, customer_name:order.customer_name, checklist_type:order.review_type||'M5' }); onCreated(res.data.inspection_id) }
  return (<div>
    <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:20}}>
      <div><h2>Zlecenie</h2>{order? <ul>
        <li><b>Klient:</b> {order.customer_name}</li>
        <li><b>Kontrakt:</b> {order.contract_no}</li>
        <li><b>Zadanie:</b> {order.task_no}</li>
        <li><b>Produkt:</b> {order.product_name} ({order.product_code})</li>
        <li><b>Typ przeglądu:</b> {order.review_type}</li>
      </ul> : 'Ładowanie...'}</div>
      <div><h2>Parametry produktu</h2><div style={{maxHeight:240, overflow:'auto', border:'1px solid #ddd', padding:8}}>
        {params.map((g:any)=>(<div key={g.name}><b>{g.name}</b><ul>{g.items.map((i:any)=>(<li key={i.code}>{i.code} – {i.label}</li>))}</ul></div>))}
      </div></div>
    </div>
    <div style={{marginTop:20}}><button onClick={start} style={{padding:'10px 16px'}}>Rozpocznij protokół</button></div>
  </div>)
}
