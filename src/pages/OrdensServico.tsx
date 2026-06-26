import { useEffect, useState } from 'react';
import { Plus, Search, Eye, Trash2, ChevronRight, ClipboardList } from 'lucide-react';
import { useApp } from '../contexts/AppContext';
import { useAuth } from '../contexts/AuthContext';
import { osService } from '../services/osService';
import Modal from '../components/Modal';
import OSForm from '../components/OSForm';
import OSDetails from '../components/OSDetails';
import type { OrdemServico, OrdemServicoStatus } from '../types';
import '../styles/pages/CrudPage.css';
import '../styles/pages/OrdensServico.css';

const STATUS_LABELS: Record<OrdemServicoStatus, string> = {
  Vistoria: 'Vistoria',
  Orcamento: 'Orçamento',
  AguardandoAprovacao: 'Aguardando Aprovação',
  EmExecucao: 'Em Execução',
  Pronto: 'Pronto',
  Entregue: 'Entregue',
  Cancelado: 'Cancelado',
};

const TABS: { id: string; label: string }[] = [
  { id: 'all', label: 'Todas' },
  { id: 'Vistoria', label: 'Vistoria' },
  { id: 'AguardandoAprovacao', label: 'Aguardando' },
  { id: 'EmExecucao', label: 'Em Execução' },
  { id: 'Pronto', label: 'Prontas' },
  { id: 'Entregue', label: 'Entregues' },
  { id: 'Cancelado', label: 'Canceladas' },
];

