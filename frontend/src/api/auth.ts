import { api } from "./client";


export async function tryLogin(
  login: string,
  pwd: string
): Promise<string> {
  const { data } = await api.post(
    `/auth/login`, 
    { login, pwd }
  );
  return data as string;
}