// frontend/src/api/zadania.ts
import { api } from "./client";
import { Zadanie, ZadaniePozycja } from "../types";

/** Lista zadań (widok v_Zadania) */
export async function getZadania(): Promise<Zadanie[]> {
  const { data } = await api.get<Zadanie[]>("/zadania");
  return data;
}

/** (Opcjonalnie) pojedyncze zadanie – jeśli masz endpoint /api/zadania/:id */
export async function getZadanie(znagId: number): Promise<Zadanie> {
  const { data } = await api.get<Zadanie>(`/zadania/${znagId}`);
  return data;
}

/** Pozycje zadania (widok v_ZadaniePozycje) */
export async function getZadaniePozycje(
  znagId: number
): Promise<ZadaniePozycja[]> {
  const { data } = await api.get<ZadaniePozycja[]>(`/zadania/${znagId}/pozycje`);
  return data;
}

export async function getZadaniePozycjeSerwisant(
  znagId: number
): Promise<ZadaniePozycja[]> {
  const { data } = await api.get<ZadaniePozycja[]>(`/zadania/${znagId}/pozycje-serwisant`);
  return data;
}

/** Ustaw/wyłącz flagę 'do przeglądu' dla pozycji zadania */
export async function setDoPrzegladu(
  zpozId: number,
  value: boolean,
  user: string
): Promise<void> {
  await api.put(`/zadania/pozycje/${zpozId}/do-przegladu`, { value, user });
}

/** Generuj PDF dla zadania i zwróć Blob (nie zapisuje automatycznie) */
export async function generateZadaniePdf(
  znagId: number,
  serwisanci: string[] = []
): Promise<Blob> {
  const { data } = await api.post(
    `/zadania/${znagId}/pdf/generuj`, // <-- BYŁO: /pdf
    { serwisanci },
    { responseType: "blob" }
  );
  return data as Blob;
}

/** Generuj i od razu pobierz PDF (helper do przycisku w UI) */
export async function downloadZadaniePdf(
  znagId: number,
  serwisanci: string[] = []
): Promise<void> {
  const blob = await generateZadaniePdf(znagId, serwisanci);
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `zadanie_${znagId}.pdf`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}


export async function patchZadanie(
  znagId: number,
  fieldName: string,
  fieldValue: string
): Promise<Zadanie> {
  const { data } = await api.patch(
    `/zadania/patch/${znagId}`,
    {[fieldName]: fieldValue}
  );
  return data;
}

export async function podpiszZadanie(
  znagId: number,
  podpisKlienta: string
): Promise<Zadanie>{
  const { data } = await api.patch(
    `/zadania/patch/${znagId}`,
    {ZNAG_KlientPodpis: podpisKlienta}
  )
  return data;
}