export default function OrdensServico() {
  const { ordens, clientes, veiculos, mecanicos, refreshOrdens, refreshAll } = useApp();
  const { isAdmin } = useAuth();
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  const [formOpen, setFormOpen] = useState(false);
  const [editingOS, setEditingOS] = useState<OrdemServico | null>(null);
  const [viewingOS, setViewingOS] = useState<OrdemServico | null>(null);

  useEffect(() => { refreshAll(); }, []);

  const filtered = ordens.filter(o => {
    const matchTab = activeTab === 'all' || o.status === activeTab;
    const cliente = clientes.find(c => c.id === o.clienteId);
    const veiculo = veiculos.find(v => v.id === o.veiculoId);
    const matchSearch =
      o.numeroOS.toLowerCase().includes(search.toLowerCase()) ||
      (cliente?.nome ?? '').toLowerCase().includes(search.toLowerCase()) ||
      (veiculo?.placa ?? '').toLowerCase().includes(search.toLowerCase());
    return matchTab && matchSearch;
  });

  const sorted = [...filtered].sort((a, b) =>
    new Date(b.dataEntrada).getTime() - new Date(a.dataEntrada).getTime()
  );

  const handleDelete = async (id: string) => {
    if (!confirm('Deseja excluir esta OS?')) return;
    await osService.delete(id);
    await refreshOrdens();
  };

  const handleStatusChange = async (os: OrdemServico, newStatus: OrdemServicoStatus) => {
    await osService.updateStatus(os.id, newStatus);
    await refreshOrdens();
    if (viewingOS?.id === os.id) setViewingOS(prev => prev ? { ...prev, status: newStatus } : null);
  };

  const getStatusKey = (status: OrdemServicoStatus) =>
    status.toLowerCase().replace('aguardandoaprovacao', 'aguardando').replace('emexecucao', 'execucao');

  const fmtDate = (d: string) => new Date(d).toLocaleDateString('pt-BR');
  const fmt = (v: number) => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

  return (
    <div className="crud-page">
      <div className="page-header">
        <div>
          <h2 className="page-title">Ordens de Serviço</h2>
          <p className="page-sub">{ordens.length} ordem{ordens.length !== 1 ? 's' : ''} no sistema</p>
        </div>
        <button id="btn-nova-os" className="btn btn-primary" onClick={() => { setEditingOS(null); setFormOpen(true); }}>
          <Plus size={16} /> Nova OS
        </button>
      </div>

      {/* Tabs */}
      <div className="filter-tabs">
        {TABS.map(tab => (
          <button
            key={tab.id}
            className={`filter-tab ${activeTab === tab.id ? 'filter-tab--active' : ''}`}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.label}
            {tab.id !== 'all' && (
              <span className="tab-count">{ordens.filter(o => o.status === tab.id).length}</span>
            )}
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="search-bar">
        <Search size={16} className="search-icon" />
        <input
          id="search-os"
          type="text"
          className="search-input"
          placeholder="Buscar por número, cliente ou placa..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>

      {/* OS List */}
      <div className="os-list">
        {sorted.length === 0 ? (
          <div className="card empty-state">
            <ClipboardList size={40} style={{ color: 'var(--text-muted)', margin: '0 auto 1rem' }} />
            <p className="empty-msg">Nenhuma ordem encontrada.</p>
          </div>
        ) : sorted.map(os => {
          const cliente = clientes.find(c => c.id === os.clienteId);
          const veiculo = veiculos.find(v => v.id === os.veiculoId);
          const mecanico = mecanicos.find(m => m.id === os.mecanicoId);
          const sk = getStatusKey(os.status);

          return (
            <div key={os.id} className="os-card card">
              <div className="os-card-header">
                <div className="os-card-num">
                  <ClipboardList size={14} />
                  {os.numeroOS}
                </div>
                <span className={`badge badge-${sk}`}>{STATUS_LABELS[os.status]}</span>
              </div>

              <div className="os-card-body">
                <div className="os-card-info">
                  <div className="os-info-row">
                    <span className="os-info-label">Cliente</span>
                    <span className="os-info-val">{cliente?.nome ?? '—'}</span>
                  </div>
                  <div className="os-info-row">
                    <span className="os-info-label">Veículo</span>
                    <span className="os-info-val">
                      {veiculo ? `${veiculo.marca} ${veiculo.modelo}` : '—'}
                      {veiculo && <span className="plate-badge" style={{ marginLeft: '0.5rem', fontSize: '0.7rem', padding: '0.1rem 0.4rem' }}>{veiculo.placa}</span>}
                    </span>
                  </div>
                  <div className="os-info-row">
                    <span className="os-info-label">Mecânico</span>
                    <span className="os-info-val">{mecanico?.nome ?? 'Não designado'}</span>
                  </div>
                  <div className="os-info-row">
                    <span className="os-info-label">Entrada</span>
                    <span className="os-info-val">{fmtDate(os.dataEntrada)}</span>
                  </div>
                </div>

                <div className="os-card-total">
                  <span className="os-total-label">Total</span>
                  <span className="os-total-val">{fmt(os.valorTotalGeral)}</span>
                </div>
              </div>

              {/* Quick actions based on status and role */}
              <div className="os-card-footer">
                <div className="os-quick-actions">
                  {os.status === 'Vistoria' && (
                    <button className="btn btn-secondary" style={{ fontSize: '0.75rem', padding: '0.375rem 0.75rem' }}
                      onClick={() => handleStatusChange(os, 'Orcamento')}>
                      Iniciar Orçamento <ChevronRight size={12} />
                    </button>
                  )}
                  {os.status === 'Orcamento' && (
                    <button className="btn btn-secondary" style={{ fontSize: '0.75rem', padding: '0.375rem 0.75rem' }}
                      onClick={() => handleStatusChange(os, 'AguardandoAprovacao')}>
                      Enviar p/ Aprovação <ChevronRight size={12} />
                    </button>
                  )}
                  {os.status === 'AguardandoAprovacao' && isAdmin && (
                    <button className="btn btn-primary" style={{ fontSize: '0.75rem', padding: '0.375rem 0.75rem' }}
                      onClick={() => handleStatusChange(os, 'EmExecucao')}>
                      ✓ Aprovar e Iniciar
                    </button>
                  )}
                  {os.status === 'EmExecucao' && (
                    <button className="btn btn-secondary" style={{ fontSize: '0.75rem', padding: '0.375rem 0.75rem' }}
                      onClick={() => handleStatusChange(os, 'Pronto')}>
                      Marcar como Pronto <ChevronRight size={12} />
                    </button>
                  )}
                  {os.status === 'Pronto' && isAdmin && (
                    <button className="btn btn-primary" style={{ fontSize: '0.75rem', padding: '0.375rem 0.75rem' }}
                      onClick={() => handleStatusChange(os, 'Entregue')}>
                      ✓ Confirmar Entrega
                    </button>
                  )}
                  {!['Entregue', 'Cancelado'].includes(os.status) && isAdmin && (
                    <button className="btn btn-secondary" style={{ fontSize: '0.75rem', padding: '0.375rem 0.75rem', color: 'var(--color-cancelado)' }}
                      onClick={() => handleStatusChange(os, 'Cancelado')}>
                      Cancelar
                    </button>
                  )}
                </div>

                <div className="action-btns">
                  <button className="action-btn" onClick={() => setViewingOS(os)} title="Visualizar OS"><Eye size={14} /></button>
                  {isAdmin && (
                    <button className="action-btn action-btn--danger" onClick={() => handleDelete(os.id)} title="Excluir"><Trash2 size={14} /></button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Form Modal */}
      <Modal isOpen={formOpen} onClose={() => setFormOpen(false)} title={editingOS ? 'Editar OS' : 'Nova Ordem de Serviço'} size="xl">
        <OSForm
          os={editingOS}
          clientes={clientes}
          veiculos={veiculos}
          mecanicos={mecanicos}
          onSave={async () => { await refreshOrdens(); setFormOpen(false); }}
          onCancel={() => setFormOpen(false)}
        />
      </Modal>

      {/* View Modal */}
      {viewingOS && (
        <Modal isOpen={!!viewingOS} onClose={() => setViewingOS(null)} title={`OS ${viewingOS.numeroOS}`} size="xl">
          <OSDetails
            os={viewingOS}
            clientes={clientes}
            veiculos={veiculos}
            mecanicos={mecanicos}
          />
        </Modal>
      )}
    </div>
  );
}
