import type { OrdemServico, OrdemServicoStatus } from '../types';
import { db } from './db';

const recalcTotais = (os: OrdemServico): OrdemServico => {
  const totalServicos = os.servicos.reduce((acc, s) => acc + s.valor, 0);
  const totalPecas = os.pecas.reduce((acc, p) => acc + p.quantidade * p.valorUnitario, 0);
  const totalGeral = totalServicos + totalPecas - (os.desconto ?? 0);
  return { ...os, valorTotalServicos: totalServicos, valorTotalPecas: totalPecas, valorTotalGeral: totalGeral };
};

const isStatusConsuming = (status: OrdemServicoStatus) =>
  ['AguardandoAprovacao', 'EmExecucao', 'Pronto', 'Entregue'].includes(status);

const ajustarEstoque = (oldOS: OrdemServico | null, newOS: OrdemServico | null) => {
  const produtos = db.getProdutos();
  let alterado = false;

  const oldConsumes = oldOS ? isStatusConsuming(oldOS.status) : false;
  const newConsumes = newOS ? isStatusConsuming(newOS.status) : false;

  const ajustes: Record<string, number> = {};

  if (oldConsumes && !newConsumes && oldOS) {
    oldOS.pecas.forEach(p => {
      if (p.produtoId) {
        ajustes[p.produtoId] = (ajustes[p.produtoId] || 0) + p.quantidade;
      }
    });
  } else if (!oldConsumes && newConsumes && newOS) {
    newOS.pecas.forEach(p => {
      if (p.produtoId) {
        ajustes[p.produtoId] = (ajustes[p.produtoId] || 0) - p.quantidade;
      }
    });
  } else if (oldConsumes && newConsumes && oldOS && newOS) {
    oldOS.pecas.forEach(p => {
      if (p.produtoId) {
        ajustes[p.produtoId] = (ajustes[p.produtoId] || 0) + p.quantidade;
      }
    });
    newOS.pecas.forEach(p => {
      if (p.produtoId) {
        ajustes[p.produtoId] = (ajustes[p.produtoId] || 0) - p.quantidade;
      }
    });
  }

  const novosProdutos = produtos.map(prod => {
    const ajuste = ajustes[prod.id];
    if (ajuste) {
      alterado = true;
      return {
        ...prod,
        quantidadeEstoque: Math.max(0, prod.quantidadeEstoque + ajuste),
      };
    }
    return prod;
  });

  if (alterado) {
    db.saveProdutos(novosProdutos);
  }
};

export const osService = {
  getAll: async (): Promise<OrdemServico[]> => db.getOrdens(),

  getById: async (id: string): Promise<OrdemServico | undefined> =>
    db.getOrdens().find(o => o.id === id),

  getByMecanico: async (mecanicoId: string): Promise<OrdemServico[]> =>
    db.getOrdens().filter(o => o.mecanicoId === mecanicoId),

  getByStatus: async (status: OrdemServicoStatus): Promise<OrdemServico[]> =>
    db.getOrdens().filter(o => o.status === status),

  create: async (data: Omit<OrdemServico, 'id' | 'numeroOS' | 'valorTotalServicos' | 'valorTotalPecas' | 'valorTotalGeral'>): Promise<OrdemServico> => {
    const ordens = db.getOrdens();
    const numeracao = String(ordens.length + 1).padStart(4, '0');
    const ano = new Date().getFullYear();
    const base: OrdemServico = {
      id: db.uid(),
      numeroOS: `OS-${ano}-${numeracao}`,
      valorTotalServicos: 0,
      valorTotalPecas: 0,
      valorTotalGeral: 0,
      ...data,
    };
    const nova = recalcTotais(base);
    db.saveOrdens([...ordens, nova]);
    ajustarEstoque(null, nova);
    return nova;
  },

  update: async (id: string, data: Partial<Omit<OrdemServico, 'id' | 'numeroOS'>>): Promise<OrdemServico> => {
    let nova!: OrdemServico;
    const velha = db.getOrdens().find(o => o.id === id)!;
    const lista = db.getOrdens().map(o => {
      if (o.id !== id) return o;
      nova = recalcTotais({ ...o, ...data });
      return nova;
    });
    db.saveOrdens(lista);
    ajustarEstoque(velha, nova);
    return nova;
  },

  updateStatus: async (id: string, status: OrdemServicoStatus): Promise<OrdemServico> => {
    const velha = db.getOrdens().find(o => o.id === id)!;
    const agora = new Date().toISOString();
    const extras: Partial<OrdemServico> = { status };
    if (status === 'EmExecucao') extras.dataAprovacao = agora;
    if (status === 'Pronto') extras.dataConclusao = agora;
    if (status === 'Entregue') extras.dataSaida = agora;

    let nova!: OrdemServico;
    const lista = db.getOrdens().map(o => {
      if (o.id !== id) return o;
      nova = { ...o, ...extras };
      return nova;
    });
    db.saveOrdens(lista);
    ajustarEstoque(velha, nova);
    return nova;
  },

  delete: async (id: string): Promise<void> => {
    const velha = db.getOrdens().find(o => o.id === id);
    if (velha) {
      db.saveOrdens(db.getOrdens().filter(o => o.id !== id));
      ajustarEstoque(velha, null);
    }
  },

  /** Helper: faturamento total de OS com status Entregue */
  getFaturamentoMes: (): number => {
    const mesAtual = new Date().getMonth();
    const anoAtual = new Date().getFullYear();
    return db
      .getOrdens()
      .filter(o => {
        if (o.status !== 'Entregue' || !o.dataSaida) return false;
        const d = new Date(o.dataSaida);
        return d.getMonth() === mesAtual && d.getFullYear() === anoAtual;
      })
      .reduce((acc, o) => acc + o.valorTotalGeral, 0);
  },
};

