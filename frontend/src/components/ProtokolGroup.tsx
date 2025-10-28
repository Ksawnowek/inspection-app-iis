import React from "react";
import { ProtokolPozycja } from "../types";
import PhotoButton from "./PhotoButton";
import { dodajZdjecie } from "../api/zdjecia";

type Props = {
  group: string;
  items: ProtokolPozycja[];
  onChange: (ppozId: number, patch: Partial<ProtokolPozycja>) => void;
};

const OCENY = ["NP", "O", "NR", "NA"] as const;
const MAP: Record<typeof OCENY[number], keyof ProtokolPozycja> = {
  NP: "PPOZ_OcenaNP",
  O:  "PPOZ_OcenaO",
  NR: "PPOZ_OcenaNR",
  NA: "PPOZ_OcenaNA",
};


function addPhotoPreview(){
  const previewSpan = document.querySelector()
}


export default function ProtokolGroup({ group, items, onChange }: Props) {
  return (
    <fieldset style={{ border:"1px solid #eee", marginBottom:12 }}>
      <legend>{group}</legend>
      {items.map(row => (
        <div key={row.PPOZ_Id} style={{ display:"grid", gridTemplateColumns:"1fr auto", gap:8, padding:8, borderBottom:"1px solid #f2f2f2" }}>
          <div>
            <div style={{ fontWeight:600 }}>{row.PPOZ_Operacja}</div>
            <div style={{ display:"flex", gap:8, marginTop:6 }}>
              {OCENY.map(o => {
                const key = MAP[o];
                const checked = (row[key] ?? null) === "1";
                return (
                  <label key={o} style={{ display:"inline-flex", gap:4, alignItems:"center" }}>
                    <input
                      type="radio"
                      name={`ocena-${row.PPOZ_Id}`}
                      checked={checked}
                      onChange={() => {
                        const patch: Partial<ProtokolPozycja> = {
                          PPOZ_OcenaNP: null, PPOZ_OcenaO: null, PPOZ_OcenaNR: null, PPOZ_OcenaNA: null
                        };
                        (patch as any)[key] = "1";
                        onChange(row.PPOZ_Id, patch);
                      }}
                    />
                    {o}
                  </label>
                );
              })}
            </div>
            <div style={{ marginTop:6 }}>
              <input
                placeholder="Uwagi…"
                value={row.PPOZ_Uwagi ?? ""}
                onChange={(e) => onChange(row.PPOZ_Id, { PPOZ_Uwagi: e.target.value })}
                style={{ width:"100%" }}
              />
            </div>
          </div>
          <div>
            <label style={{ display:"inline-flex", gap:6, alignItems:"center" }}>
              <input
                type="checkbox"
                checked={(row.PPOZ_CzyZdjecia ?? 0) === 1}
                onChange={(e) => onChange(row.PPOZ_Id, { PPOZ_CzyZdjecia: e.target.checked ? 1 : 0 })}
              />
              Zdjęcia
              {/* <PhotoButton
                onPick={async (file) => {
                            await dodajZdjecie(row.PPOZ_Id, file);
                            alert("Dodano zdjęcie.");
                          }}
              ></PhotoButton>
              <span className="photo-preview">
               <img src={}/> 

              </span> */}
            </label>
          </div>
        </div>
      ))}
    </fieldset>
  );
}
