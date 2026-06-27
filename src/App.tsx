import { AuthProvider, useAuth } from './contexts/AuthContext';
import { AppProvider } from './contexts/AppContext';
import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import Clientes from './pages/Clientes';
import Carros from './pages/Carros';
import Mecanicos from './pages/Mecanicos';
import OrdensServico from './pages/OrdensServico';
import Produtos from './pages/Produtos';
import Login from './pages/Login';
import { ToastProvider } from './contexts/ToastContext';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

function MainApp() {
  const { usuario, loading } = useAuth();

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', backgroundColor: '#0b0f19', color: '#f8fafc' }}>
        Carregando...
      </div>
    );
  }

  if (!usuario) {
    return <Login />;
  }

  const isUserAdmin = usuario.role === 'admin';

  return (
    <div className="app-container">
      <Sidebar />
      <main className="main-content">
        <Routes>
          {isUserAdmin ? (
            <>
              <Route path="/" element={<Dashboard />} />
              <Route path="/clientes" element={<Clientes />} />
              <Route path="/carros" element={<Carros />} />
              <Route path="/mecanicos" element={<Mecanicos />} />
              <Route path="/produtos" element={<Produtos />} />
              <Route path="/ordens" element={<OrdensServico />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </>
          ) : (
            <>
              <Route path="/ordens" element={<OrdensServico />} />
              <Route path="*" element={<Navigate to="/ordens" replace />} />
            </>
          )}
        </Routes>
      </main>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppProvider>
          <ToastProvider>
            <MainApp />
          </ToastProvider>
        </AppProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

