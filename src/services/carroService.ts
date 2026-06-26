import type { Veiculo } from '../types';
import { db } from './db';

export const carroService = {
  getAll: async (): Promise<Veiculo[]> => db.getVeiculos(),

  getByCliente: async (clienteId: string): Promise<Veiculo[]> =>
    db.getVeiculos().filter(v => v.clienteId === clienteId),

  getById: async (id: string): Promise<Veiculo | undefined> =>
    db.getVeiculos().find(v => v.id === id),

  create: async (data: Omit<Veiculo, 'id'>): Promise<Veiculo> => {
    const novo: Veiculo = { id: db.uid(), ...data };
    db.saveVeiculos([...db.getVeiculos(), novo]);
    return novo;
  },

  update: async (id: string, data: Partial<Omit<Veiculo, 'id'>>): Promise<Veiculo> => {
    const lista = db.getVeiculos().map(v => (v.id === id ? { ...v, ...data } : v));
    db.saveVeiculos(lista);
    return lista.find(v => v.id === id)!;
  },

  delete: async (id: string): Promise<void> => {
    db.saveVeiculos(db.getVeiculos().filter(v => v.id !== id));
  },
};
