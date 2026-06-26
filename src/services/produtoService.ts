import type { Produto } from '../types';
import { db } from './db';

export const produtoService = {
  getAll: async (): Promise<Produto[]> => db.getProdutos(),

  getById: async (id: string): Promise<Produto | undefined> =>
    db.getProdutos().find(p => p.id === id),

  create: async (data: Omit<Produto, 'id'>): Promise<Produto> => {
    const novo: Produto = { id: db.uid(), ...data };
    db.saveProdutos([...db.getProdutos(), novo]);
    return novo;
  },

  update: async (id: string, data: Partial<Omit<Produto, 'id'>>): Promise<Produto> => {
    const lista = db.getProdutos().map(p => (p.id === id ? { ...p, ...data } : p));
    db.saveProdutos(lista);
    return lista.find(p => p.id === id)!;
  },

  delete: async (id: string): Promise<void> => {
    db.saveProdutos(db.getProdutos().filter(p => p.id !== id));
  },
};
