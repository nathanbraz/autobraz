import { useEffect, useState } from 'react';
import { Plus, Search, Pencil, Trash2, Package, Tag } from 'lucide-react';
import { useApp } from '../contexts/AppContext';
import { useToast } from '../contexts/ToastContext';
import { produtoService } from '../services/produtoService';
import Modal from '../components/Modal';
import ConfirmModal from '../components/ConfirmModal';
import Pagination from '../components/Pagination';
import type { Produto } from '../types';
import '../styles/pages/CrudPage.css';

const empty = (): Omit<Produto, 'id'> => ({
  codigo: '',
  nome: '',
  precoVenda: 0,
  quantidadeEstoque: 0,
  marca: '',
});

export default function Produtos() {
  const { produtos = [], refreshProdutos } = useApp();
  const { toast } = useToast();
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Produto | null>(null);
  const [form, setForm] = useState(empty());
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  useEffect(() => {
    setCurrentPage(1);
  }, [search]);

  useEffect(() => {
    refreshProdutos();
  }, []);

  const filtered = produtos.filter(p =>
    p.nome.toLowerCase().includes(search.toLowerCase()) ||
    p.codigo.toLowerCase().includes(search.toLowerCase()) ||
    (p.marca && p.marca.toLowerCase().includes(search.toLowerCase()))
  );

  const paginated = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const openCreate = () => {
    setEditing(null);
    setForm(empty());
    setModalOpen(true);
  };

  const openEdit = (p: Produto) => {
    setEditing(p);
    setForm({ ...p });
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditing(null);
  };

  const handleSave = async () => {
    if (!form.codigo.trim() || !form.nome.trim()) {
      toast.warning('Código e Nome são obrigatórios.');
      return;
    }
    setSaving(true);
    try {
      if (editing) {
        await produtoService.update(editing.id, form);
        toast.success('Produto atualizado com sucesso!');
      } else {
        await produtoService.create(form);
        toast.success('Produto cadastrado com sucesso!');
      }
      await refreshProdutos();
      closeModal();
    } catch (err) {
      toast.error('Erro ao salvar produto.');
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
      await produtoService.delete(deletingId);
      toast.success('Produto excluído com sucesso!');
      await refreshProdutos();
    } catch (err) {
      toast.error('Erro ao excluir produto.');
    }
  };

  const set = (field: string, value: unknown) =>
    setForm(f => ({ ...f, [field]: value }));

  const fmt = (v: number) => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

  return (
    <div className="crud-page">
      <div className="page-header">
        <div>
          <h2 className="page-title">Produtos</h2>
          <p className="page-sub">
            {produtos.length} produto{produtos.length !== 1 ? 's' : ''} cadastrado{produtos.length !== 1 ? 's' : ''}
          </p>
        </div>
        <button id="btn-novo-produto" className="btn btn-primary" onClick={openCreate}>
          <Plus size={16} /> Novo Produto
        </button>
      </div>

      <div className="search-bar">
        <Search size={16} className="search-icon" />
        <input
          id="search-produtos"
          type="text"
          className="search-input"
          placeholder="Buscar por código, nome ou marca..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>

      <div className="table-container">
        <table className="table">
          <thead>
            <tr>
              <th>Código</th>
              <th>Nome</th>
              <th>Marca</th>
              <th>Preço de Venda</th>
              <th>Estoque</th>
              <th style={{ width: 100 }}>Ações</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={6} className="empty-msg">Nenhum produto encontrado.</td>
              </tr>
            ) : (
              paginated.map(p => (
                <tr key={p.id}>
                  <td>
                    <span className="plate-badge" style={{ fontFamily: 'monospace', letterSpacing: '0.05em' }}>{p.codigo}</span>
                  </td>
                  <td>
                    <div className="cell-user">
                      <div className="kpi-icon kpi-icon--blue" style={{ width: 32, height: 32 }}>
                        <Package size={14} />
                      </div>
                      <div className="cell-name">{p.nome}</div>
                    </div>
                  </td>
                  <td>{p.marca || '—'}</td>
                  <td>{fmt(p.precoVenda)}</td>
                  <td>
                    <span className={`badge ${p.quantidadeEstoque > 0 ? 'badge-pronto' : 'badge-cancelado'}`}>
                      {p.quantidadeEstoque} un
                    </span>
                  </td>
                  <td>
                    <div className="action-btns">
                      <button className="action-btn" onClick={() => openEdit(p)} title="Editar">
                        <Pencil size={14} />
                      </button>
                      <button className="action-btn action-btn--danger" onClick={() => handleDelete(p.id)} title="Excluir">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <Pagination
        currentPage={currentPage}
        totalItems={filtered.length}
        pageSize={pageSize}
        onPageChange={setCurrentPage}
        onPageSizeChange={setPageSize}
      />

      <Modal
        isOpen={modalOpen}
        onClose={closeModal}
        title={editing ? 'Editar Produto' : 'Novo Produto'}
        size="lg"
        footer={
          <>
            <button className="btn btn-secondary" onClick={closeModal}>Cancelar</button>
            <button id="btn-salvar-produto" className="btn btn-primary" onClick={handleSave} disabled={saving}>
              {saving ? 'Salvando...' : 'Salvar'}
            </button>
          </>
        }
      >
        <div className="form-section">
          <div className="form-section-title">
            <Tag size={14} /> Detalhes do Produto
          </div>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Código (SKU/Ref) *</label>
              <input
                className="form-control"
                value={form.codigo}
                onChange={e => set('codigo', e.target.value.toUpperCase())}
                placeholder="Ex: FO-BOS-01"
              />
            </div>
            <div className="form-group">
              <label className="form-label">Marca</label>
              <input
                className="form-control"
                value={form.marca}
                onChange={e => set('marca', e.target.value)}
                placeholder="Ex: Bosch"
              />
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Nome do Produto *</label>
            <input
              className="form-control"
              value={form.nome}
              onChange={e => set('nome', e.target.value)}
              placeholder="Ex: Filtro de Óleo Bosch"
            />
          </div>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Preço de Venda (R$) *</label>
              <input
                className="form-control"
                type="number"
                step="0.01"
                min="0"
                value={form.precoVenda === 0 ? '' : form.precoVenda}
                onChange={e => set('precoVenda', parseFloat(e.target.value) || 0)}
                placeholder="0,00"
              />
            </div>
            <div className="form-group">
              <label className="form-label">Quantidade em Estoque *</label>
              <input
                className="form-control"
                type="number"
                min="0"
                value={form.quantidadeEstoque === 0 ? '' : form.quantidadeEstoque}
                onChange={e => set('quantidadeEstoque', parseInt(e.target.value) || 0)}
                placeholder="0"
              />
            </div>
          </div>
        </div>
      </Modal>

      <ConfirmModal
        isOpen={deletingId !== null}
        onClose={() => setDeletingId(null)}
        onConfirm={confirmDelete}
        title="Excluir Produto"
        message="Deseja realmente excluir este produto? Esta ação não poderá ser desfeita."
      />
    </div>
  );
}
