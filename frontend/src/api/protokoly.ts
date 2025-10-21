import { api } from "./client";
import { ProtokolResponse, ProtokolZapis } from "../types";

export async function getProtokol(pnaglId: number): Promise<ProtokolResponse> {
  const { data } = await api.get(`/protokoly/${pnaglId}`);
  return data;
}

export async function saveProtokol(pnaglId: number, payload: ProtokolZapis) {
  await api.put(`/protokoly/${pnaglId}`, payload);
}

export async function podpiszProtokol(pnaglId: number, podpis_klienta: string, zaakceptowal: string) {
  await api.post(`/protokoly/${pnaglId}/podpis`, { podpis_klienta, zaakceptowal });
}
