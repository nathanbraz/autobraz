import { useState } from 'react';
import { Wrench, Eye, EyeOff, AlertCircle, Loader2 } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import '../styles/pages/Login.css';

export default function Login() {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [showSenha, setShowSenha] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !senha) { setError('Preencha e-mail e senha.'); return; }
    setLoading(true);
    setError('');
    const result = await login(email, senha);
    if (!result.success) setError(result.error ?? 'Erro desconhecido.');
    setLoading(false);
  };

  return (
    <div className="login-page">
      <div className="login-bg">
        <div className="login-bg-grid" />
        <div className="login-bg-glow" />
      </div>

      <div className="login-card">
        {/* Logo */}
        <div className="login-logo">
          <div className="login-logo-icon"><Wrench size={26} /></div>
          <div>
            <h1 className="login-logo-name">AutoBraz</h1>
            <p className="login-logo-sub">Sistema de Gestão de OS</p>
          </div>
        </div>

        <h2 className="login-title">Bem-vindo de volta</h2>
        <p className="login-subtitle">Entre com suas credenciais para continuar</p>

        <form className="login-form" onSubmit={handleSubmit} noValidate>
          {error && (
            <div className="login-error" role="alert">
              <AlertCircle size={16} />
              <span>{error}</span>
            </div>
          )}

          <div className="form-group">
            <label className="form-label" htmlFor="login-email">E-mail</label>
            <input
              id="login-email"
              type="email"
              className="form-control"
              placeholder="seu@email.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              autoComplete="email"
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="login-senha">Senha</label>
            <div className="login-password-wrapper">
              <input
                id="login-senha"
                type={showSenha ? 'text' : 'password'}
                className="form-control login-password-input"
                placeholder="••••••••"
                value={senha}
                onChange={e => setSenha(e.target.value)}
                autoComplete="current-password"
                disabled={loading}
              />
              <button
                type="button"
                className="login-password-toggle"
                onClick={() => setShowSenha(v => !v)}
                tabIndex={-1}
                aria-label={showSenha ? 'Ocultar senha' : 'Mostrar senha'}
              >
                {showSenha ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <button id="login-btn" type="submit" className="btn btn-primary login-btn" disabled={loading}>
            {loading ? <><Loader2 size={16} className="spin" /> Entrando...</> : 'Entrar'}
          </button>
        </form>

        <div className="login-hint">
          <p>Desenvolvimento local — credenciais de teste:</p>
          <code>admin@autobraz.com / admin123</code>
          <code>joao@autobraz.com / mecanico123</code>
        </div>
      </div>
    </div>
  );
}
