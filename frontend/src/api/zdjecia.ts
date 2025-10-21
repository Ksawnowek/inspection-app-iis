import { api } from "./client";

export async function dodajZdjecie(parentPpozId: number, file: File) {
  const form = new FormData();
  form.append("parent_ppoz_id", String(parentPpozId));
  form.append("file", file);
  await api.post("/zdjecia", form, { headers: { "Content-Type": "multipart/form-data" } });
}
