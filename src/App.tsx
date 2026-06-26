import { useState } from 'react';
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
import ThemeToggle from './components/ThemeToggle';

type Page = 'dashboard' | 'clientes' | 'carros' | 'mecanicos' | 'ordens' | 'produtos';

function MainApp() {
  const { usuario, loading } = useAuth();
  const [activePage, setActivePage] = useState<Page>('dashboard');

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

  // Se o usuário não for administrador, forçar para a página de Ordens de Serviço (única que ele tem acesso)
  const isUserAdmin = usuario.role === 'admin';
  const currentPage = !isUserAdmin ? 'ordens' : activePage;

  return (
    <div className="app-container">
      <Sidebar activePage={currentPage} onNavigate={setActivePage} />
      <ThemeToggle />
      <main className="main-content">
        {currentPage === 'dashboard' && <Dashboard />}
        {currentPage === 'clientes' && <Clientes />}
        {currentPage === 'carros' && <Carros />}
        {currentPage === 'mecanicos' && <Mecanicos />}
        {currentPage === 'ordens' && <OrdensServico />}
        {currentPage === 'produtos' && <Produtos />}
      </main>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppProvider>
        <MainApp />
      </AppProvider>
    </AuthProvider>
  );
}

