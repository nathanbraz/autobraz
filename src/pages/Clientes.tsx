import { useEffect, useState } from 'react';
import { Plus, Search, Pencil, Trash2, Mail, User } from 'lucide-react';
import { useApp } from '../contexts/AppContext';
import { useToast } from '../contexts/ToastContext';
import { clienteService } from '../services/clienteService';
import Modal from '../components/Modal';
import ConfirmModal from '../components/ConfirmModal';
import type { Cliente } from '../types';
import '../styles/pages/CrudPage.css';

const empty = (): Omit<Cliente, 'id'> => ({
  nome: '', telefone: '', whatsapp: false, email: '', documento: '',
  endereco: { rua: '', numero: '', bairro: '', cidade: '', cep: '' },
});

export default function Clientes() {
  const { clientes, refreshClientes } = useApp();
  const { toast } = useToast();
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Cliente | null>(null);
  const [form, setForm] = useState(empty());
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => { refreshClientes(); }, []);

  const filtered = clientes.filter(c =>
    c.nome.toLowerCase().includes(search.toLowerCase()) ||
    c.documento.includes(search) ||
    c.telefone.includes(search)
  );

  const openCreate = () => { setEditing(null); setForm(empty()); setModalOpen(true); };
  const openEdit = (c: Cliente) => { setEditing(c); setForm({ ...c }); setModalOpen(true); };
  const closeModal = () => { setModalOpen(false); setEditing(null); };

  const handleSave = async () => {
    if (!form.nome.trim()) {
      toast.warning('O nome do cliente é obrigatório.');
      return;
    }
    setSaving(true);
    try {
      if (editing) {
        await clienteService.update(editing.id, form);
        toast.success('Cliente atualizado com sucesso!');
      } else {
        await clienteService.create(form);
        toast.success('Cliente cadastrado com sucesso!');
      }
      await refreshClientes();
      closeModal();
    } catch (err) {
      toast.error('Erro ao salvar cliente.');
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
      await clienteService.delete(deletingId);
      toast.success('Cliente excluído com sucesso!');
      await refreshClientes();
    } catch (err) {
      toast.error('Erro ao excluir cliente.');
    }
  };

  const set = (field: string, value: unknown) => setForm(f => ({ ...f, [field]: value }));
  const setEnd = (field: string, value: string) => setForm(f => ({ ...f, endereco: { ...f.endereco, [field]: value } }));

  return (
    <div className="crud-page">
      <div className="page-header">
        <div>
          <h2 className="page-title">Clientes</h2>
          <p className="page-sub">{clientes.length} cliente{clientes.length !== 1 ? 's' : ''} cadastrado{clientes.length !== 1 ? 's' : ''}</p>
        </div>
        <button id="btn-novo-cliente" className="btn btn-primary" onClick={openCreate}>
          <Plus size={16} /> Novo Cliente
        </button>
      </div>

      {/* Search */}
      <div className="search-bar">
        <Search size={16} className="search-icon" />
        <input
          id="search-clientes"
          type="text"
          className="search-input"
          placeholder="Buscar por nome, CPF/CNPJ ou telefone..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>

      {/* Table */}
      <div className="table-container">
        <table className="table">
          <thead>
            <tr>
              <th>Cliente</th>
              <th>Documento</th>
              <th>Telefone</th>
              <th>Cidade</th>
              <th style={{ width: 100 }}>Ações</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr><td colSpan={5} className="empty-msg">Nenhum cliente encontrado.</td></tr>
            ) : filtered.map(c => (
              <tr key={c.id}>
                <td>
                  <div className="cell-user">
                    <div className="cell-avatar">{c.nome.charAt(0)}</div>
                    <div>
                      <div className="cell-name">{c.nome}</div>
                      <div className="cell-sub">{c.email}</div>
                    </div>
                  </div>
                </td>
                <td>{c.documento}</td>
                <td>
                  <span className="cell-phone">
                    {c.whatsapp ? '📱' : '📞'} {c.telefone}
                  </span>
                </td>
                <td>{c.endereco.cidade}</td>
                <td>
                  <div className="action-btns">
                    <button className="action-btn" onClick={() => openEdit(c)} title="Editar"><Pencil size={14} /></button>
                    <button className="action-btn action-btn--danger" onClick={() => handleDelete(c.id)} title="Excluir"><Trash2 size={14} /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={closeModal}
        title={editing ? 'Editar Cliente' : 'Novo Cliente'}
        size="lg"
        footer={
          <>
            <button className="btn btn-secondary" onClick={closeModal}>Cancelar</button>
            <button id="btn-salvar-cliente" className="btn btn-primary" onClick={handleSave} disabled={saving}>
              {saving ? 'Salvando...' : 'Salvar'}
            </button>
          </>
        }
      >
        <div className="form-section">
          <div className="form-section-title"><User size={14} /> Dados Pessoais</div>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Nome Completo *</label>
              <input className="form-control" value={form.nome} onChange={e => set('nome', e.target.value)} placeholder="Nome do cliente" />
            </div>
            <div className="form-group">
              <label className="form-label">CPF / CNPJ</label>
              <input className="form-control" value={form.documento} onChange={e => set('documento', e.target.value)} placeholder="000.000.000-00" />
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Telefone</label>
              <input className="form-control" value={form.telefone} onChange={e => set('telefone', e.target.value)} placeholder="(00) 00000-0000" />
            </div>
            <div className="form-group">
              <label className="form-label">E-mail</label>
              <input className="form-control" type="email" value={form.email} onChange={e => set('email', e.target.value)} placeholder="email@exemplo.com" />
            </div>
          </div>
          <div className="form-group">
            <label className="form-check">
              <input type="checkbox" checked={form.whatsapp} onChange={e => set('whatsapp', e.target.checked)} />
              <span>Número aceita WhatsApp</span>
            </label>
          </div>
        </div>

        <div className="form-section">
          <div className="form-section-title"><Mail size={14} /> Endereço</div>
          <div className="form-row" style={{ gridTemplateColumns: '2fr 1fr' }}>
            <div className="form-group">
              <label className="form-label">Rua / Logradouro</label>
              <input className="form-control" value={form.endereco.rua} onChange={e => setEnd('rua', e.target.value)} />
            </div>
            <div className="form-group">
              <label className="form-label">Número</label>
              <input className="form-control" value={form.endereco.numero} onChange={e => setEnd('numero', e.target.value)} />
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Bairro</label>
              <input className="form-control" value={form.endereco.bairro} onChange={e => setEnd('bairro', e.target.value)} />
            </div>
            <div className="form-group">
              <label className="form-label">Cidade</label>
              <input className="form-control" value={form.endereco.cidade} onChange={e => setEnd('cidade', e.target.value)} />
            </div>
            <div className="form-group">
              <label className="form-label">CEP</label>
              <input className="form-control" value={form.endereco.cep} onChange={e => setEnd('cep', e.target.value)} placeholder="00000-000" />
            </div>
          </div>
        </div>
      </Modal>

      <ConfirmModal
        isOpen={deletingId !== null}
        onClose={() => setDeletingId(null)}
        onConfirm={confirmDelete}
        title="Excluir Cliente"
        message="Deseja realmente excluir este cliente? Esta ação não poderá ser desfeita e todas as informações deste cadastro serão excluídas."
      />
    </div>
  );
}
