import React, { useState } from 'react'
import Orders from './Orders'; import Inspection from './Inspection'
export default function App(){
  const [orderId, setOrderId] = useState<number>(1)
  const [inspectionId, setInspectionId] = useState<number|null>(null)
  return (<div style={{maxWidth:1000, margin:'20px auto', fontFamily:'Inter,system-ui,Arial'}}>
    <h1>Przeglądy suwnic</h1>
    {!inspectionId ? <Orders orderId={orderId} onStart={setOrderId} onCreated={setInspectionId} /> : <Inspection inspectionId={inspectionId} onBack={()=> setInspectionId(null)} />}
  </div>)
}
