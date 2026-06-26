import { useEffect } from 'react';
import { Car, ClipboardList, CheckCircle, TrendingUp, Clock, Users, Wrench } from 'lucide-react';
import { useApp } from '../contexts/AppContext';
import { osService } from '../services/osService';
import '../styles/pages/Dashboard.css';

const STATUS_LABELS: Record<string, string> = {
  Vistoria: 'Vistoria',
  Orcamento: 'Orçamento',
  AguardandoAprovacao: 'Aguardando',
  EmExecucao: 'Em Execução',
  Pronto: 'Pronto',
  Entregue: 'Entregue',
  Cancelado: 'Cancelado',
};

export default function Dashboard() {
  const { clientes, veiculos, ordens, mecanicos, refreshAll } = useApp();

  useEffect(() => { refreshAll(); }, []);

  const abertas = ordens.filter(o => !['Entregue', 'Cancelado'].includes(o.status));
  const prontas = ordens.filter(o => o.status === 'Pronto');
  const emExecucao = ordens.filter(o => o.status === 'EmExecucao');
  const faturamento = osService.getFaturamentoMes();

  const statusCounts: Record<string, number> = {};
  ordens.forEach(o => { statusCounts[o.status] = (statusCounts[o.status] || 0) + 1; });

  const recent = [...ordens]
    .sort((a, b) => new Date(b.dataEntrada).getTime() - new Date(a.dataEntrada).getTime())
    .slice(0, 5);

  const fmt = (v: number) => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  const fmtDate = (d: string) => new Date(d).toLocaleDateString('pt-BR');

  return (
    <div className="dashboard">
      <div className="page-header">
        <div>
          <h2 className="page-title">Dashboard</h2>
          <p className="page-sub">Visão geral da oficina em tempo real</p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="dashboard-kpis">
        <div className="card kpi-card">
          <div className="kpi-icon kpi-icon--blue"><ClipboardList size={20} /></div>
          <div>
            <div className="kpi-value">{abertas.length}</div>
            <div className="kpi-label">OS em Aberto</div>
          </div>
        </div>
        <div className="card kpi-card">
          <div className="kpi-icon kpi-icon--yellow"><Clock size={20} /></div>
          <div>
            <div className="kpi-value">{emExecucao.length}</div>
            <div className="kpi-label">Em Execução</div>
          </div>
        </div>
        <div className="card kpi-card">
          <div className="kpi-icon kpi-icon--green"><CheckCircle size={20} /></div>
          <div>
            <div className="kpi-value">{prontas.length}</div>
            <div className="kpi-label">Prontas p/ Entrega</div>
          </div>
        </div>
        <div className="card kpi-card">
          <div className="kpi-icon kpi-icon--teal"><TrendingUp size={20} /></div>
          <div>
            <div className="kpi-value">{fmt(faturamento)}</div>
            <div className="kpi-label">Faturamento (Mês)</div>
          </div>
        </div>
        <div className="card kpi-card">
          <div className="kpi-icon kpi-icon--purple"><Users size={20} /></div>
          <div>
            <div className="kpi-value">{clientes.length}</div>
            <div className="kpi-label">Clientes</div>
          </div>
        </div>
        <div className="card kpi-card">
          <div className="kpi-icon kpi-icon--slate"><Car size={20} /></div>
          <div>
            <div className="kpi-value">{veiculos.length}</div>
            <div className="kpi-label">Veículos</div>
          </div>
        </div>
      </div>

      <div className="dashboard-grid">
        {/* Status Breakdown */}
        <div className="card dashboard-status-card">
          <h3 className="card-title">Status das Ordens</h3>
          <div className="status-breakdown">
            {Object.entries(STATUS_LABELS).map(([key, label]) => {
              const count = statusCounts[key] || 0;
              const total = ordens.length || 1;
              const pct = Math.round((count / total) * 100);
              return (
                <div key={key} className="status-row">
                  <div className="status-row-info">
                    <span className={`badge badge-${key.toLowerCase().replace('aguardandoaprovacao', 'aguardando').replace('emexecucao', 'execucao')}`}>{label}</span>
                    <span className="status-row-count">{count}</span>
                  </div>
                  <div className="status-bar">
                    <div className="status-bar-fill" style={{ width: `${pct}%`, background: `var(--color-${key.toLowerCase().replace('aguardandoaprovacao', 'aguardando').replace('emexecucao', 'execucao')})` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Recent OS */}
        <div className="card dashboard-recent-card">
          <h3 className="card-title">Ordens Recentes</h3>
          {recent.length === 0 ? (
            <p className="empty-msg">Nenhuma ordem registrada.</p>
          ) : (
            <div className="recent-list">
              {recent.map(os => {
                const cliente = clientes.find(c => c.id === os.clienteId);
                const veiculo = veiculos.find(v => v.id === os.veiculoId);
                const statusKey = os.status.toLowerCase().replace('aguardandoaprovacao', 'aguardando').replace('emexecucao', 'execucao');
                return (
                  <div key={os.id} className="recent-item">
                    <div className="recent-item-icon"><Wrench size={14} /></div>
                    <div className="recent-item-info">
                      <span className="recent-item-num">{os.numeroOS}</span>
                      <span className="recent-item-detail">
                        {cliente?.nome} — {veiculo?.marca} {veiculo?.modelo} ({veiculo?.placa})
                      </span>
                    </div>
                    <div className="recent-item-right">
                      <span className={`badge badge-${statusKey}`}>{STATUS_LABELS[os.status]}</span>
                      <span className="recent-item-date">{fmtDate(os.dataEntrada)}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Equipe */}
        <div className="card dashboard-team-card">
          <h3 className="card-title">Equipe Ativa</h3>
          <div className="team-list">
            {mecanicos.filter(m => m.ativo).map(m => {
              const osM = ordens.filter(o => o.mecanicoId === m.id && !['Entregue', 'Cancelado'].includes(o.status));
              return (
                <div key={m.id} className="team-item">
                  <div className="team-avatar">{m.nome.charAt(0)}</div>
                  <div className="team-info">
                    <span className="team-name">{m.nome}</span>
                    <span className="team-spec">{m.especialidade}</span>
                  </div>
                  <div className="team-os-count">
                    <span>{osM.length}</span>
                    <small>OS</small>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
