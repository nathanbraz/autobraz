import { LayoutDashboard, Users, Car, Wrench, ClipboardList, LogOut, Menu, X, Package } from 'lucide-react';
import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import ThemeToggle from './ThemeToggle';
import '../styles/components/Sidebar.css';

type Page = 'dashboard' | 'clientes' | 'carros' | 'mecanicos' | 'ordens' | 'produtos';

interface SidebarProps {
  activePage: Page;
  onNavigate: (page: Page) => void;
}

const allItems = [
  { id: 'dashboard' as Page, label: 'Dashboard', icon: LayoutDashboard, adminOnly: true },
  { id: 'clientes' as Page, label: 'Clientes', icon: Users, adminOnly: true },
  { id: 'carros' as Page, label: 'Veículos', icon: Car, adminOnly: true },
  { id: 'produtos' as Page, label: 'Produtos', icon: Package, adminOnly: true },
  { id: 'mecanicos' as Page, label: 'Equipe', icon: Wrench, adminOnly: true },
  { id: 'ordens' as Page, label: 'Ordens de Serviço', icon: ClipboardList, adminOnly: false },
];

export default function Sidebar({ activePage, onNavigate }: SidebarProps) {
  const { usuario, logout, isAdmin } = useAuth();
  const [open, setOpen] = useState(false);

  const items = allItems.filter(i => !i.adminOnly || isAdmin);

  const handleNav = (page: Page) => {
    onNavigate(page);
    setOpen(false);
  };

  return (
    <>
      {/* Mobile toggle */}
      <button 
        className={`sidebar-mobile-toggle no-print ${open ? 'sidebar-mobile-toggle--open' : ''}`} 
        onClick={() => setOpen(o => !o)} 
        aria-label="Menu"
      >
        {open ? <X size={22} /> : <Menu size={22} />}
      </button>

      {/* Overlay */}
      {open && <div className="sidebar-overlay" onClick={() => setOpen(false)} />}

      <aside className={`sidebar no-print ${open ? 'sidebar--open' : ''}`}>
        {/* Logo */}
        <div className="sidebar-logo">
          <div className="sidebar-logo-icon">
            <Wrench size={20} />
          </div>
          <div>
            <span className="sidebar-logo-name">AutoBraz</span>
            <span className="sidebar-logo-sub">Gestão de OS</span>
          </div>
        </div>

        {/* Nav */}
        <nav className="sidebar-nav">
          {items.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              className={`sidebar-item ${activePage === id ? 'sidebar-item--active' : ''}`}
              onClick={() => handleNav(id)}
            >
              <Icon size={18} />
              <span>{label}</span>
            </button>
          ))}
        </nav>

        {/* User */}
        <div className="sidebar-footer">
          <div className="sidebar-user">
            <div className="sidebar-user-avatar">
              {usuario?.nome.charAt(0).toUpperCase()}
            </div>
            <div className="sidebar-user-info">
              <span className="sidebar-user-name">{usuario?.nome}</span>
              <span className="sidebar-user-role">
                {usuario?.role === 'admin' ? 'Administrador' : 'Mecânico'}
              </span>
            </div>
          </div>
          <div className="sidebar-actions">
            <ThemeToggle />
            <button className="sidebar-logout" onClick={logout} title="Sair">
              <LogOut size={18} />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
