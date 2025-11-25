import React, { useState } from "react"; 
import { Collapse } from "react-bootstrap"; 
import ToggleButton from 'react-bootstrap/ToggleButton'; 
import ToggleButtonGroup from 'react-bootstrap/ToggleButtonGroup'; 
import { ProtokolPozycja, ZdjecieProtokolPoz } from "../types";
import PhotoButton from "./PhotoButton";
import { dodajZdjecie } from "../api/zdjecia";
import { UwagiInput } from "./UwagiInput"
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
  O: "PPOZ_OcenaO",
  NR: "PPOZ_OcenaNR",
  NA: "PPOZ_OcenaNA",
};



export default function ProtokolGroup({ group, items, onChange, onSyncZdjecia }: Props) {

  /*
  Funkcja zmienia pole radio tak, zeby lokalny obiekt odzwierciedlił stan, który chcemy uzyskać w bazie
  Następnie wysyła zmienione dane do funkcji podanej parametrem OnChange
  */
  function handleRadioChange(ppozId, clickedOcena) {
    const partial = {};
    OCENY.forEach(o => { partial[MAP[o]] = false; });
    partial[MAP[clickedOcena]] = true;
    onChange(ppozId, partial);
  }

  const [isOpen, setIsOpen] = useState(true);

  return (
    <fieldset className="border rounded" style={{ marginBottom: 12 }}>
      <legend
        onClick={() => setIsOpen(!isOpen)}
        style={{ cursor: "pointer", userSelect: "none" }}
        aria-controls={`collapse-group-${group}`}
        aria-expanded={isOpen}
        className="heading-1"
      >
        {/* Prosty wskaźnik (opcjonalnie) */}
        {isOpen ? "▾" : "▸"} {group}
      </legend>
      <Collapse in={isOpen}><div id={`collapse-group-${group}`}>
        {items.map(row => {
          
          // <-- ZMIANA 3: Musimy znaleźć, która ocena jest "aktywna"
          // Szukamy w `row` klucza (NP, O, NR, NA), który ma wartość `true`
          const obecnaOcena = OCENY.find(o => (row[MAP[o]] ?? null) === true);

          return (
            <div key={row.PPOZ_Id} className="protokol-row" style={{ padding: 8, borderBottom: "1px solid #f2f2f2" }}>

              <div>
                <div style={{ fontWeight: 600 }}>{row.PPOZ_Operacja}</div>

                {/* --- ZMIANA 4: Cały blok <input> zastępujemy tym: --- */}
                <ToggleButtonGroup
                  type="radio"
                  name={`ocena-${row.PPOZ_Id}`}
                  value={obecnaOcena} 
                  onChange={(newOcena) => handleRadioChange(row.PPOZ_Id, newOcena)} 
                  style={{ marginTop: 6 }}
                  size="lg" // "sm" dobrze wygląda w listach, możesz dać "lg" dla super-dotyku
                >
                  {OCENY.map(o => (
                    <ToggleButton
                      key={o}
                      id={`tbg-ocena-${row.PPOZ_Id}-${o}`}
                      value={o}
                      variant="outline-primary" // Styl, możesz zmienić na "outline-primary"
                    >
                      {o}
                    </ToggleButton>
                  ))}
                </ToggleButtonGroup>
              <div style={{ marginTop: 12, marginBottom: 12 }}>
                <UwagiInput
                  ppozId={row.PPOZ_Id}
                  initialValue={row.PPOZ_Uwagi}
                  onChange={onChange}
                  
                />
              </div>
            </div>

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
          )
        })}
      </div>
      </Collapse>
    </fieldset>
  );
}
