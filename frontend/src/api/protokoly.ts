import { api } from "./client";
import { ProtokolNaglowek, ProtokolPozycja, ProtokolResponse, ProtokolZapis } from "../types";

export async function getProtokol(pnaglId: number): Promise<ProtokolResponse> {
  const { data } = await api.get(`/protokoly/${pnaglId}`);
  return data;
}

export async function getProtokolPoz(pnaglId: number): Promise<Record<string, ProtokolPozycja[]>> {
  const { data } = await api.get(`/protokoly/pozycje/${pnaglId}`);
  return data;
}

export async function patchProtokolPoz(ppozId: number, partial: Partial<ProtokolPozycja> ): Promise<ProtokolPozycja> {
  const { data } = await api.patch(
    `/protokoly/pozycje/patch/${ppozId}`,
    {...partial}
  );
  return data;
}


export async function getProtokolNaglowek(pnaglId: number): Promise<ProtokolNaglowek> {
  const { data } = await api.get(`/protokoly/naglowek/${pnaglId}`);
  return data;
}




export async function saveProtokol(pnaglId: number, payload: ProtokolZapis) {
  await api.put(`/protokoly/${pnaglId}`, payload);
}

export async function podpiszProtokol(pnaglId: number, podpis_klienta: string, zaakceptowal: string) {
  await api.post(`/protokoly/${pnaglId}/podpis`, { Podpis: podpis_klienta, Klient: zaakceptowal });
}
