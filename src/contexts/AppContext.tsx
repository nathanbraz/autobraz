import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';
import type { Cliente, Veiculo, Mecanico, OrdemServico, Produto } from '../types';
import { clienteService } from '../services/clienteService';
import { carroService } from '../services/carroService';
import { mecanicoService } from '../services/mecanicoService';
import { osService } from '../services/osService';
import { produtoService } from '../services/produtoService';

interface AppContextType {
  clientes: Cliente[];
  veiculos: Veiculo[];
  mecanicos: Mecanico[];
  ordens: OrdemServico[];
  produtos: Produto[];
  refreshClientes: () => Promise<void>;
  refreshVeiculos: () => Promise<void>;
  refreshMecanicos: () => Promise<void>;
  refreshOrdens: () => Promise<void>;
  refreshProdutos: () => Promise<void>;
  refreshAll: () => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [veiculos, setVeiculos] = useState<Veiculo[]>([]);
  const [mecanicos, setMecanicos] = useState<Mecanico[]>([]);
  const [ordens, setOrdens] = useState<OrdemServico[]>([]);
  const [produtos, setProdutos] = useState<Produto[]>([]);

  const refreshClientes = useCallback(async () => {
    setClientes(await clienteService.getAll());
  }, []);

  const refreshVeiculos = useCallback(async () => {
    setVeiculos(await carroService.getAll());
  }, []);

  const refreshMecanicos = useCallback(async () => {
    setMecanicos(await mecanicoService.getAll());
  }, []);

  const refreshOrdens = useCallback(async () => {
    setOrdens(await osService.getAll());
  }, []);

  const refreshProdutos = useCallback(async () => {
    setProdutos(await produtoService.getAll());
  }, []);

  const refreshAll = useCallback(async () => {
    await Promise.all([
      refreshClientes(),
      refreshVeiculos(),
      refreshMecanicos(),
      refreshOrdens(),
      refreshProdutos(),
    ]);
  }, [refreshClientes, refreshVeiculos, refreshMecanicos, refreshOrdens, refreshProdutos]);

  return (
    <AppContext.Provider value={{
      clientes,
      veiculos,
      mecanicos,
      ordens,
      produtos,
      refreshClientes,
      refreshVeiculos,
      refreshMecanicos,
      refreshOrdens,
      refreshProdutos,
      refreshAll
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be inside AppProvider');
  return ctx;
}

