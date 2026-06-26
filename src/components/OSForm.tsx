import { useState, useEffect } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { osService } from '../services/osService';
import { db } from '../services/db';
import { useApp } from '../contexts/AppContext';
import type { OrdemServico, Cliente, Veiculo, Mecanico, ItemServico, ItemPeca } from '../types';
import '../styles/components/OSForm.css';

interface OSFormProps {
  os: OrdemServico | null;
  clientes: Cliente[];
  veiculos: Veiculo[];
  mecanicos: Mecanico[];
  onSave: () => void;
  onCancel: () => void;
}

const defaultOS = (): Omit<OrdemServico, 'id' | 'numeroOS' | 'valorTotalServicos' | 'valorTotalPecas' | 'valorTotalGeral'> => ({
  clienteId: '', veiculoId: '', mecanicoId: '',
  quilometragemEntrada: 0, nivelCombustivel: '1/2',
  checklist: { estepe: false, macaco: false, chaveRoda: false, radio: false, riscosAmassados: '' },
  reclamacaoCliente: '', diagnosticoTecnico: '',
  servicos: [], pecas: [],
  desconto: 0, formaPagamento: undefined,
  status: 'Vistoria',
  dataEntrada: new Date().toISOString(),
  observacoes: '',
});

export default function OSForm({ os, clientes, veiculos, mecanicos, onSave, onCancel }: OSFormProps) {
  const { produtos = [] } = useApp();
  const [form, setForm] = useState(os ? { ...os } : defaultOS());
  const [saving, setSaving] = useState(false);
  const [veiculosFiltrados, setVeiculosFiltrados] = useState<Veiculo[]>([]);

  useEffect(() => {
    if (form.clienteId) {
      setVeiculosFiltrados(veiculos.filter(v => v.clienteId === form.clienteId));
    } else {
      setVeiculosFiltrados([]);
    }
  }, [form.clienteId, veiculos]);

  const set = (field: string, value: unknown) => setForm(f => ({ ...f, [field]: value }));
  const setChk = (field: string, val: unknown) => setForm(f => ({ ...f, checklist: { ...f.checklist, [field]: val } }));

  // Serviços
  const addServico = () => setForm(f => ({
    ...f,
    servicos: [...f.servicos, { id: db.uid(), descricao: '', valor: 0, horas: 1 }],
  }));
  const updateServico = (idx: number, field: keyof ItemServico, val: unknown) => {
    const s = [...form.servicos];
    s[idx] = { ...s[idx], [field]: val };
    setForm(f => ({ ...f, servicos: s }));
  };
  const removeServico = (idx: number) => setForm(f => ({ ...f, servicos: f.servicos.filter((_, i) => i !== idx) }));

  // Peças
  const addPeca = () => setForm(f => ({
    ...f,
    pecas: [...f.pecas, { id: db.uid(), descricao: '', quantidade: 1, valorUnitario: 0 }],
  }));
  const updatePeca = (idx: number, field: keyof ItemPeca, val: unknown) => {
    const p = [...form.pecas];
    p[idx] = { ...p[idx], [field]: val };
    setForm(f => ({ ...f, pecas: p }));
  };
  const removePeca = (idx: number) => setForm(f => ({ ...f, pecas: f.pecas.filter((_, i) => i !== idx) }));

  const totalServicos = form.servicos.reduce((a, s) => a + s.valor, 0);
  const totalPecas = form.pecas.reduce((a, p) => a + p.quantidade * p.valorUnitario, 0);
  const totalGeral = totalServicos + totalPecas - (form.desconto ?? 0);

  const fmt = (v: number) => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

  const handleSave = async () => {
    if (!form.clienteId || !form.veiculoId) {
      alert('Selecione um cliente e um veículo.');
      return;
    }
    setSaving(true);
    if (os) {
      await osService.update(os.id, form);
    } else {
      await osService.create(form);
    }
    setSaving(false);
    onSave();
  };

  return (
    <div className="os-form">
      {/* Section 1: Cliente e Veículo */}
      <section className="os-section">
        <div className="os-section-title">1. Identificação</div>
        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Cliente *</label>
            <select className="form-control" value={form.clienteId} onChange={e => { set('clienteId', e.target.value); set('veiculoId', ''); }}>
              <option value="">Selecione o cliente...</option>
              {clientes.map(c => <option key={c.id} value={c.id}>{c.nome}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Veículo *</label>
            <select className="form-control" value={form.veiculoId} onChange={e => set('veiculoId', e.target.value)} disabled={!form.clienteId}>
              <option value="">Selecione o veículo...</option>
              {veiculosFiltrados.map(v => <option key={v.id} value={v.id}>{v.marca} {v.modelo} — {v.placa}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Mecânico Responsável</label>
            <select className="form-control" value={form.mecanicoId ?? ''} onChange={e => set('mecanicoId', e.target.value)}>
              <option value="">A designar...</option>
              {mecanicos.filter(m => m.ativo).map(m => <option key={m.id} value={m.id}>{m.nome}</option>)}
            </select>
          </div>
        </div>
      </section>

      {/* Section 2: Vistoria */}
      <section className="os-section">
        <div className="os-section-title">2. Vistoria de Entrada</div>
        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Quilometragem de Entrada</label>
            <input className="form-control" type="number" value={form.quilometragemEntrada} onChange={e => set('quilometragemEntrada', parseInt(e.target.value) || 0)} />
          </div>
          <div className="form-group">
            <label className="form-label">Nível de Combustível</label>
            <select className="form-control" value={form.nivelCombustivel} onChange={e => set('nivelCombustivel', e.target.value)}>
              {['Reserva', '1/4', '1/2', '3/4', 'Cheio'].map(n => <option key={n} value={n}>{n}</option>)}
            </select>
          </div>
        </div>
        <div className="checklist-grid">
          {[
            ['estepe', 'Estepe'],
            ['macaco', 'Macaco'],
            ['chaveRoda', 'Chave de Roda'],
            ['radio', 'Rádio/Aparelho de Som'],
          ].map(([key, label]) => (
            <label key={key} className="form-check">
              <input type="checkbox" checked={Boolean(form.checklist[key as keyof typeof form.checklist])} onChange={e => setChk(key, e.target.checked)} />
              <span>{label}</span>
            </label>
          ))}
        </div>
        <div className="form-group">
          <label className="form-label">Riscos / Amassados (descreva ou deixe em branco)</label>
          <textarea className="form-control" rows={2} value={form.checklist.riscosAmassados} onChange={e => setChk('riscosAmassados', e.target.value)} placeholder="Ex: Pequeno amassado na porta traseira direita..." />
        </div>
      </section>

      {/* Section 3: Diagnóstico */}
      <section className="os-section">
        <div className="os-section-title">3. Diagnóstico</div>
        <div className="form-group">
          <label className="form-label">Reclamação do Cliente</label>
          <textarea className="form-control" rows={2} value={form.reclamacaoCliente} onChange={e => set('reclamacaoCliente', e.target.value)} placeholder="O que o cliente relatou..." />
        </div>
        <div className="form-group">
          <label className="form-label">Diagnóstico Técnico</label>
          <textarea className="form-control" rows={2} value={form.diagnosticoTecnico} onChange={e => set('diagnosticoTecnico', e.target.value)} placeholder="Avaliação do mecânico..." />
        </div>
      </section>

      {/* Section 4: Serviços */}
      <section className="os-section">
        <div className="os-section-title" style={{ justifyContent: 'space-between' }}>
          <span>4. Serviços (Mão de Obra)</span>
          <button className="btn btn-secondary" style={{ fontSize: '0.75rem', padding: '0.25rem 0.625rem' }} onClick={addServico}>
            <Plus size={12} /> Adicionar
          </button>
        </div>
        {form.servicos.length === 0 ? (
          <p style={{ color: 'var(--text-muted)', fontSize: '0.8125rem' }}>Nenhum serviço adicionado.</p>
        ) : (
          <div className="items-table">
            <div className="items-header--services">
              <span>Descrição</span><span>Horas</span><span>Valor</span><span></span>
            </div>
            {form.servicos.map((s, i) => (
              <div key={s.id} className="items-row--services">
                <input className="form-control" value={s.descricao} onChange={e => updateServico(i, 'descricao', e.target.value)} placeholder="Descrição do serviço" />
                <input className="form-control" type="number" value={s.horas} onChange={e => updateServico(i, 'horas', parseFloat(e.target.value) || 0)} style={{ maxWidth: 80 }} />
                <input className="form-control" type="number" value={s.valor} onChange={e => updateServico(i, 'valor', parseFloat(e.target.value) || 0)} placeholder="0,00" style={{ maxWidth: 120 }} />
                <button className="action-btn action-btn--danger" onClick={() => removeServico(i)}><Trash2 size={13} /></button>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Section 5: Peças */}
      <section className="os-section">
        <div className="os-section-title" style={{ justifyContent: 'space-between' }}>
          <span>5. Peças e Materiais</span>
          <button className="btn btn-secondary" style={{ fontSize: '0.75rem', padding: '0.25rem 0.625rem' }} onClick={addPeca}>
            <Plus size={12} /> Adicionar
          </button>
        </div>
        {form.pecas.length === 0 ? (
          <p style={{ color: 'var(--text-muted)', fontSize: '0.8125rem' }}>Nenhuma peça adicionada.</p>
        ) : (
          <div className="items-table">
            <div className="items-header--pieces">
              <span>Item / Produto</span><span>Descrição</span><span>Qtd</span><span>Valor Unit.</span><span>Total</span><span></span>
            </div>
            {form.pecas.map((p, i) => {
              const selectedProd = produtos.find(prod => prod.id === p.produtoId);
              const isManual = !p.produtoId;

              return (
                <div key={p.id} className="os-form-peca-row" style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem', padding: '0.5rem 0', borderBottom: '1px solid var(--border)' }}>
                  <div className="items-row--pieces">
                    <select
                      className="form-control"
                      value={p.produtoId || ''}
                      onChange={e => {
                        const prodId = e.target.value;
                        if (prodId === '') {
                          updatePeca(i, 'produtoId', undefined);
                          updatePeca(i, 'descricao', '');
                          updatePeca(i, 'valorUnitario', 0);
                        } else {
                          const pr = produtos.find(x => x.id === prodId);
                          if (pr) {
                            updatePeca(i, 'produtoId', pr.id);
                            updatePeca(i, 'descricao', pr.nome);
                            updatePeca(i, 'valorUnitario', pr.precoVenda);
                          }
                        }
                      }}
                    >
                      <option value="">-- Digitação Livre --</option>
                      {produtos.map(prod => (
                        <option key={prod.id} value={prod.id}>
                          {prod.nome} ({prod.codigo})
                        </option>
                      ))}
                    </select>

                    <input
                      className="form-control"
                      value={p.descricao}
                      onChange={e => updatePeca(i, 'descricao', e.target.value)}
                      placeholder="Nome da peça"
                      disabled={!isManual}
                    />

                    <input
                      className="form-control"
                      type="number"
                      min="1"
                      value={p.quantidade}
                      onChange={e => updatePeca(i, 'quantidade', parseInt(e.target.value) || 1)}
                      style={{ maxWidth: 70 }}
                    />

                    <input
                      className="form-control"
                      type="number"
                      step="0.01"
                      value={p.valorUnitario}
                      onChange={e => updatePeca(i, 'valorUnitario', parseFloat(e.target.value) || 0)}
                      style={{ maxWidth: 120 }}
                      disabled={!isManual}
                    />

                    <span style={{ color: 'var(--text-secondary)', fontSize: '0.8125rem', minWidth: 80 }}>{fmt(p.quantidade * p.valorUnitario)}</span>
                    <button className="action-btn action-btn--danger" onClick={() => removePeca(i)}><Trash2 size={13} /></button>
                  </div>

                  {selectedProd && (
                    <div style={{ display: 'flex', gap: '1rem', fontSize: '0.75rem', paddingLeft: '0.25rem' }}>
                      <span style={{ color: 'var(--text-muted)' }}>
                        Marca: <strong>{selectedProd.marca || '—'}</strong>
                      </span>
                      <span style={{ color: selectedProd.quantidadeEstoque < p.quantidade ? 'var(--color-cancelado)' : 'var(--color-pronto)', fontWeight: 500 }}>
                        Estoque disponível: {selectedProd.quantidadeEstoque} un
                        {selectedProd.quantidadeEstoque < p.quantidade && ' ⚠️ Estoque Insuficiente!'}
                      </span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* Section 6: Totais */}
      <section className="os-section">
        <div className="os-section-title">6. Resumo Financeiro</div>
        <div className="os-totals">
          <div className="os-total-row"><span>Subtotal Serviços</span><span>{fmt(totalServicos)}</span></div>
          <div className="os-total-row"><span>Subtotal Peças</span><span>{fmt(totalPecas)}</span></div>
          <div className="os-total-row">
            <span>Desconto</span>
            <input className="form-control" type="number" value={form.desconto} onChange={e => set('desconto', parseFloat(e.target.value) || 0)} style={{ maxWidth: 120, textAlign: 'right' }} />
          </div>
          <div className="os-total-row os-total-row--grand">
            <span>TOTAL GERAL</span><span>{fmt(totalGeral)}</span>
          </div>
        </div>
        <div className="form-row" style={{ marginTop: '1rem' }}>
          <div className="form-group">
            <label className="form-label">Forma de Pagamento</label>
            <select className="form-control" value={form.formaPagamento ?? ''} onChange={e => set('formaPagamento', e.target.value || undefined)}>
              <option value="">A definir...</option>
              <option value="PIX">PIX</option>
              <option value="Dinheiro">Dinheiro</option>
              <option value="CartaoCredito">Cartão de Crédito</option>
              <option value="CartaoDebito">Cartão de Débito</option>
              <option value="Faturado">Faturado</option>
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Status da OS</label>
            <select className="form-control" value={form.status} onChange={e => set('status', e.target.value)}>
              <option value="Vistoria">Vistoria</option>
              <option value="Orcamento">Orçamento</option>
              <option value="AguardandoAprovacao">Aguardando Aprovação</option>
              <option value="EmExecucao">Em Execução</option>
              <option value="Pronto">Pronto</option>
              <option value="Entregue">Entregue</option>
              <option value="Cancelado">Cancelado</option>
            </select>
          </div>
        </div>
        <div className="form-group">
          <label className="form-label">Observações</label>
          <textarea className="form-control" rows={2} value={form.observacoes} onChange={e => set('observacoes', e.target.value)} />
        </div>
      </section>

      {/* Footer */}
      <div className="os-form-footer">
        <button className="btn btn-secondary" onClick={onCancel}>Cancelar</button>
        <button id="btn-salvar-os" className="btn btn-primary" onClick={handleSave} disabled={saving}>
          {saving ? 'Salvando...' : os ? 'Salvar Alterações' : 'Criar Ordem de Serviço'}
        </button>
      </div>
    </div>
  );
}
