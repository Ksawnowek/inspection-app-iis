import { number, string } from "prop-types";

export type Zadanie = {
  vZNAG_Id: number;
  vZNAG_TypPrzegladu: string;
  vZNAG_KlientNazwa: string;
  vZNAG_KlientMiasto?: string;   // w widoku
  vZNAG_Miejscowosc?: string;    // jeśli gdzieś indziej używasz
  vZNAG_DataPlanowana?: string | null;
  vZNAG_Uwagi?: string | null;
  vZNAG_UwagiGodziny?: string | null;
  vZNAG_KlientPodpis?: string | null;
};


export type ZadaniePozycja = {
  ZPOZ_Id: number;
  ZPOZ_ZNAG_Id: number;
  ZPOZ_UrzadzenieNumer: string;
  ZPOZ_UrzadzenieOpis: string;
  ZPOZ_UrzadzenieDoPrzegladu: false | true;
};

export type ProtokolNaglowek = {
  PNAGL_Id: number;
  PNAGL_Tytul: string;
  PNAGL_Klient: string;
  PNAGL_Miejscowosc: string;
  PNAGL_NrUrzadzenia: string;
  PNAGL_PodpisKlienta: string;
};

// export type ProtokolPozycja = {
//   PPOZ_Id: number;
//   PPOZ_PNAGL_Id: number;
//   PPOZ_Lp: number;
//   PPOZ_GrupaOperacji: string;
//   PPOZ_Operacja: string;
//   PPOZ_OcenaNP?: string | null;
//   PPOZ_OcenaO?: string | null;
//   PPOZ_OcenaNR?: string | null;
//   PPOZ_OcenaNA?: string | null;
//   PPOZ_Uwagi?: string | null;
//   PPOZ_CzyZdjecia?: 0 | 1 | null;
// };

export interface ProtokolPozycja {
  PPOZ_GrupaOperacji: string;
  PPOZ_OcenaNP: boolean;
  PPOZ_OcenaNR: boolean;
  PPOZ_CzyZdjecia: boolean;
  PPOZ_TS: string; // Reprezentacja daty jako string (ISO 8601)
  PPOZ_PNAGL_Id: number;
  PPOZ_Id: number;
  PPOZ_Lp: number;
  PPOZ_Operacja: string;
  PPOZ_OcenaO: boolean;
  PPOZ_OcenaNA: boolean;
  PPOZ_UZTOstatni: string;
  PPOZ_Uwagi: string | null;
  ZdjeciaProtokolPoz: ZdjecieProtokolPoz[]; // Możesz tu wstawić bardziej szczegółowy typ, jeśli wiesz, co zawiera ta tablica
}

export type ProtokolResponse = {
  inspection: ProtokolNaglowek;
  values: ProtokolPozycja[];
};

export type ProtokolZapis = {
  user: string;
  values: Partial<ProtokolPozycja & { PPOZ_CzyZdjecia: boolean }> & { PPOZ_Id: number };
};

export interface ZdjecieProtokolPoz {
  ZDJP_Id: number;
  ZDJP_PPOZ_Id: number;
  ZDJP_Sciezka: string;
}