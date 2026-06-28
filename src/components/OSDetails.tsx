import { useState } from 'react';
import { Printer } from 'lucide-react';
import type { OrdemServico, Cliente, Veiculo, Mecanico } from '../types';
import '../styles/components/OSDetails.css';

interface OSDetailsProps {
  os: OrdemServico;
  clientes: Cliente[];
  veiculos: Veiculo[];
  mecanicos: Mecanico[];
}

const STATUS_LABELS: Record<string, string> = {
  Vistoria: 'Vistoria', Orcamento: 'Orçamento', AguardandoAprovacao: 'Aguardando Aprovação',
  EmExecucao: 'Em Execução', Pronto: 'Pronto', Entregue: 'Entregue', Cancelado: 'Cancelado',
};

const PGTO: Record<string, string> = {
  PIX: 'PIX', Dinheiro: 'Dinheiro', CartaoCredito: 'Cartão de Crédito',
  CartaoDebito: 'Cartão de Débito', Faturado: 'Faturado',
};

export default function OSDetails({ os, clientes, veiculos, mecanicos }: OSDetailsProps) {
  const [lightboxImages, setLightboxImages] = useState<{ images: string[]; index: number } | null>(null);
  const cliente = clientes.find(c => c.id === os.clienteId);
  const veiculo = veiculos.find(v => v.id === os.veiculoId);
  const mecanico = mecanicos.find(m => m.id === os.mecanicoId);
  const sk = os.status.toLowerCase().replace('aguardandoaprovacao', 'aguardando').replace('emexecucao', 'execucao');

  const fmt = (v: number) => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  const fmtDate = (d?: string) => d ? new Date(d).toLocaleDateString('pt-BR') : '—';

  return (
    <div className="os-details">
      <div className="os-details-actions no-print">
        <button className="btn btn-secondary" onClick={() => window.print()}>
          <Printer size={15} /> Imprimir / PDF
        </button>
      </div>

      {/* Header */}
      <div className="os-detail-header">
        <div>
          <h2 className="os-detail-title">{os.numeroOS}</h2>
          <span className={`badge badge-${sk}`}>{STATUS_LABELS[os.status]}</span>
        </div>
        <div className="os-detail-dates">
          <div><span>Entrada:</span> <strong>{fmtDate(os.dataEntrada)}</strong></div>
          {os.dataConclusao && <div><span>Conclusão:</span> <strong>{fmtDate(os.dataConclusao)}</strong></div>}
          {os.dataSaida && <div><span>Saída:</span> <strong>{fmtDate(os.dataSaida)}</strong></div>}
        </div>
      </div>

      {/* Cliente e Veiculo */}
      <div className="os-detail-grid">
        <div className="os-detail-section">
          <div className="os-detail-section-title">Cliente</div>
          <p className="os-detail-primary">{cliente?.nome ?? '—'}</p>
          <p>{cliente?.documento}</p>
          <p>{cliente?.telefone} {cliente?.whatsapp ? '(WhatsApp)' : ''}</p>
          <p>{cliente?.email}</p>
          {cliente?.endereco.rua && (
            <p>{cliente.endereco.rua}, {cliente.endereco.numero} — {cliente.endereco.bairro}, {cliente.endereco.cidade}</p>
          )}
        </div>

        <div className="os-detail-section">
          <div className="os-detail-section-title">Veículo</div>
          <p className="os-detail-primary">{veiculo ? `${veiculo.marca} ${veiculo.modelo}` : '—'}</p>
          {veiculo && (
            <>
              <p><strong>Placa:</strong> {veiculo.placa}</p>
              <p><strong>Ano:</strong> {veiculo.anoFabricacao}/{veiculo.anoModelo}</p>
              <p><strong>Cor:</strong> {veiculo.cor}</p>
            </>
          )}
          <p><strong>KM Entrada:</strong> {os.quilometragemEntrada.toLocaleString('pt-BR')} km</p>
          <p><strong>Combustível:</strong> {os.nivelCombustivel}</p>
        </div>

        <div className="os-detail-section">
          <div className="os-detail-section-title">Responsável</div>
          <p className="os-detail-primary">{mecanico?.nome ?? 'Não designado'}</p>
          {mecanico && <p>{mecanico.especialidade}</p>}
        </div>
      </div>

      {/* Checklist */}
      <div className="os-detail-section">
        <div className="os-detail-section-title">Vistoria de Entrada</div>
        <div className="os-checklist">
          {[['estepe', 'Estepe'], ['macaco', 'Macaco'], ['chaveRoda', 'Chave de Roda'], ['radio', 'Rádio']].map(([k, l]) => (
            <div key={k} className={`os-checklist-item ${os.checklist[k as keyof typeof os.checklist] ? 'os-checklist-item--ok' : 'os-checklist-item--no'}`}>
              {os.checklist[k as keyof typeof os.checklist] ? '✓' : '✗'} {l}
            </div>
          ))}
        </div>
        {os.checklist.riscosAmassados && (
          <p style={{ marginTop: '0.75rem', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
            <strong>Avarias:</strong> {os.checklist.riscosAmassados}
          </p>
        )}
      </div>

      {/* Galeria de Fotos */}
      {((os.fotos && os.fotos.length > 0) || (veiculo?.fotos && veiculo.fotos.length > 0)) && (
        <div className="os-detail-section no-print">
          <div className="os-detail-section-title">Galeria de Imagens</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {os.fotos && os.fotos.length > 0 && (
              <div>
                <h4 style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.5rem', fontWeight: 600 }}>Fotos da Ordem de Serviço (Check-in/Diagnóstico)</h4>
                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                  {os.fotos.map((foto, idx) => (
                    <div 
                      key={idx} 
                      onClick={() => setLightboxImages({ images: os.fotos || [], index: idx })}
                      style={{ cursor: 'pointer', width: 90, height: 90, borderRadius: 'var(--radius-sm)', overflow: 'hidden', border: '1px solid var(--border)' }}
                    >
                      <img src={foto} alt={`Foto O.S. ${idx + 1}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {veiculo?.fotos && veiculo.fotos.length > 0 && (
              <div>
                <h4 style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.5rem', fontWeight: 600 }}>Fotos do Cadastro do Veículo (Gerais)</h4>
                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                  {veiculo.fotos.map((foto, idx) => (
                    <div 
                      key={idx} 
                      onClick={() => setLightboxImages({ images: veiculo.fotos || [], index: idx })}
                      style={{ cursor: 'pointer', width: 90, height: 90, borderRadius: 'var(--radius-sm)', overflow: 'hidden', border: '1px solid var(--border)' }}
                    >
                      <img src={foto} alt={`Foto Veículo ${idx + 1}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Diagnóstico */}
      <div className="os-detail-grid" style={{ gridTemplateColumns: '1fr 1fr' }}>
        <div className="os-detail-section">
          <div className="os-detail-section-title">Reclamação do Cliente</div>
          <p>{os.reclamacaoCliente || '—'}</p>
        </div>
        <div className="os-detail-section">
          <div className="os-detail-section-title">Diagnóstico Técnico</div>
          <p>{os.diagnosticoTecnico || '—'}</p>
        </div>
      </div>

      {/* Serviços */}
      {os.servicos.length > 0 && (
        <div className="os-detail-section">
          <div className="os-detail-section-title">Serviços (Mão de Obra)</div>
          <table className="table" style={{ marginTop: 0 }}>
            <thead>
              <tr><th>Descrição</th><th>Horas</th><th style={{ textAlign: 'right' }}>Valor</th></tr>
            </thead>
            <tbody>
              {os.servicos.map(s => (
                <tr key={s.id}>
                  <td>{s.descricao}</td>
                  <td>{s.horas}h</td>
                  <td style={{ textAlign: 'right' }}>{fmt(s.valor)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Peças */}
      {os.pecas.length > 0 && (
        <div className="os-detail-section">
          <div className="os-detail-section-title">Peças e Materiais</div>
          <table className="table" style={{ marginTop: 0 }}>
            <thead>
              <tr><th>Descrição</th><th>Qtd</th><th>Valor Unit.</th><th style={{ textAlign: 'right' }}>Subtotal</th></tr>
            </thead>
            <tbody>
              {os.pecas.map(p => (
                <tr key={p.id}>
                  <td>{p.descricao}</td>
                  <td>{p.quantidade}</td>
                  <td>{fmt(p.valorUnitario)}</td>
                  <td style={{ textAlign: 'right' }}>{fmt(p.quantidade * p.valorUnitario)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Totais */}
      <div className="os-detail-totals">
        <div className="os-detail-total-row"><span>Subtotal Serviços</span><span>{fmt(os.valorTotalServicos)}</span></div>
        <div className="os-detail-total-row"><span>Subtotal Peças</span><span>{fmt(os.valorTotalPecas)}</span></div>
        {os.desconto > 0 && <div className="os-detail-total-row"><span>Desconto</span><span>- {fmt(os.desconto)}</span></div>}
        <div className="os-detail-total-row os-detail-total-row--grand">
          <span>TOTAL GERAL</span><span>{fmt(os.valorTotalGeral)}</span>
        </div>
        {os.formaPagamento && (
          <div className="os-detail-total-row"><span>Forma de Pagamento</span><span>{PGTO[os.formaPagamento] ?? os.formaPagamento}</span></div>
        )}
      </div>

      {/* Observações */}
      {os.observacoes && (
        <div className="os-detail-section">
          <div className="os-detail-section-title">Observações</div>
          <p>{os.observacoes}</p>
        </div>
      )}

      {/* Assinaturas */}
      <div className="os-signatures print-only">
        <div className="os-signature">
          <div className="os-signature-line" />
          <p>Assinatura do Cliente</p>
        </div>
        <div className="os-signature">
          <div className="os-signature-line" />
          <p>Responsável Técnico</p>
        </div>
      </div>

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
