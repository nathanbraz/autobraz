import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import type { Usuario } from '../types';
import { authService } from '../services/authService';

interface AuthContextType {
  usuario: Usuario | null;
  loading: boolean;
  login: (email: string, senha: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Restore session on page reload
    const session = authService.getSession();
    setUsuario(session);
    setLoading(false);
  }, []);

  const login = async (email: string, senha: string) => {
    const result = await authService.login(email, senha);
    if (result.success && result.usuario) {
      setUsuario(result.usuario);
    }
    return { success: result.success, error: result.error };
  };

  const logout = () => {
    authService.logout();
    setUsuario(null);
  };

  return (
    <AuthContext.Provider value={{ usuario, loading, login, logout, isAdmin: usuario?.role === 'admin' }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be inside AuthProvider');
  return ctx;
}
