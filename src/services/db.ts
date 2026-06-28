import type {
  Cliente,
  Veiculo,
  Mecanico,
  OrdemServico,
  Usuario,
  Produto,
} from '../types';


// ─── helpers ─────────────────────────────────────────────────────────────────
const uid = () => Math.random().toString(36).slice(2, 9);

// ─── Seed data ───────────────────────────────────────────────────────────────
const SEED_USUARIOS: Usuario[] = [
  { id: 'u1', nome: 'Administrador', email: 'admin@autobraz.com', role: 'admin' },
  { id: 'u2', nome: 'João Mecânico', email: 'joao@autobraz.com', role: 'mecanico' },
  { id: 'u3', nome: 'Carlos Técnico', email: 'carlos@autobraz.com', role: 'mecanico' },
];

const SEED_CLIENTES: Cliente[] = [
  {
    id: 'c1', nome: 'Rafael Oliveira', telefone: '(11) 98765-4321', whatsapp: true,
    email: 'rafael@email.com', documento: '123.456.789-00',
    endereco: { rua: 'Rua das Flores', numero: '123', bairro: 'Centro', cidade: 'São Paulo', cep: '01310-100' },
  },
  {
    id: 'c2', nome: 'Mariana Costa', telefone: '(21) 91234-5678', whatsapp: true,
    email: 'mariana@email.com', documento: '987.654.321-00',
    endereco: { rua: 'Av. Paulista', numero: '900', bairro: 'Bela Vista', cidade: 'São Paulo', cep: '01310-200' },
  },
  {
    id: 'c3', nome: 'Pedro Santos', telefone: '(11) 97654-3210', whatsapp: false,
    email: 'pedro@email.com', documento: '456.789.123-00',
    endereco: { rua: 'Rua Augusta', numero: '500', bairro: 'Consolação', cidade: 'São Paulo', cep: '01305-000' },
  },
];

const SEED_VEICULOS: Veiculo[] = [
  { id: 'v1', placa: 'ABC-1234', marca: 'Toyota', modelo: 'Corolla', anoFabricacao: 2020, anoModelo: 2021, cor: 'Prata', clienteId: 'c1', fotos: ['/images/corolla.png'] },
  { id: 'v2', placa: 'DEF-5678', marca: 'Honda', modelo: 'Civic', anoFabricacao: 2019, anoModelo: 2020, cor: 'Preto', clienteId: 'c1', fotos: ['/images/civic.png'] },
  { id: 'v3', placa: 'GHI-9012', marca: 'Chevrolet', modelo: 'Onix', anoFabricacao: 2022, anoModelo: 2022, cor: 'Branco', clienteId: 'c2', fotos: ['/images/onix.png'] },
  { id: 'v4', placa: 'BRA0J19', marca: 'Volkswagen', modelo: 'Golf', anoFabricacao: 2021, anoModelo: 2022, cor: 'Azul', clienteId: 'c3', fotos: ['/images/golf.png'] },
];

const SEED_MECANICOS: Mecanico[] = [
  { id: 'm1', nome: 'João Silva', especialidade: 'Motor e Transmissão', ativo: true },
  { id: 'm2', nome: 'Carlos Pereira', especialidade: 'Elétrica Automotiva', ativo: true },
  { id: 'm3', nome: 'André Ramos', especialidade: 'Suspensão e Freios', ativo: true },
  { id: 'm4', nome: 'Marcos Lima', especialidade: 'Ar-condicionado', ativo: false },
];

const SEED_PRODUTOS: Produto[] = [
  { id: 'p1', codigo: 'FO-BOS-01', nome: 'Filtro de Óleo Bosch', precoVenda: 45.00, quantidadeEstoque: 15, marca: 'Bosch' },
  { id: 'p2', codigo: 'KP-FRE-C1', nome: 'Kit Pastilha de Freio Bosch', precoVenda: 180.00, quantidadeEstoque: 8, marca: 'Bosch' },
  { id: 'p3', codigo: 'OL-MOB-5W3', nome: 'Óleo Mobil 5W30 1L', precoVenda: 38.00, quantidadeEstoque: 50, marca: 'Mobil' },
  { id: 'p4', codigo: 'LA-PHI-H7', nome: 'Lâmpada Farol H7 Philips', precoVenda: 60.00, quantidadeEstoque: 20, marca: 'Philips' },
  { id: 'p5', codigo: 'AD-PAR-R1', nome: 'Aditivo Radiador Paraflu 1L', precoVenda: 28.00, quantidadeEstoque: 30, marca: 'Paraflu' },
  { id: 'p6', codigo: 'PA-DYN-18', nome: 'Palheta Limpador Dyna 18"', precoVenda: 35.00, quantidadeEstoque: 12, marca: 'Dyna' },
];


