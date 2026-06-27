import { LayoutDashboard, Users, Car, Wrench, ClipboardList, LogOut, Menu, X, Package } from 'lucide-react';
import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import ThemeToggle from './ThemeToggle';
import { NavLink, useNavigate } from 'react-router-dom';
import '../styles/components/Sidebar.css';

const allItems = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, path: '/', adminOnly: true },
  { id: 'clientes', label: 'Clientes', icon: Users, path: '/clientes', adminOnly: true },
  { id: 'carros', label: 'Veículos', icon: Car, path: '/carros', adminOnly: true },
  { id: 'produtos', label: 'Produtos', icon: Package, path: '/produtos', adminOnly: true },
  { id: 'mecanicos', label: 'Equipe', icon: Wrench, path: '/mecanicos', adminOnly: true },
  { id: 'ordens', label: 'Ordens de Serviço', icon: ClipboardList, path: '/ordens', adminOnly: false },
];

export default function Sidebar() {
  const { usuario, logout, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  const items = allItems.filter(i => !i.adminOnly || isAdmin);

  const handleLogout = () => {
    logout();
    navigate('/');
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
          {items.map(({ id, label, icon: Icon, path }) => (
            <NavLink
              key={id}
              to={path}
              className={({ isActive }) => `sidebar-item ${isActive ? 'sidebar-item--active' : ''}`}
              onClick={() => setOpen(false)}
            >
              <Icon size={18} />
              <span>{label}</span>
            </NavLink>
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
            <button className="sidebar-logout" onClick={handleLogout} title="Sair">
              <LogOut size={18} />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
