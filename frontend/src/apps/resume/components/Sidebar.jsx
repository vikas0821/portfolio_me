import { NavLink, useNavigate } from 'react-router-dom';
import { FileText, Send, Mail, ListChecks, LogOut, FileSignature, Sun, Moon, X } from 'lucide-react';
import { useTheme } from '../../../context/ThemeContext';

const links = [
  { to: '/resume-builder/resumes', label: 'Resume Editor', icon: FileText },
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
    `flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-bold transition-colors border-2 ${
      isActive
        ? 'bg-comic-yellow border-ink text-ink'
        : 'border-transparent text-ink/60 dark:text-white/60 hover:bg-ink/5 dark:hover:bg-white/5 hover:text-ink dark:hover:text-white'
    }`;

  return (
    <aside
      className={`fixed lg:sticky top-0 left-0 z-40 h-screen w-60 shrink-0 p-4 flex flex-col bg-paper border-r-[3px] border-ink dark:border-white/70 transition-transform duration-300 ${
        open ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
      }`}
    >
      {/* Brand */}
      <div className="flex items-center gap-2.5 px-2 mb-8">
        <span className="w-9 h-9 -rotate-6 rounded-xl bg-comic-yellow border-[3px] border-ink flex items-center justify-center text-ink">
          <FileSignature size={17} />
        </span>
        <span className="font-display text-lg tracking-wide text-ink dark:text-white">Resume OS</span>
        <button onClick={onClose} aria-label="Close menu" className="lg:hidden ml-auto p-1.5 -mr-1 rounded-lg text-ink/50 hover:bg-ink/5 dark:hover:bg-white/5">
          <X size={18} />
        </button>
      </div>

      <nav className="space-y-1.5">
        {links.map(({ to, label, icon: Icon, end }) => (
          <NavLink key={to} to={to} end={end} onClick={onClose} className={itemCls}>
            <Icon size={18} />
            {label}
          </NavLink>
        ))}
      </nav>

      <div className="mt-auto pt-4 border-t-[3px] border-ink dark:border-white/70 space-y-1.5">
        <button
          onClick={toggleTheme}
          className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-bold text-ink/60 dark:text-white/60 hover:bg-ink/5 dark:hover:bg-white/5 hover:text-ink dark:hover:text-white w-full transition-colors"
        >
          {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
          {theme === 'dark' ? 'Light mode' : 'Dark mode'}
        </button>
        <button
          onClick={exit}
          className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-bold text-comic-red hover:bg-comic-red/10 w-full transition-colors"
        >
          <LogOut size={18} />
          Exit to Studio
        </button>
      </div>
    </aside>
  );
}
