export interface User {
  login: string;
  name: string;
  surname: string;
  role: 'Serwisant' | 'Kierownik';
}


export interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (login: string, pwd: string) => Promise<void>;
  logout: () => Promise<void>;
}