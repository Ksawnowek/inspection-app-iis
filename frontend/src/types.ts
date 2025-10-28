export type Zadanie = {
  ZNAG_Id: number;
  ZNAG_TypPrzegladu: string;
  ZNAG_KlientNazwa: string;
  ZNAG_KlientMiasto?: string;   // w widoku
  ZNAG_Miejscowosc?: string;    // jeśli gdzieś indziej używasz
  ZNAG_DataPlanowana?: string | null;
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
};

export type ProtokolPozycja = {
  PPOZ_Id: number;
  PPOZ_PNAGL_Id: number;
  PPOZ_Lp: number;
  PPOZ_GrupaOperacji: string;
  PPOZ_Operacja: string;
  PPOZ_OcenaNP?: string | null;
  PPOZ_OcenaO?: string | null;
  PPOZ_OcenaNR?: string | null;
  PPOZ_OcenaNA?: string | null;
  PPOZ_Uwagi?: string | null;
  PPOZ_CzyZdjecia?: 0 | 1 | null;
};

export type ProtokolResponse = {
  inspection: ProtokolNaglowek;
  values: ProtokolPozycja[];
};

export type ProtokolZapis = {
  user: string;
  values: Partial<ProtokolPozycja & { PPOZ_CzyZdjecia: boolean }> & { PPOZ_Id: number };
};
