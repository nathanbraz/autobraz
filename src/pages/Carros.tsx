import { useEffect, useState } from 'react';
import { Plus, Search, Pencil, Trash2, Car } from 'lucide-react';
import { useApp } from '../contexts/AppContext';
import { useToast } from '../contexts/ToastContext';
import { carroService } from '../services/carroService';
import Modal from '../components/Modal';
import ConfirmModal from '../components/ConfirmModal';
import type { Veiculo } from '../types';
import '../styles/pages/CrudPage.css';

const empty = (): Omit<Veiculo, 'id'> => ({
  placa: '', marca: '', modelo: '', anoFabricacao: new Date().getFullYear(),
  anoModelo: new Date().getFullYear(), cor: '', clienteId: '', fotos: [],
});

const compressImage = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 800;
        const MAX_HEIGHT = 600;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_WIDTH) {
            height *= MAX_WIDTH / width;
            width = MAX_WIDTH;
          }
        } else {
          if (height > MAX_HEIGHT) {
            width *= MAX_HEIGHT / height;
            height = MAX_HEIGHT;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx?.drawImage(img, 0, 0, width, height);
        const dataUrl = canvas.toDataURL('image/jpeg', 0.7);
        resolve(dataUrl);
      };
      img.onerror = (err) => reject(err);
    };
    reader.onerror = (err) => reject(err);
  });
};

export default function Carros() {
  const { veiculos, clientes, refreshVeiculos } = useApp();
  const { toast } = useToast();
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Veiculo | null>(null);
  const [form, setForm] = useState(empty());
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [lightboxImages, setLightboxImages] = useState<{ images: string[]; index: number } | null>(null);

  useEffect(() => { refreshVeiculos(); }, []);

  const filtered = veiculos.filter(v =>
    v.placa.toLowerCase().includes(search.toLowerCase()) ||
    v.modelo.toLowerCase().includes(search.toLowerCase()) ||
    v.marca.toLowerCase().includes(search.toLowerCase())
  );

  const openCreate = () => { setEditing(null); setForm(empty()); setModalOpen(true); };
  const openEdit = (v: Veiculo) => { setEditing(v); setForm({ fotos: [], ...v }); setModalOpen(true); };
  const closeModal = () => { setModalOpen(false); setEditing(null); };

  const handleSave = async () => {
    if (!form.placa.trim()) {
      toast.warning('A placa do veículo é obrigatória.');
      return;
    }
    if (!form.clienteId) {
      toast.warning('O proprietário do veículo é obrigatório.');
      return;
    }
    setSaving(true);
    try {
      if (editing) {
        await carroService.update(editing.id, form);
        toast.success('Veículo atualizado com sucesso!');
      } else {
        await carroService.create(form);
        toast.success('Veículo cadastrado com sucesso!');
      }
      await refreshVeiculos();
      closeModal();
    } catch (err) {
      toast.error('Erro ao salvar veículo.');
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
      await carroService.delete(deletingId);
      toast.success('Veículo excluído com sucesso!');
      await refreshVeiculos();
    } catch (err) {
      toast.error('Erro ao excluir veículo.');
    }
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
                    {v.fotos && v.fotos.length > 0 ? (
                      <img 
                        src={v.fotos[0]} 
                        alt={`${v.marca} ${v.modelo}`} 
                        style={{ width: 32, height: 32, borderRadius: 'var(--radius-sm)', objectFit: 'cover' }} 
                      />
                    ) : (
                      <div className="kpi-icon kpi-icon--slate" style={{ width: 32, height: 32 }}>
                        <Car size={14} />
                      </div>
                    )}
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

        <div className="form-section">
          <div className="form-section-title">Fotos do Veículo</div>
          <div className="form-group">
            <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', padding: '0.75rem', border: '1px dashed var(--border)', borderRadius: 'var(--radius-md)', justifyContent: 'center', backgroundColor: 'rgba(255,255,255,0.02)' }}>
              <Plus size={16} /> Selecionar Fotos...
              <input 
                type="file" 
                multiple 
                accept="image/*" 
                style={{ display: 'none' }} 
                onChange={async (e) => {
                  if (e.target.files) {
                    const files = Array.from(e.target.files);
                    try {
                      const compressed = await Promise.all(files.map(compressImage));
                      setForm(f => ({ ...f, fotos: [...(f.fotos || []), ...compressed] }));
                    } catch (err) {
                      toast.error('Erro ao processar imagens.');
                    }
                  }
                }}
              />
            </label>
          </div>
          {form.fotos && form.fotos.length > 0 && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: '0.75rem', marginTop: '1rem' }}>
              {form.fotos.map((foto, idx) => (
                <div key={idx} style={{ position: 'relative', width: 140, height: 100, borderRadius: 'var(--radius-md)', overflow: 'hidden', border: '1px solid var(--border)' }}>
                  <img 
                    src={foto} 
                    alt={`Veículo ${idx + 1}`} 
                    style={{ width: '100%', height: '100%', objectFit: 'cover', cursor: 'pointer' }} 
                    onClick={() => setLightboxImages({ images: form.fotos || [], index: idx })}
                  />
                  <button 
                    type="button"
                    style={{ position: 'absolute', top: 4, right: 4, backgroundColor: 'rgba(239, 68, 68, 0.9)', color: 'white', border: 'none', borderRadius: '50%', width: 22, height: 22, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', fontSize: '12px', fontWeight: 'bold', zIndex: 10 }}
                    onClick={() => {
                      setForm(f => ({ ...f, fotos: (f.fotos || []).filter((_, i) => i !== idx) }));
                    }}
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </Modal>

      <ConfirmModal
        isOpen={deletingId !== null}
        onClose={() => setDeletingId(null)}
        onConfirm={confirmDelete}
        title="Excluir Veículo"
        message="Deseja realmente excluir este veículo? Esta ação não poderá ser desfeita e todas as ordens de serviço associadas a ele também serão impactadas."
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
            zIndex: 10000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <button 
            style={{ position: 'absolute', top: '1rem', right: '1.5rem', background: 'none', border: 'none', color: '#f8fafc', fontSize: '2rem', cursor: 'pointer', zIndex: 10001 }}
            onClick={(e) => { e.stopPropagation(); setLightboxImages(null); }}
          >
            &times;
          </button>
          
          {lightboxImages.images.length > 1 && (
            <button 
              style={{ position: 'absolute', left: '1.5rem', top: '50%', transform: 'translateY(-50%)', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border)', borderRadius: '50%', width: 44, height: 44, color: '#f8fafc', fontSize: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', zIndex: 10001 }}
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
              style={{ position: 'absolute', right: '1.5rem', top: '50%', transform: 'translateY(-50%)', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border)', borderRadius: '50%', width: 44, height: 44, color: '#f8fafc', fontSize: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', zIndex: 10001 }}
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
