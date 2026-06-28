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

const GENERATED_CLIENTES: Cliente[] = [];
const firstNames = ['Carlos', 'Ana', 'Bruno', 'Daniela', 'Eduardo', 'Fernanda', 'Gabriel', 'Helena', 'Igor', 'Julia', 'Lucas', 'Mariana', 'Otávio', 'Patrícia', 'Ricardo', 'Sofia', 'Thiago', 'Beatriz', 'Felipe', 'Camila'];
const lastNames = ['Silva', 'Santos', 'Oliveira', 'Souza', 'Rodrigues', 'Ferreira', 'Alves', 'Pereira', 'Lima', 'Gomes', 'Costa', 'Ribeiro', 'Martins', 'Carvalho', 'Almeida', 'Lopes', 'Soares', 'Dias', 'Vieira', 'Barbosa'];
const cities = ['São Paulo', 'Rio de Janeiro', 'Belo Horizonte', 'Curitiba', 'Porto Alegre', 'Salvador', 'Recife', 'Fortaleza', 'Brasília', 'Campinas'];
const neighborhoods = ['Centro', 'Bela Vista', 'Jardins', 'Vila Mariana', 'Pinheiros', 'Lapa', 'Moema', 'Itaim Bibi', 'Santana', 'Morumbi'];

for (let i = 1; i <= 94; i++) {
  const name = `${firstNames[i % firstNames.length]} ${lastNames[(i * 3) % lastNames.length]} ${lastNames[(i * 7) % lastNames.length]}`;
  const phone = `(11) 9${Math.floor(1000 + Math.random() * 9000)}-${Math.floor(1000 + Math.random() * 9000)}`;
  const cpf = `${Math.floor(100 + Math.random() * 900)}.${Math.floor(100 + Math.random() * 900)}.${Math.floor(100 + Math.random() * 900)}-${Math.floor(10 + Math.random() * 90)}`;
  GENERATED_CLIENTES.push({
    id: `c_gen_${i}`,
    nome: name,
    telefone: phone,
    whatsapp: Math.random() > 0.3,
    email: `${name.toLowerCase().replace(/\s+/g, '.').normalize('NFD').replace(/[\u0300-\u036f]/g, '')}@email.com`,
    documento: cpf,
    endereco: {
      rua: `Rua das Palmeiras, nº ${10 + i}`,
      numero: String(100 + i * 3),
      bairro: neighborhoods[i % neighborhoods.length],
      cidade: cities[i % cities.length],
      cep: `${Math.floor(10000 + Math.random() * 80000)}-000`
    }
  });
}

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
  {
    id: 'c4', nome: 'Aline Ferreira', telefone: '(31) 98888-7777', whatsapp: true,
    email: 'aline@email.com', documento: '111.222.333-44',
    endereco: { rua: 'Rua da Bahia', numero: '1020', bairro: 'Lourdes', cidade: 'Belo Horizonte', cep: '30160-011' },
  },
  {
    id: 'c5', nome: 'Thiago Barbosa', telefone: '(41) 99999-8888', whatsapp: true,
    email: 'thiago@email.com', documento: '555.666.777-88',
    endereco: { rua: 'Av. Sete de Setembro', numero: '4500', bairro: 'Batel', cidade: 'Curitiba', cep: '80240-000' },
  },
  {
    id: 'c6', nome: 'Juliana Lima', telefone: '(81) 97777-6666', whatsapp: true,
    email: 'juliana@email.com', documento: '999.888.777-66',
    endereco: { rua: 'Rua do Sol', numero: '15', bairro: 'Boa Vista', cidade: 'Recife', cep: '50060-000' },
  },
  ...GENERATED_CLIENTES
];

const SEED_VEICULOS: Veiculo[] = [
  { id: 'v1', placa: 'ABC-1234', marca: 'Toyota', modelo: 'Corolla', anoFabricacao: 2020, anoModelo: 2021, cor: 'Prata', clienteId: 'c1', fotos: ['/images/corolla.png'] },
  { id: 'v2', placa: 'DEF-5678', marca: 'Honda', modelo: 'Civic', anoFabricacao: 2019, anoModelo: 2020, cor: 'Preto', clienteId: 'c1', fotos: ['/images/civic.png'] },
  { id: 'v3', placa: 'GHI-9012', marca: 'Chevrolet', modelo: 'Onix', anoFabricacao: 2022, anoModelo: 2022, cor: 'Branco', clienteId: 'c2', fotos: ['/images/onix.png'] },
  { id: 'v4', placa: 'BRA0J19', marca: 'Volkswagen', modelo: 'Golf', anoFabricacao: 2021, anoModelo: 2022, cor: 'Azul', clienteId: 'c3', fotos: ['/images/golf.png'] },
  { id: 'v5', placa: 'JKL-3456', marca: 'Hyundai', modelo: 'HB20', anoFabricacao: 2018, anoModelo: 2019, cor: 'Cinza', clienteId: 'c4', fotos: [] },
  { id: 'v6', placa: 'MNO-7890', marca: 'Fiat', modelo: 'Uno', anoFabricacao: 2015, anoModelo: 2016, cor: 'Vermelho', clienteId: 'c5', fotos: [] },
  { id: 'v7', placa: 'PQR-1234', marca: 'Ford', modelo: 'Ka', anoFabricacao: 2017, anoModelo: 2018, cor: 'Prata', clienteId: 'c6', fotos: [] },
  { id: 'v8', placa: 'STU-5678', marca: 'Jeep', modelo: 'Compass', anoFabricacao: 2021, anoModelo: 2021, cor: 'Cinza Escuro', clienteId: 'c2', fotos: [] },
];

