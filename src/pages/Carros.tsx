import { useEffect, useState } from 'react';
import { Plus, Search, Pencil, Trash2, Car } from 'lucide-react';
import { useApp } from '../contexts/AppContext';
import { carroService } from '../services/carroService';
import Modal from '../components/Modal';
import type { Veiculo } from '../types';
import '../styles/pages/CrudPage.css';

const empty = (): Omit<Veiculo, 'id'> => ({
  placa: '', marca: '', modelo: '', anoFabricacao: new Date().getFullYear(),
  anoModelo: new Date().getFullYear(), cor: '', clienteId: '',
});

export default function Carros() {
  const { veiculos, clientes, refreshVeiculos } = useApp();
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Veiculo | null>(null);
  const [form, setForm] = useState(empty());
  const [saving, setSaving] = useState(false);

  useEffect(() => { refreshVeiculos(); }, []);

  const filtered = veiculos.filter(v =>
    v.placa.toLowerCase().includes(search.toLowerCase()) ||
    v.modelo.toLowerCase().includes(search.toLowerCase()) ||
    v.marca.toLowerCase().includes(search.toLowerCase())
  );

  const openCreate = () => { setEditing(null); setForm(empty()); setModalOpen(true); };
  const openEdit = (v: Veiculo) => { setEditing(v); setForm({ ...v }); setModalOpen(true); };
  const closeModal = () => { setModalOpen(false); setEditing(null); };

  const handleSave = async () => {
    if (!form.placa.trim() || !form.clienteId) return;
    setSaving(true);
    if (editing) await carroService.update(editing.id, form);
    else await carroService.create(form);
    await refreshVeiculos();
    setSaving(false);
    closeModal();
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Deseja excluir este veículo?')) return;
    await carroService.delete(id);
    await refreshVeiculos();
  };

  const set = (field: string, value: unknown) => setForm(f => ({ ...f, [field]: value }));
  const getClienteNome = (id: string) => clientes.find(c => c.id === id)?.nome ?? '—';

  return (
    <div className="crud-page">
      <div className="page-header">
        <div>
          <h2 className="page-title">Veículos</h2>
          <p className="page-sub">{veiculos.length} veículo{veiculos.length !== 1 ? 's' : ''} cadastrado{veiculos.length !== 1 ? 's' : ''}</p>
        </div>
        <button id="btn-novo-veiculo" className="btn btn-primary" onClick={openCreate}>
          <Plus size={16} /> Novo Veículo
        </button>
      </div>

      <div className="search-bar">
        <Search size={16} className="search-icon" />
        <input
          id="search-veiculos"
          type="text"
          className="search-input"
          placeholder="Buscar por placa, modelo ou marca..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>

      <div className="table-container">
        <table className="table">
          <thead>
            <tr>
              <th>Placa</th>
              <th>Veículo</th>
              <th>Ano</th>
              <th>Cor</th>
              <th>Proprietário</th>
              <th style={{ width: 100 }}>Ações</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr><td colSpan={6} className="empty-msg">Nenhum veículo encontrado.</td></tr>
            ) : filtered.map(v => (
              <tr key={v.id}>
                <td><span className="plate-badge">{v.placa}</span></td>
                <td>
                  <div className="cell-user">
                    <div className="kpi-icon kpi-icon--slate" style={{ width: 32, height: 32 }}><Car size={14} /></div>
                    <div>
                      <div className="cell-name">{v.marca} {v.modelo}</div>
                    </div>
                  </div>
                </td>
                <td>{v.anoFabricacao}/{v.anoModelo}</td>
                <td>{v.cor}</td>
                <td>{getClienteNome(v.clienteId)}</td>
                <td>
                  <div className="action-btns">
                    <button className="action-btn" onClick={() => openEdit(v)} title="Editar"><Pencil size={14} /></button>
                    <button className="action-btn action-btn--danger" onClick={() => handleDelete(v.id)} title="Excluir"><Trash2 size={14} /></button>
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
        title={editing ? 'Editar Veículo' : 'Novo Veículo'}
        size="lg"
        footer={
          <>
            <button className="btn btn-secondary" onClick={closeModal}>Cancelar</button>
            <button id="btn-salvar-veiculo" className="btn btn-primary" onClick={handleSave} disabled={saving}>
              {saving ? 'Salvando...' : 'Salvar'}
            </button>
          </>
        }
      >
        <div className="form-section">
          <div className="form-section-title"><Car size={14} /> Dados do Veículo</div>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Placa *</label>
              <input className="form-control" value={form.placa} onChange={e => set('placa', e.target.value.toUpperCase())} placeholder="ABC-1234 ou BRA0A19" />
            </div>
            <div className="form-group">
              <label className="form-label">Cor</label>
              <input className="form-control" value={form.cor} onChange={e => set('cor', e.target.value)} placeholder="Prata" />
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Marca</label>
              <input className="form-control" value={form.marca} onChange={e => set('marca', e.target.value)} placeholder="Toyota" />
            </div>
            <div className="form-group">
              <label className="form-label">Modelo</label>
              <input className="form-control" value={form.modelo} onChange={e => set('modelo', e.target.value)} placeholder="Corolla" />
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Ano Fabricação</label>
              <input className="form-control" type="number" value={form.anoFabricacao} onChange={e => set('anoFabricacao', parseInt(e.target.value))} />
            </div>
            <div className="form-group">
              <label className="form-label">Ano Modelo</label>
              <input className="form-control" type="number" value={form.anoModelo} onChange={e => set('anoModelo', parseInt(e.target.value))} />
            </div>
          </div>
        </div>

        <div className="form-section">
          <div className="form-section-title">Proprietário</div>
          <div className="form-group">
            <label className="form-label">Cliente *</label>
            <select className="form-control" value={form.clienteId} onChange={e => set('clienteId', e.target.value)}>
              <option value="">Selecione o proprietário...</option>
              {clientes.map(c => (
                <option key={c.id} value={c.id}>{c.nome} — {c.documento}</option>
              ))}
            </select>
          </div>
        </div>
      </Modal>
    </div>
  );
}
