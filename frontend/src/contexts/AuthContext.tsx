import React, { 
  createContext, 
  useState, 
  useContext, 
  useEffect, 
  ReactNode 
} from 'react';
import { tryLogin, logout, getCurrentUser } from '../api/auth'; // Twoje otypowane API (np. Axios)
import { User, AuthContextType } from '../types/authTypes';



const defaultAuthContextValue: AuthContextType = {
  user: null,
  isAuthenticated: false,
  isLoading: true, 
  login: async () => {},
  logout: async () => {},
};

const AuthContext = createContext<AuthContextType>(defaultAuthContextValue);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const response = await getCurrentUser(); 
      
      setUser(response);
      setIsAuthenticated(true);
    } catch (error) {
      setUser(null);
      setIsAuthenticated(false);
    } finally {
      setIsLoading(false);
    }
  };


  const login = async (login: string, pwd: string) => {
    try {
      await tryLogin(login, pwd);
      await checkAuthStatus(); 
    } catch (error) {
      console.error("Błąd logowania:", error);
      throw error;
    }
  };


  const logout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error("Błąd wylogowania:", error);
    } finally {
      setUser(null);
      setIsAuthenticated(false);
    }
  };

  return (
    <AuthContext.Provider 
      value={{ 
        user, 
        isAuthenticated, 
        isLoading, 
        login, 
        logout 
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};


export const useAuth = (): AuthContextType => {
  return useContext(AuthContext);
};