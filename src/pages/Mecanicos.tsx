import { useEffect, useState } from 'react';
import { Plus, Search, Pencil, Trash2, Wrench, ToggleLeft, ToggleRight } from 'lucide-react';
import { useApp } from '../contexts/AppContext';
import { useToast } from '../contexts/ToastContext';
import { mecanicoService } from '../services/mecanicoService';
import Modal from '../components/Modal';
import ConfirmModal from '../components/ConfirmModal';
import type { Mecanico } from '../types';
import '../styles/pages/CrudPage.css';

const empty = (): Omit<Mecanico, 'id'> => ({ nome: '', especialidade: '', ativo: true });

export default function Mecanicos() {
  const { mecanicos, refreshMecanicos } = useApp();
  const { toast } = useToast();
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Mecanico | null>(null);
  const [form, setForm] = useState(empty());
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => { refreshMecanicos(); }, []);

  const filtered = mecanicos.filter(m =>
    m.nome.toLowerCase().includes(search.toLowerCase()) ||
    m.especialidade.toLowerCase().includes(search.toLowerCase())
  );

  const openCreate = () => { setEditing(null); setForm(empty()); setModalOpen(true); };
  const openEdit = (m: Mecanico) => { setEditing(m); setForm({ ...m }); setModalOpen(true); };
  const closeModal = () => { setModalOpen(false); setEditing(null); };

  const handleSave = async () => {
    if (!form.nome.trim()) {
      toast.warning('O nome do mecânico é obrigatório.');
      return;
    }
    setSaving(true);
    try {
      if (editing) {
        await mecanicoService.update(editing.id, form);
        toast.success('Mecânico atualizado com sucesso!');
      } else {
        await mecanicoService.create(form);
        toast.success('Mecânico cadastrado com sucesso!');
      }
      await refreshMecanicos();
      closeModal();
    } catch (err) {
      toast.error('Erro ao salvar mecânico.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = (id: string) => {
    setDeletingId(id);
  };

  const confirmDelete = async () => {
    if (!deletingId) return;
    try {
      await mecanicoService.delete(deletingId);
      toast.success('Mecânico excluído com sucesso!');
      await refreshMecanicos();
    } catch (err) {
      toast.error('Erro ao excluir mecânico.');
    }
  };

  const toggleAtivo = async (m: Mecanico) => {
    try {
      await mecanicoService.update(m.id, { ativo: !m.ativo });
      toast.success(`Mecânico ${!m.ativo ? 'ativado' : 'desativado'} com sucesso!`);
      await refreshMecanicos();
    } catch (err) {
      toast.error('Erro ao alterar status do mecânico.');
    }
  };

  const set = (field: string, value: unknown) => setForm(f => ({ ...f, [field]: value }));

  return (
    <div className="crud-page">
      <div className="page-header">
        <div>
          <h2 className="page-title">Equipe</h2>
          <p className="page-sub">{mecanicos.filter(m => m.ativo).length} ativo{mecanicos.filter(m => m.ativo).length !== 1 ? 's' : ''} de {mecanicos.length} mecânico{mecanicos.length !== 1 ? 's' : ''}</p>
        </div>
        <button id="btn-novo-mecanico" className="btn btn-primary" onClick={openCreate}>
          <Plus size={16} /> Novo Mecânico
        </button>
      </div>

      <div className="search-bar">
        <Search size={16} className="search-icon" />
        <input
          id="search-mecanicos"
          type="text"
          className="search-input"
          placeholder="Buscar por nome ou especialidade..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>

      <div className="table-container">
        <table className="table">
          <thead>
            <tr>
              <th>Mecânico</th>
              <th>Especialidade</th>
              <th>Status</th>
              <th style={{ width: 120 }}>Ações</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr><td colSpan={4} className="empty-msg">Nenhum mecânico encontrado.</td></tr>
            ) : filtered.map(m => (
              <tr key={m.id}>
                <td>
                  <div className="cell-user">
                    <div className="cell-avatar">{m.nome.charAt(0)}</div>
                    <div className="cell-name">{m.nome}</div>
                  </div>
                </td>
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Wrench size={13} style={{ color: 'var(--text-muted)' }} />
                    {m.especialidade}
                  </div>
                </td>
                <td>
                  <span className={`badge ${m.ativo ? 'badge-pronto' : 'badge-cancelado'}`}>
                    {m.ativo ? 'Ativo' : 'Inativo'}
                  </span>
                </td>
                <td>
                  <div className="action-btns">
                    <button className="action-btn" onClick={() => toggleAtivo(m)} title={m.ativo ? 'Desativar' : 'Ativar'}>
                      {m.ativo ? <ToggleRight size={14} /> : <ToggleLeft size={14} />}
                    </button>
                    <button className="action-btn" onClick={() => openEdit(m)} title="Editar"><Pencil size={14} /></button>
                    <button className="action-btn action-btn--danger" onClick={() => handleDelete(m.id)} title="Excluir"><Trash2 size={14} /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Modal
        isOpen={modalOpen}
        onClose={closeModal}
        title={editing ? 'Editar Mecânico' : 'Novo Mecânico'}
        size="sm"
        footer={
          <>
            <button className="btn btn-secondary" onClick={closeModal}>Cancelar</button>
            <button id="btn-salvar-mecanico" className="btn btn-primary" onClick={handleSave} disabled={saving}>
              {saving ? 'Salvando...' : 'Salvar'}
            </button>
          </>
        }
      >
        <div className="form-group">
          <label className="form-label">Nome Completo *</label>
          <input className="form-control" value={form.nome} onChange={e => set('nome', e.target.value)} placeholder="Nome do mecânico" />
        </div>
        <div className="form-group">
          <label className="form-label">Especialidade</label>
          <input className="form-control" value={form.especialidade} onChange={e => set('especialidade', e.target.value)} placeholder="Ex: Elétrica, Motor, Suspensão..." />
        </div>
        <div className="form-group">
          <label className="form-check">
            <input type="checkbox" checked={form.ativo} onChange={e => set('ativo', e.target.checked)} />
            <span>Mecânico ativo (disponível para receber OS)</span>
          </label>
        </div>
      </Modal>

      <ConfirmModal
        isOpen={deletingId !== null}
        onClose={() => setDeletingId(null)}
        onConfirm={confirmDelete}
        title="Excluir Mecânico"
        message="Deseja realmente excluir este mecânico? Esta ação não poderá ser desfeita."
      />
    </div>
  );
}
