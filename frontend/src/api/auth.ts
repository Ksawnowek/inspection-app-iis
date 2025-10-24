import { api } from "./client";

interface Response {
  status: string;
  message: string;
}

export async function tryLogin(
  login: string,
  pwd: string
): Promise<Response> {
  const { data } = await api.post(
    `/auth/login`, 
    { login, pwd }
  );
  return data as Response;
}



export async function tryRegister(
  login: string,
  name: string,
  surname: string,
  pwd: string,
  role: number
): Promise<Response> {
  const { data } = await api.post(
    `/auth/register`, 
    { login, name, surname, pwd, role }
  );
  return data as Response;
}