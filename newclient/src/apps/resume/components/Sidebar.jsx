import { NavLink, useNavigate } from 'react-router-dom';
import { LayoutDashboard, FileText, Layers, Send, Mail, ListChecks, LogOut } from 'lucide-react';

const links = [
  { to: '/resume-builder', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/resume-builder/resumes', label: 'Resume Editor', icon: FileText },
  { to: '/resume-builder/variants', label: 'Resume Variants', icon: Layers },
  { to: '/resume-builder/apply', label: 'Apply', icon: Send },
  { to: '/resume-builder/applications', label: 'Applications', icon: ListChecks },
  { to: '/resume-builder/email-templates', label: 'Email Templates', icon: Mail },
];

export default function Sidebar() {
  const navigate = useNavigate();

  const exit = () => {
    localStorage.removeItem('resume_token');
    localStorage.removeItem('token');
    navigate('/');
  };

  return (
    <aside className="w-60 shrink-0 bg-gray-900 text-gray-100 min-h-screen p-4 border-r border-gray-800">
      <div className="text-xl font-bold mb-8 px-2 tracking-tight">Resume OS</div>
      <nav className="space-y-1">
        {links.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                isActive ? 'bg-gray-700 text-white shadow-sm' : 'text-gray-400 hover:bg-gray-800 hover:text-gray-100'
              }`
            }
          >
            <Icon size={18} />
            {label}
          </NavLink>
        ))}
      </nav>
      <div className="mt-4 pt-4 border-t border-gray-800 space-y-1">
        <button
          onClick={exit}
          className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-gray-400 hover:bg-gray-800 hover:text-gray-100 w-full transition-colors"
        >
          <LogOut size={18} />
          Exit to portfolio
        </button>
      </div>
    </aside>
  );
}
