import { api } from "./client";
import { User } from "../types/authTypes"
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

export async function logout(): Promise<Response> {
  const { data } = await api.post(`/auth/logout`);
  return data as Response;
}

export async function getCurrentUser(): Promise<User> {
  const { data } = await api.get(`/auth/me`);
  return data.message as User;
}