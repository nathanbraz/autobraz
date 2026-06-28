export interface Usuario {
  id: string;
  nome: string;
  email: string;
  role: 'admin' | 'mecanico';
}

export interface Endereco {
  rua: string;
  numero: string;
  bairro: string;
  cidade: string;
  cep: string;
}

export interface Cliente {
  id: string;
  nome: string;
  telefone: string;
  whatsapp: boolean;
  email: string;
  documento: string; // CPF or CNPJ
  endereco: Endereco;
}

export interface Veiculo {
  id: string;
  placa: string;
  marca: string;
  modelo: string;
  anoFabricacao: number;
  anoModelo: number;
  cor: string;
  clienteId: string; // Belongs to Cliente
  fotos?: string[];
}

export interface Mecanico {
  id: string;
  nome: string;
  especialidade: string;
  ativo: boolean;
}

export interface ItemServico {
  id: string;
  descricao: string;
  valor: number;
  horas: number;
}

export interface ItemPeca {
  id: string;
  descricao: string;
  quantidade: number;
  valorUnitario: number;
  produtoId?: string;
}


export type OrdemServicoStatus =
  | 'Vistoria'
  | 'Orcamento'
  | 'AguardandoAprovacao'
  | 'EmExecucao'
  | 'Pronto'
  | 'Entregue'
  | 'Cancelado';

export interface OSChecklist {
  estepe: boolean;
  macaco: boolean;
  chaveRoda: boolean;
  radio: boolean;
  riscosAmassados: string;
}

export interface OrdemServico {
  id: string;
  numeroOS: string;
  clienteId: string;
  veiculoId: string;
  mecanicoId?: string; // Assigned mechanic
  
  // Check-in / Vistoria
  quilometragemEntrada: number;
  nivelCombustivel: 'Reserva' | '1/4' | '1/2' | '3/4' | 'Cheio';
  checklist: OSChecklist;
  
  // Diagnóstico
  reclamacaoCliente: string;
  diagnosticoTecnico: string;
  
  // Orçamento
  servicos: ItemServico[];
  pecas: ItemPeca[];
  
  // Financeiro
  desconto: number;
  valorTotalServicos: number;
  valorTotalPecas: number;
  valorTotalGeral: number;
  formaPagamento?: 'PIX' | 'Dinheiro' | 'CartaoCredito' | 'CartaoDebito' | 'Faturado';
  
  // Datas e Status
  status: OrdemServicoStatus;
  dataEntrada: string; // ISO String
  dataAprovacao?: string; // ISO String
  dataConclusao?: string; // ISO String
  dataSaida?: string; // ISO String
  
  observacoes: string;
  fotos?: string[];
}

export interface Produto {
  id: string;
  codigo: string; // SKU or Barcode
  nome: string;
  precoVenda: number;
  quantidadeEstoque: number;
  marca?: string;
}

