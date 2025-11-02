import React from "react";
import { ProtokolPozycja, ZdjecieProtokolPoz } from "../types";
import PhotoButton from "./PhotoButton";
import { dodajZdjecie } from "../api/zdjecia";
import {UwagiInput} from "./UwagiInput"
import PhotoManager from "./PhotoManager";

type Props = {
  group: string;
  items: ProtokolPozycja[];
  onChange: (ppozId: number, partial: Partial<ProtokolPozycja>) => void;
  onSyncZdjecia: (ppozId: number, nowaListaZdjec: ZdjecieProtokolPoz[]) => void;
};

const OCENY = ["NP", "O", "NR", "NA"] as const;
const MAP: Record<typeof OCENY[number], keyof ProtokolPozycja> = {
  NP: "PPOZ_OcenaNP",
  O:  "PPOZ_OcenaO",
  NR: "PPOZ_OcenaNR",
  NA: "PPOZ_OcenaNA",
};



export default function ProtokolGroup({ group, items, onChange, onSyncZdjecia }: Props) {

  function handleRadioChange(ppozId, clickedOcena) {
    const partial = {};
    OCENY.forEach(o => { partial[MAP[o]] = "0"; });
    partial[MAP[clickedOcena]] = "1";
    onChange(ppozId, partial); 
  }

  return (
    <fieldset style={{ border: "1px solid #eee", marginBottom: 12 }}>
  <legend>{group}</legend>
  {items.map(row => (
    <div key={row.PPOZ_Id} style={{ padding: 8, borderBottom: "1px solid #f2f2f2" }}>
      
      {/* 2. PIERWSZY BLOK: Operacja, Oceny i Uwagi (bez zmian) */}
      <div>
        <div style={{ fontWeight: 600 }}>{row.PPOZ_Operacja}</div>
        <div style={{ display: "flex", gap: 8, marginTop: 6 }}>
          {OCENY.map(o => {
            const key = MAP[o];
            const checked = (row[key] ?? null) === true;
            return (
              <label key={o} style={{ display: "inline-flex", gap: 4, alignItems: "center" }}>
                <input
                  type="radio"
                  name={`ocena-${row.PPOZ_Id}`}
                  checked={checked}
                  onChange={() => handleRadioChange(row.PPOZ_Id, o)}
                />
                {o}
              </label>
            );
          })}
        </div>
        <div style={{ marginTop: 6 }}>
          <UwagiInput
            ppozId={row.PPOZ_Id}
            initialValue={row.PPOZ_Uwagi}
            onChange={onChange} // Przekazujesz patchPoz
          />
        </div>
      </div>

      {/* 3. DRUGI BLOK: Zdjęcia (teraz PONIŻEJ) */}
      {/* Dodałem `marginTop` dla lepszego odstępu */}
      <div style={{ marginTop: 12 }}>
        <label style={{ display: "inline-flex", gap: 6, alignItems: "center" }}>        
            <PhotoManager
              ppozId={row.PPOZ_Id}
              initialZdjecia={row.ZdjeciaProtokolPoz}
              onSyncZdjecia={onSyncZdjecia} 
            /> 
        </label>
      </div>
      
    </div>
  ))}
</fieldset>
  );
}
