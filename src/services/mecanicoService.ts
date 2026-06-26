import type { Mecanico } from '../types';
import { db } from './db';

export const mecanicoService = {
  getAll: async (): Promise<Mecanico[]> => db.getMecanicos(),

  getAtivos: async (): Promise<Mecanico[]> =>
    db.getMecanicos().filter(m => m.ativo),

  getById: async (id: string): Promise<Mecanico | undefined> =>
    db.getMecanicos().find(m => m.id === id),

  create: async (data: Omit<Mecanico, 'id'>): Promise<Mecanico> => {
    const novo: Mecanico = { id: db.uid(), ...data };
    db.saveMecanicos([...db.getMecanicos(), novo]);
    return novo;
  },

  update: async (id: string, data: Partial<Omit<Mecanico, 'id'>>): Promise<Mecanico> => {
    const lista = db.getMecanicos().map(m => (m.id === id ? { ...m, ...data } : m));
    db.saveMecanicos(lista);
    return lista.find(m => m.id === id)!;
  },

  delete: async (id: string): Promise<void> => {
    db.saveMecanicos(db.getMecanicos().filter(m => m.id !== id));
  },
};
