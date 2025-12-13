// frontend/src/api/zadania.ts
import { api } from "./client";
import { Zadanie, ZadaniePozycja } from "../types";

/** Lista zadań (widok v_Zadania) z paginacją i wyszukiwaniem */
export async function getZadania(params?: {
  search?: string;
  page?: number;
  page_size?: number;
}): Promise<{
  items: Zadanie[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
}> {
  const { data } = await api.get("/zadania", { params });
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

export async function patchZadanieMultiple(
  znagId: number,
  fields: Record<string, any>
): Promise<Zadanie> {
  const { data } = await api.patch(
    `/zadania/patch/${znagId}`,
    fields
  );
  return data;
}

export async function podpiszWszystkieProtokoly(
  znagId: number,
  podpisKlienta: string,
  klient: string = "Klient"
): Promise<{ ok: boolean; signed_count: number }> {
  const { data } = await api.post(
    `/zadania/${znagId}/podpis-wszystkie-protokoly`,
    { Podpis: podpisKlienta, Klient: klient }
  );
  return data;
}

export async function getProtokolyZadania(
  znagId: number
): Promise<any[]> {
  const { data } = await api.get(`/zadania/${znagId}/protokoly`);
  return data;
}

// ============= OPISY PRAC =============

export interface OpisPrac {
  ZOP_Id: number;
  ZOP_ZNAGL_Id: number;
  ZOP_OpisPrac: string;
}

export async function getOpisyPrac(znagId: number): Promise<OpisPrac[]> {
  const { data } = await api.get(`/zadania/${znagId}/opisy-prac`);
  return data;
}

export async function addOpisPrac(znagId: number, opisPrac: string): Promise<OpisPrac> {
  const { data } = await api.post(`/zadania/${znagId}/opisy-prac`, { opis_prac: opisPrac });
  return data;
}

export async function updateOpisPrac(zopId: number, opisPrac: string): Promise<OpisPrac> {
  const { data } = await api.patch(`/zadania/opisy-prac/${zopId}`, { opis_prac: opisPrac });
  return data;
}

export async function deleteOpisPrac(zopId: number): Promise<void> {
  await api.delete(`/zadania/opisy-prac/${zopId}`);
}