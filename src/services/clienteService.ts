import type { Cliente } from '../types';
import { db } from './db';

export const clienteService = {
  getAll: async (): Promise<Cliente[]> => db.getClientes(),

  getById: async (id: string): Promise<Cliente | undefined> =>
    db.getClientes().find(c => c.id === id),

  create: async (data: Omit<Cliente, 'id'>): Promise<Cliente> => {
    const novo: Cliente = { id: db.uid(), ...data };
    const lista = db.getClientes();
    db.saveClientes([...lista, novo]);
    return novo;
  },

  update: async (id: string, data: Partial<Omit<Cliente, 'id'>>): Promise<Cliente> => {
    const lista = db.getClientes().map(c => (c.id === id ? { ...c, ...data } : c));
    db.saveClientes(lista);
    return lista.find(c => c.id === id)!;
  },

  delete: async (id: string): Promise<void> => {
    db.saveClientes(db.getClientes().filter(c => c.id !== id));
  },
};