const SEED_OS: OrdemServico[] = [
  {
    id: 'os1', numeroOS: 'OS-2026-0001', clienteId: 'c1', veiculoId: 'v1', mecanicoId: 'm1',
    quilometragemEntrada: 45200, nivelCombustivel: '1/2',
    checklist: { estepe: true, macaco: true, chaveRoda: true, radio: false, riscosAmassados: 'Pequeno arranhão na porta dianteira esquerda' },
    reclamacaoCliente: 'Carro fazendo barulho estranho ao frear', diagnosticoTecnico: 'Pastilhas de freio desgastadas',
    servicos: [{ id: uid(), descricao: 'Troca de pastilhas de freio dianteiras', valor: 150, horas: 2 }],
    pecas: [{ id: uid(), descricao: 'Kit pastilhas Bosch', quantidade: 1, valorUnitario: 180 }],
    desconto: 0, valorTotalServicos: 150, valorTotalPecas: 180, valorTotalGeral: 330,
    status: 'Pronto', dataEntrada: '2026-06-20T08:30:00', dataConclusao: '2026-06-22T16:00:00',
    observacoes: 'Verificar também o disco de freio traseiro na próxima revisão.',
    fotos: ['/images/corolla.png'],
  },
  {
    id: 'os2', numeroOS: 'OS-2026-0002', clienteId: 'c2', veiculoId: 'v3', mecanicoId: 'm2',
    quilometragemEntrada: 28000, nivelCombustivel: '3/4',
    checklist: { estepe: true, macaco: false, chaveRoda: true, radio: true, riscosAmassados: '' },
    reclamacaoCliente: 'Ar-condicionado não está gelando', diagnosticoTecnico: 'Carga de gás insuficiente no sistema',
    servicos: [{ id: uid(), descricao: 'Recarga de gás R134a', valor: 200, horas: 1 }],
    pecas: [],
    desconto: 0, valorTotalServicos: 200, valorTotalPecas: 0, valorTotalGeral: 200,
    status: 'EmExecucao', dataEntrada: '2026-06-23T09:00:00',
    observacoes: '',
  },
  {
    id: 'os3', numeroOS: 'OS-2026-0003', clienteId: 'c3', veiculoId: 'v4',
    quilometragemEntrada: 12000, nivelCombustivel: 'Cheio',
    checklist: { estepe: true, macaco: true, chaveRoda: true, radio: true, riscosAmassados: '' },
    reclamacaoCliente: 'Revisão geral dos 10.000 km', diagnosticoTecnico: 'Troca de óleo, filtro e verificação geral',
    servicos: [
      { id: uid(), descricao: 'Troca de óleo', valor: 80, horas: 0.5 },
      { id: uid(), descricao: 'Revisão completa', valor: 150, horas: 2 },
    ],
    pecas: [
      { id: uid(), descricao: 'Óleo Mobil 5W30 5L', quantidade: 1, valorUnitario: 120 },
      { id: uid(), descricao: 'Filtro de óleo', quantidade: 1, valorUnitario: 35 },
    ],
    desconto: 20, valorTotalServicos: 230, valorTotalPecas: 155, valorTotalGeral: 365,
    status: 'AguardandoAprovacao', dataEntrada: '2026-06-24T10:00:00',
    observacoes: 'Cliente pediu para avisar antes de iniciar serviço.',
  },
];

// ─── Storage keys ─────────────────────────────────────────────────────────────
const KEYS = {
  clientes: 'autobraz_clientes',
  veiculos: 'autobraz_veiculos',
  mecanicos: 'autobraz_mecanicos',
  ordens: 'autobraz_ordens',
  produtos: 'autobraz_produtos',
};

function readOrSeed<T>(key: string, seed: T[]): T[] {
  const raw = localStorage.getItem(key);
  if (raw) return JSON.parse(raw) as T[];
  localStorage.setItem(key, JSON.stringify(seed));
  return seed;
}

function save<T>(key: string, data: T[]): void {
  localStorage.setItem(key, JSON.stringify(data));
}

// ─── Public API ───────────────────────────────────────────────────────────────
export const db = {
  uid,

  usuarios: SEED_USUARIOS,

  getClientes: (): Cliente[] => readOrSeed(KEYS.clientes, SEED_CLIENTES),
  saveClientes: (data: Cliente[]) => save(KEYS.clientes, data),

  getVeiculos: (): Veiculo[] => readOrSeed(KEYS.veiculos, SEED_VEICULOS),
  saveVeiculos: (data: Veiculo[]) => save(KEYS.veiculos, data),

  getMecanicos: (): Mecanico[] => readOrSeed(KEYS.mecanicos, SEED_MECANICOS),
  saveMecanicos: (data: Mecanico[]) => save(KEYS.mecanicos, data),

  getOrdens: (): OrdemServico[] => readOrSeed(KEYS.ordens, SEED_OS),
  saveOrdens: (data: OrdemServico[]) => save(KEYS.ordens, data),

  getProdutos: (): Produto[] => readOrSeed(KEYS.produtos, SEED_PRODUTOS),
  saveProdutos: (data: Produto[]) => save(KEYS.produtos, data),

  resetAll: () => {
    Object.values(KEYS).forEach(k => localStorage.removeItem(k));
  },
};
