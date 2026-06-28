import { useEffect, useState } from 'react';
import { Plus, Search, Eye, Trash2, ChevronRight, ClipboardList, Pencil, Car } from 'lucide-react';
import { useApp } from '../contexts/AppContext';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { osService } from '../services/osService';
import Modal from '../components/Modal';
import ConfirmModal from '../components/ConfirmModal';
import OSForm from '../components/OSForm';
import OSDetails from '../components/OSDetails';
import Pagination from '../components/Pagination';
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

// STATUS_CONFIRMATIONS removed - texts are now defined dynamically on the quick action buttons

const TAB_COLORS: Record<string, { bg: string; shadow: string }> = {
  all: { bg: 'var(--accent-primary)', shadow: 'rgba(37, 99, 235, 0.3)' },
  Vistoria: { bg: 'var(--color-vistoria)', shadow: 'rgba(56, 189, 248, 0.3)' },
  Orcamento: { bg: 'var(--color-orcamento)', shadow: 'rgba(245, 158, 11, 0.3)' },
  AguardandoAprovacao: { bg: 'var(--color-aguardando)', shadow: 'rgba(249, 115, 22, 0.3)' },
  EmExecucao: { bg: 'var(--color-execucao)', shadow: 'rgba(59, 130, 246, 0.3)' },
  Pronto: { bg: 'var(--color-pronto)', shadow: 'rgba(74, 222, 128, 0.3)' },
  Entregue: { bg: 'var(--color-entregue)', shadow: 'rgba(4, 120, 87, 0.3)' },
  Cancelado: { bg: 'var(--color-cancelado)', shadow: 'rgba(239, 68, 68, 0.3)' },
};

const TABS: { id: string; label: string }[] = [
  { id: 'all', label: 'Todas' },
  { id: 'Vistoria', label: 'Vistoria' },
  { id: 'Orcamento', label: 'Orçamento' },
  { id: 'AguardandoAprovacao', label: 'Aguardando' },
  { id: 'EmExecucao', label: 'Em Execução' },
  { id: 'Pronto', label: 'Prontas' },
  { id: 'Entregue', label: 'Entregues' },
  { id: 'Cancelado', label: 'Canceladas' },
];

