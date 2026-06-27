import { useEffect, useState } from 'react';
import { Sun, Moon } from 'lucide-react';
import '../styles/components/ThemeToggle.css';

export default function ThemeToggle() {
  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
    const saved = localStorage.getItem('theme');
    if (saved === 'light' || saved === 'dark') return saved;
    // Check system preference
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches) {
      return 'light';
    }
    return 'dark';
  });

  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'light') {
      root.classList.add('light');
      root.style.backgroundColor = '#f8fafc';
    } else {
      root.classList.remove('light');
      root.style.backgroundColor = '#0b0f19';
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  };

  return (
    <button 
      className="theme-toggle" 
      onClick={toggleTheme} 
      title={theme === 'dark' ? 'Mudar para tema claro' : 'Mudar para tema escuro'}
      aria-label="Alternar tema de cores"
    >
      {theme === 'dark' ? (
        <Moon className="theme-toggle-icon icon-moon" size={20} />
      ) : (
        <Sun className="theme-toggle-icon icon-sun" size={20} />
      )}
    </button>
  );
}