const SEED_MECANICOS: Mecanico[] = [
  { id: 'm1', nome: 'João Silva', especialidade: 'Motor e Transmissão', ativo: true },
  { id: 'm2', nome: 'Carlos Pereira', especialidade: 'Elétrica Automotiva', ativo: true },
  { id: 'm3', nome: 'André Ramos', especialidade: 'Suspensão e Freios', ativo: true },
  { id: 'm4', nome: 'Marcos Lima', especialidade: 'Ar-condicionado', ativo: false },
  { id: 'm5', nome: 'Roberto Melo', especialidade: 'Alinhamento e Balanceamento', ativo: true },
];

const SEED_PRODUTOS: Produto[] = [
  { id: 'p1', codigo: 'FO-BOS-01', nome: 'Filtro de Óleo Bosch', precoVenda: 45.00, quantidadeEstoque: 15, marca: 'Bosch' },
  { id: 'p2', codigo: 'KP-FRE-C1', nome: 'Kit Pastilha de Freio Bosch', precoVenda: 180.00, quantidadeEstoque: 8, marca: 'Bosch' },
  { id: 'p3', codigo: 'OL-MOB-5W3', nome: 'Óleo Mobil 5W30 1L', precoVenda: 38.00, quantidadeEstoque: 50, marca: 'Mobil' },
  { id: 'p4', codigo: 'LA-PHI-H7', nome: 'Lâmpada Farol H7 Philips', precoVenda: 60.00, quantidadeEstoque: 20, marca: 'Philips' },
  { id: 'p5', codigo: 'AD-PAR-R1', nome: 'Aditivo Radiador Paraflu 1L', precoVenda: 28.00, quantidadeEstoque: 30, marca: 'Paraflu' },
  { id: 'p6', codigo: 'PA-DYN-18', nome: 'Palheta Limpador Dyna 18"', precoVenda: 35.00, quantidadeEstoque: 12, marca: 'Dyna' },
  { id: 'p7', codigo: 'AM-NAK-TRD', nome: 'Amortecedor Dianteiro Cofap', precoVenda: 320.00, quantidadeEstoque: 6, marca: 'Cofap' },
  { id: 'p8', codigo: 'VL-NGK-IRB', nome: 'Vela de Ignição NGK Iridium', precoVenda: 55.00, quantidadeEstoque: 24, marca: 'NGK' },
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
      { id: uid(), descricao: 'Óleo Mobil 5W30 5L', quantidade: 5, valorUnitario: 38 },
      { id: uid(), descricao: 'Filtro de óleo Bosch', quantidade: 1, valorUnitario: 45 },
    ],
    desconto: 20, valorTotalServicos: 230, valorTotalPecas: 235, valorTotalGeral: 445,
    status: 'AguardandoAprovacao', dataEntrada: '2026-06-24T10:00:00',
    observacoes: 'Cliente pediu para avisar antes de iniciar serviço.',
  },
  {
    id: 'os4', numeroOS: 'OS-2026-0004', clienteId: 'c4', veiculoId: 'v5', mecanicoId: 'm3',
    quilometragemEntrada: 89000, nivelCombustivel: '1/4',
    checklist: { estepe: true, macaco: true, chaveRoda: true, radio: false, riscosAmassados: 'Parachoque dianteiro trincado' },
    reclamacaoCliente: 'Amortecedor estourado batendo muito', diagnosticoTecnico: 'Amortecedor dianteiro direito com vazamento',
    servicos: [{ id: uid(), descricao: 'Troca de amortecedores dianteiros', valor: 250, horas: 3 }],
    pecas: [{ id: uid(), descricao: 'Amortecedor Dianteiro Cofap (Par)', quantidade: 2, valorUnitario: 320 }],
    desconto: 50, valorTotalServicos: 250, valorTotalPecas: 640, valorTotalGeral: 840,
    status: 'EmExecucao', dataEntrada: '2026-06-25T11:00:00',
    observacoes: 'Substituir kit coxim e coifa também.',
  },
  {
    id: 'os5', numeroOS: 'OS-2026-0005', clienteId: 'c5', veiculoId: 'v6', mecanicoId: 'm5',
    quilometragemEntrada: 150000, nivelCombustivel: 'Reserva',
    checklist: { estepe: false, macaco: false, chaveRoda: false, radio: true, riscosAmassados: 'Lataria com bastante amassados de uso' },
    reclamacaoCliente: 'Alinhar direção e balancear rodas', diagnosticoTecnico: 'Desgaste irregular dos pneus, necessário alinhar e balancear',
    servicos: [{ id: uid(), descricao: 'Alinhamento 3D + Balanceamento', valor: 120, horas: 1.5 }],
    pecas: [],
    desconto: 10, valorTotalServicos: 120, valorTotalPecas: 0, valorTotalGeral: 110,
    status: 'Vistoria', dataEntrada: '2026-06-26T14:20:00',
    observacoes: 'Fazer rodízio de pneus também.',
  },
  {
    id: 'os6', numeroOS: 'OS-2026-0006', clienteId: 'c6', veiculoId: 'v7',
    quilometragemEntrada: 67000, nivelCombustivel: '1/2',
    checklist: { estepe: true, macaco: true, chaveRoda: true, radio: true, riscosAmassados: '' },
    reclamacaoCliente: 'Dificuldade de dar partida de manhã', diagnosticoTecnico: 'Velas de ignição desgastadas e bicos sujos',
    servicos: [
      { id: uid(), descricao: 'Limpeza de bicos injetores', valor: 120, horas: 1.5 },
      { id: uid(), descricao: 'Troca de velas de ignição', valor: 60, horas: 0.8 },
    ],
    pecas: [{ id: uid(), descricao: 'Vela de Ignição NGK Iridium', quantidade: 4, valorUnitario: 55 }],
    desconto: 0, valorTotalServicos: 180, valorTotalPecas: 220, valorTotalGeral: 400,
    status: 'Orcamento', dataEntrada: '2026-06-27T08:00:00',
    observacoes: '',
  },
  {
    id: 'os7', numeroOS: 'OS-2026-0007', clienteId: 'c1', veiculoId: 'v2', mecanicoId: 'm3',
    quilometragemEntrada: 52100, nivelCombustivel: '3/4',
    checklist: { estepe: true, macaco: true, chaveRoda: true, radio: true, riscosAmassados: 'Porta traseira direita riscada' },
    reclamacaoCliente: 'Luz da injeção acesa no painel', diagnosticoTecnico: 'Falha na sonda lambda',
    servicos: [{ id: uid(), descricao: 'Diagnóstico por scanner + Troca de Sonda', valor: 180, horas: 1.5 }],
    pecas: [{ id: uid(), descricao: 'Sonda Lambda Bosch', quantidade: 1, valorUnitario: 350 }],
    desconto: 0, valorTotalServicos: 180, valorTotalPecas: 350, valorTotalGeral: 530,
    status: 'Entregue', dataEntrada: '2026-06-15T09:15:00', dataConclusao: '2026-06-16T17:30:00',
    observacoes: 'Pago em PIX.',
  },
  {
    id: 'os8', numeroOS: 'OS-2026-0008', clienteId: 'c2', veiculoId: 'v8', mecanicoId: 'm1',
    quilometragemEntrada: 35000, nivelCombustivel: '1/2',
    checklist: { estepe: true, macaco: true, chaveRoda: true, radio: true, riscosAmassados: '' },
    reclamacaoCliente: 'Barulho na suspensão dianteira esquerda', diagnosticoTecnico: 'Bieleta da barra estabilizadora quebrada',
    servicos: [{ id: uid(), descricao: 'Troca de bieletas estabilizadoras', valor: 90, horas: 1 }],
    pecas: [{ id: uid(), descricao: 'Bieleta Dianteira Cofap (Par)', quantidade: 1, valorUnitario: 140 }],
    desconto: 10, valorTotalServicos: 90, valorTotalPecas: 140, valorTotalGeral: 220,
    status: 'Cancelado', dataEntrada: '2026-06-18T10:00:00',
    observacoes: 'Cliente desistiu do reparo por motivos pessoais.',
  },
  {
    id: 'os9', numeroOS: 'OS-2026-0009', clienteId: 'c3', veiculoId: 'v4', mecanicoId: 'm2',
    quilometragemEntrada: 13500, nivelCombustivel: '3/4',
    checklist: { estepe: true, macaco: true, chaveRoda: true, radio: true, riscosAmassados: '' },
    reclamacaoCliente: 'Farol dianteiro direito queimado', diagnosticoTecnico: 'Lâmpada H7 queimada',
    servicos: [{ id: uid(), descricao: 'Troca de lâmpada de farol', valor: 30, horas: 0.3 }],
    pecas: [{ id: uid(), descricao: 'Lâmpada Farol H7 Philips', quantidade: 1, valorUnitario: 60 }],
    desconto: 0, valorTotalServicos: 30, valorTotalPecas: 60, valorTotalGeral: 90,
    status: 'Pronto', dataEntrada: '2026-06-27T15:00:00',
    observacoes: 'Aguardando cliente vir retirar.',
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