export default function OrdensServico() {
  const { ordens, clientes, veiculos, mecanicos, refreshOrdens, refreshAll } = useApp();
  const { isAdmin } = useAuth();
  const { toast } = useToast();
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState('EmExecucao');
  const [formOpen, setFormOpen] = useState(false);
  const [editingOS, setEditingOS] = useState<OrdemServico | null>(null);
  const [viewingOS, setViewingOS] = useState<OrdemServico | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [lightboxImages, setLightboxImages] = useState<{ images: string[]; index: number } | null>(null);
  const [statusConfirm, setStatusConfirm] = useState<{
    os: OrdemServico;
    status: OrdemServicoStatus;
    title: string;
    message: string;
    confirmText: string;
    cancelText: string;
    type: 'danger' | 'warning' | 'info';
  } | null>(null);

  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  useEffect(() => {
    setCurrentPage(1);
  }, [search, activeTab]);

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

  const paginated = sorted.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const handleDelete = (id: string) => {
    setDeletingId(id);
  };

  const confirmDelete = async () => {
    if (!deletingId) return;
    try {
      await osService.delete(deletingId);
      toast.success('Ordem de Serviço excluída com sucesso!');
      await refreshOrdens();
    } catch (err) {
      toast.error('Erro ao excluir Ordem de Serviço.');
    }
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
          <p className="page-sub">{ordens.length} {ordens.length === 1 ? 'ordem' : 'ordens'} no sistema</p>
        </div>
        <button id="btn-nova-os" className="btn btn-primary" onClick={() => { setEditingOS(null); setFormOpen(true); }}>
          <Plus size={16} /> Nova OS
        </button>
      </div>

      {/* Tabs */}
      <div className="filter-tabs">
        {TABS.map(tab => {
          const isActive = activeTab === tab.id;
          const colors = TAB_COLORS[tab.id] || TAB_COLORS.all;
          const activeStyle = isActive ? {
            backgroundColor: colors.bg,
            borderColor: colors.bg,
            color: '#ffffff',
            boxShadow: `0 4px 12px ${colors.shadow}`,
          } : {};
          const badgeStyle = isActive ? {
            background: 'rgba(255, 255, 255, 0.2)',
            color: '#ffffff'
          } : {};

          return (
            <button
              key={tab.id}
              className={`filter-tab ${isActive ? 'filter-tab--active' : ''}`}
              style={activeStyle}
              onClick={() => setActiveTab(tab.id)}
            >
              {tab.label}
              {tab.id !== 'all' && (
                <span className="tab-count" style={badgeStyle}>
                  {ordens.filter(o => o.status === tab.id).length}
                </span>
              )}
            </button>
          );
        })}
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
        ) : paginated.map(os => {
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

              <div className="os-card-body" style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                {(() => {
                  const allPhotos = [
                    ...(os.fotos || []),
                    ...(veiculo?.fotos || [])
                  ];
                  const thumbnailUrl = allPhotos[0] || '';
                  const extraCount = allPhotos.length - 1;

                  return thumbnailUrl ? (
                    <div 
                      className="os-card-thumbnail-container"
                      onClick={() => setLightboxImages({ images: allPhotos, index: 0 })}
                      style={{ cursor: 'pointer', position: 'relative', width: 120, height: 120, flexShrink: 0, borderRadius: 'var(--radius-md)', overflow: 'hidden', border: '1px solid var(--border)' }}
                    >
                      <img src={thumbnailUrl} alt="Veículo" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      {extraCount > 0 && (
                        <div style={{ position: 'absolute', bottom: 0, right: 0, left: 0, background: 'rgba(0,0,0,0.6)', color: '#fff', fontSize: '0.65rem', padding: '0.1rem 0', textAlign: 'center', fontWeight: 'bold' }}>
                          +{extraCount}
                        </div>
                      )}
                    </div>
                  ) : (
                    <div 
                      style={{ width: 120, height: 120, flexShrink: 0, borderRadius: 'var(--radius-md)', background: 'var(--bg-hover-subtle)', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}
                    >
                      <Car size={48} />
                    </div>
                  );
                })()}

                <div className="os-card-info" style={{ flex: 1 }}>
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
                      onClick={() => setStatusConfirm({
                        os,
                        status: 'Orcamento',
                        title: 'Iniciar Orçamento',
                        message: 'Deseja iniciar a elaboração do orçamento para esta ordem de serviço?',
                        confirmText: 'Sim, Iniciar',
                        cancelText: 'Não',
                        type: 'info'
                      })}>
                      Iniciar Orçamento <ChevronRight size={12} />
                    </button>
                  )}
                  {os.status === 'Orcamento' && (
                    <button className="btn btn-secondary" style={{ fontSize: '0.75rem', padding: '0.375rem 0.75rem' }}
                      onClick={() => setStatusConfirm({
                        os,
                        status: 'AguardandoAprovacao',
                        title: 'Enviar para Aprovação',
                        message: 'Deseja enviar este orçamento para aprovação do cliente?',
                        confirmText: 'Sim, Enviar',
                        cancelText: 'Não',
                        type: 'info'
                      })}>
                      Enviar p/ Aprovação <ChevronRight size={12} />
                    </button>
                  )}
                  {os.status === 'AguardandoAprovacao' && isAdmin && (
                    <button className="btn btn-primary" style={{ fontSize: '0.75rem', padding: '0.375rem 0.75rem' }}
                      onClick={() => setStatusConfirm({
                        os,
                        status: 'EmExecucao',
                        title: 'Aprovar e Iniciar Serviço',
                        message: 'Deseja aprovar o orçamento e iniciar a execução dos serviços?',
                        confirmText: 'Aprovar e Iniciar',
                        cancelText: 'Não',
                        type: 'info'
                      })}>
                      ✓ Aprovar e Iniciar
                    </button>
                  )}
                  {os.status === 'EmExecucao' && (
                    <button className="btn btn-secondary" style={{ fontSize: '0.75rem', padding: '0.375rem 0.75rem' }}
                      onClick={() => setStatusConfirm({
                        os,
                        status: 'Pronto',
                        title: 'Finalizar Serviço',
                        message: 'Deseja marcar este veículo como pronto para retirada?',
                        confirmText: 'Sim, Pronto',
                        cancelText: 'Não',
                        type: 'info'
                      })}>
                      Marcar como Pronto <ChevronRight size={12} />
                    </button>
                  )}
                  {os.status === 'Pronto' && isAdmin && (
                    <>
                      <button className="btn btn-primary" style={{ fontSize: '0.75rem', padding: '0.375rem 0.75rem' }}
                        onClick={() => setStatusConfirm({
                          os,
                          status: 'Entregue',
                          title: 'Confirmar Entrega',
                          message: 'Deseja confirmar a entrega do veículo e a liquidação financeira desta OS?',
                          confirmText: 'Confirmar Entrega',
                          cancelText: 'Não',
                          type: 'info'
                        })}>
                        ✓ Confirmar Entrega
                      </button>
                      <button className="btn btn-secondary" style={{ fontSize: '0.75rem', padding: '0.375rem 0.75rem' }}
                        onClick={() => setStatusConfirm({
                          os,
                          status: 'EmExecucao',
                          title: 'Voltar para Execução',
                          message: 'Deseja realmente retornar esta ordem de serviço para a oficina (Em Execução)?',
                          confirmText: 'Sim, Voltar',
                          cancelText: 'Não',
                          type: 'warning'
                        })}>
                        Voltar p/ Execução
                      </button>
                    </>
                  )}
                  {!['Entregue', 'Cancelado'].includes(os.status) && isAdmin && (
                    <button className="btn btn-secondary" style={{ fontSize: '0.75rem', padding: '0.375rem 0.75rem', color: 'var(--color-cancelado)' }}
                      onClick={() => setStatusConfirm({
                        os,
                        status: 'Cancelado',
                        title: 'Cancelar Ordem de Serviço',
                        message: 'Deseja realmente cancelar esta ordem de serviço? Esta ação é irreversível.',
                        confirmText: 'Sim, Cancelar',
                        cancelText: 'Não',
                        type: 'danger'
                      })}>
                      Cancelar
                    </button>
                  )}
                </div>

                <div className="action-btns">
                  <button className="action-btn" onClick={() => setViewingOS(os)} title="Visualizar OS"><Eye size={14} /></button>
                  {isAdmin && !['Entregue', 'Cancelado'].includes(os.status) && (
                    <button className="action-btn" onClick={() => { setEditingOS(os); setFormOpen(true); }} title="Editar OS"><Pencil size={14} /></button>
                  )}
                  {isAdmin && (
                    <button className="action-btn action-btn--danger" onClick={() => handleDelete(os.id)} title="Excluir"><Trash2 size={14} /></button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <Pagination
        currentPage={currentPage}
        totalItems={filtered.length}
        pageSize={pageSize}
        onPageChange={setCurrentPage}
        onPageSizeChange={setPageSize}
      />

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

      <ConfirmModal
        isOpen={deletingId !== null}
        onClose={() => setDeletingId(null)}
        onConfirm={confirmDelete}
        title="Excluir Ordem de Serviço"
        message="Deseja realmente excluir esta OS? Esta ação não poderá ser desfeita e removerá permanentemente o histórico financeiro e de serviços associados a ela."
      />

      <ConfirmModal
        isOpen={statusConfirm !== null}
        onClose={() => setStatusConfirm(null)}
        onConfirm={async () => {
          if (statusConfirm) {
            await handleStatusChange(statusConfirm.os, statusConfirm.status);
            setStatusConfirm(null);
          }
        }}
        title={statusConfirm?.title ?? ''}
        message={statusConfirm?.message ?? ''}
        confirmText={statusConfirm?.confirmText ?? 'Confirmar'}
        cancelText={statusConfirm?.cancelText ?? 'Cancelar'}
        type={statusConfirm?.type ?? 'info'}
      />

      {/* Lightbox Overlay */}
      {lightboxImages && (
        <div 
          className="os-lightbox-overlay"
          onClick={() => setLightboxImages(null)}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(11, 15, 25, 0.95)',
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <button 
            style={{ position: 'absolute', top: '1rem', right: '1.5rem', background: 'none', border: 'none', color: '#f8fafc', fontSize: '2rem', cursor: 'pointer', zIndex: 10000 }}
            onClick={(e) => { e.stopPropagation(); setLightboxImages(null); }}
          >
            &times;
          </button>
          
          {lightboxImages.images.length > 1 && (
            <button 
              style={{ position: 'absolute', left: '1.5rem', top: '50%', transform: 'translateY(-50%)', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border)', borderRadius: '50%', width: 44, height: 44, color: '#f8fafc', fontSize: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', zIndex: 10000 }}
              onClick={(e) => {
                e.stopPropagation();
                setLightboxImages(prev => {
                  if (!prev) return null;
                  const newIndex = prev.index === 0 ? prev.images.length - 1 : prev.index - 1;
                  return { ...prev, index: newIndex };
                });
              }}
            >
              &#10094;
            </button>
          )}

          <div style={{ maxWidth: '90vw', maxHeight: '85vh', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }} onClick={(e) => e.stopPropagation()}>
            <img 
              src={lightboxImages.images[lightboxImages.index]} 
              alt={`Foto ${lightboxImages.index + 1}`} 
              style={{ maxWidth: '100%', maxHeight: '80vh', objectFit: 'contain', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }} 
            />
            <div style={{ color: '#f8fafc', fontSize: '0.875rem' }}>
              Foto {lightboxImages.index + 1} de {lightboxImages.images.length}
            </div>
          </div>

          {lightboxImages.images.length > 1 && (
            <button 
              style={{ position: 'absolute', right: '1.5rem', top: '50%', transform: 'translateY(-50%)', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border)', borderRadius: '50%', width: 44, height: 44, color: '#f8fafc', fontSize: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', zIndex: 10000 }}
              onClick={(e) => {
                e.stopPropagation();
                setLightboxImages(prev => {
                  if (!prev) return null;
                  const newIndex = prev.index === prev.images.length - 1 ? 0 : prev.index + 1;
                  return { ...prev, index: newIndex };
                });
              }}
            >
              &#10095;
            </button>
          )}
        </div>
      )}
    </div>
  );
}
