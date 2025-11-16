import { api } from "./client";
import { Uzytkownik } from "../types"
import { UserUpdatePayload } from "../components/modals/UserEditModal";


export async function getUsers(): Promise<Uzytkownik[]> {
  const { data } = await api.get<Uzytkownik[]>(`/users`);
  return data;
}

export async function patchUser(uzt_id: number, updateData:UserUpdatePayload): Promise<Uzytkownik> {
    const { data } = await api.patch(`/users/${uzt_id}`, updateData)
    return data;
}