import { NavLink, useNavigate } from 'react-router-dom';
import { LayoutDashboard, FileText, Layers, Send, Mail, ListChecks, LogOut, FileSignature, Sun, Moon, X } from 'lucide-react';
import { useTheme } from '../../../context/ThemeContext';

const links = [
  { to: '/resume-builder', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/resume-builder/resumes', label: 'Resume Editor', icon: FileText },
  { to: '/resume-builder/variants', label: 'Resume Variants', icon: Layers },
  { to: '/resume-builder/apply', label: 'Apply', icon: Send },
  { to: '/resume-builder/applications', label: 'Applications', icon: ListChecks },
  { to: '/resume-builder/email-templates', label: 'Email Templates', icon: Mail },
];

export default function Sidebar({ open = false, onClose = () => {} }) {
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();

  const exit = () => {
    localStorage.removeItem('resume_token');
    localStorage.removeItem('token');
    navigate('/studio');
  };

  const itemCls = ({ isActive }) =>
    `flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
      isActive
        ? 'bg-accent/10 text-accent'
        : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5 hover:text-slate-900 dark:hover:text-white'
    }`;

  return (
    <aside
      className={`fixed lg:sticky top-0 left-0 z-40 h-screen w-60 shrink-0 p-4 flex flex-col bg-white dark:bg-[#0d0d0d] border-r border-slate-200 dark:border-white/10 transition-transform duration-300 ${
        open ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
      }`}
    >
      {/* Brand */}
      <div className="flex items-center gap-2.5 px-2 mb-8">
        <span className="w-8 h-8 rounded-lg bg-gradient-to-br from-accent to-violet-500 flex items-center justify-center text-white">
          <FileSignature size={17} />
        </span>
        <span className="text-base font-bold tracking-tight text-slate-900 dark:text-white">Resume OS</span>
        <button onClick={onClose} aria-label="Close menu" className="lg:hidden ml-auto p-1.5 -mr-1 rounded-lg text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5">
          <X size={18} />
        </button>
      </div>

      <nav className="space-y-1">
        {links.map(({ to, label, icon: Icon, end }) => (
          <NavLink key={to} to={to} end={end} onClick={onClose} className={itemCls}>
            <Icon size={18} />
            {label}
          </NavLink>
        ))}
      </nav>

      <div className="mt-auto pt-4 border-t border-slate-200 dark:border-white/10 space-y-1">
        <button
          onClick={toggleTheme}
          className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5 hover:text-slate-900 dark:hover:text-white w-full transition-colors"
        >
          {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
          {theme === 'dark' ? 'Light mode' : 'Dark mode'}
        </button>
        <button
          onClick={exit}
          className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5 hover:text-slate-900 dark:hover:text-white w-full transition-colors"
        >
          <LogOut size={18} />
          Exit to Studio
        </button>
      </div>
    </aside>
  );
}
