import { ZdjecieProtokolPoz } from "../types";
import { api } from "./client";

export async function dodajZdjecie(parentPpozId: number, file: File) {
  const form = new FormData();
  form.append("parent_ppoz_id", String(parentPpozId));
  form.append("file", file);
  await api.post("/zdjecia", form, { headers: { "Content-Type": "multipart/form-data" } });
}




export async function dodajZdjecieDoPozycji(ppozId: number, file: File): Promise<ZdjecieProtokolPoz>{
  const form = new FormData();
  form.append("file", file, file.name);
  const { data } = await api.post(`/zdjecia/pozycja/${ppozId}`, form, { headers: { "Content-Type": "multipart/form-data" } });
  return data;
}


export async function usunZdjecieZPozycji(zdjp_id:number){
  await api.delete(`/zdjecia/pozycja/${zdjp_id}`)
}