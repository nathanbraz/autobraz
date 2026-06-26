import type { Usuario } from '../types';
import { db } from './db';

interface LoginResult {
  success: boolean;
  usuario?: Usuario;
  error?: string;
}

// Fake password map for development (email -> password)
const CREDENTIALS: Record<string, string> = {
  'admin@autobraz.com': 'admin123',
  'joao@autobraz.com': 'mecanico123',
  'carlos@autobraz.com': 'mecanico123',
};

export const authService = {
  login: async (email: string, senha: string): Promise<LoginResult> => {
    // Simulate network delay
    await new Promise(res => setTimeout(res, 500));

    const expected = CREDENTIALS[email.toLowerCase()];
    if (!expected || expected !== senha) {
      return { success: false, error: 'E-mail ou senha incorretos.' };
    }

    const usuario = db.usuarios.find(u => u.email === email.toLowerCase());
    if (!usuario) return { success: false, error: 'Usuário não encontrado.' };

    // Persist session
    sessionStorage.setItem('autobraz_user', JSON.stringify(usuario));
    return { success: true, usuario };
  },

  logout: () => {
    sessionStorage.removeItem('autobraz_user');
  },

  getSession: (): Usuario | null => {
    const raw = sessionStorage.getItem('autobraz_user');
    return raw ? (JSON.parse(raw) as Usuario) : null;
  },
};
