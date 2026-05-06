import { NavLink } from 'react-router-dom';
import {
  Calendar,
  BookOpen,
  DoorOpen,
  Users,
  BarChart2,
  Settings,
  LogOut,
  Building2,
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

const navItems = [
  { to: '/dashboard', icon: Calendar, label: 'Calendário' },
  { to: '/bookings', icon: BookOpen, label: 'Reservas' },
  { to: '/rooms', icon: DoorOpen, label: 'Salas' },
];

const adminItems = [
  { to: '/users', icon: Users, label: 'Usuários' },
  { to: '/reports', icon: BarChart2, label: 'Relatórios' },
];

const bottomItems = [
  { to: '/settings', icon: Settings, label: 'Configurações' },
];

export function Sidebar() {
  const { logout, isAdmin } = useAuth();

  const linkClass = ({ isActive }: { isActive: boolean }) =>
    `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 ${
      isActive
        ? 'bg-blue-600 text-white shadow-sm'
        : 'text-slate-400 hover:bg-white/10 hover:text-white'
    }`;

  return (
    <aside className="flex flex-col w-64 min-h-screen bg-slate-900 px-3 py-5 shrink-0">
      <div className="flex items-center gap-3 px-3 mb-8">
        <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center shrink-0">
          <Building2 className="w-5 h-5 text-white" />
        </div>
        <div>
          <span className="font-bold text-white text-sm tracking-tight">MeetRoom</span>
          <p className="text-xs text-slate-500 leading-none mt-0.5">Reserva de Salas</p>
        </div>
      </div>

      <nav className="flex flex-col gap-1 flex-1">
        <p className="text-xs font-semibold text-slate-600 uppercase tracking-wider px-3 mb-2">
          Principal
        </p>

        {navItems.map(({ to, icon: Icon, label }) => (
          <NavLink key={to} to={to} className={linkClass}>
            <Icon className="w-4 h-4 shrink-0" />
            {label}
          </NavLink>
        ))}

        {isAdmin && (
          <>
            <p className="text-xs font-semibold text-slate-600 uppercase tracking-wider px-3 mt-6 mb-2">
              Administração
            </p>
            {adminItems.map(({ to, icon: Icon, label }) => (
              <NavLink key={to} to={to} className={linkClass}>
                <Icon className="w-4 h-4 shrink-0" />
                {label}
              </NavLink>
            ))}
          </>
        )}
      </nav>

      <div className="flex flex-col gap-1 border-t border-slate-700/60 pt-3 mt-3">
        {bottomItems.map(({ to, icon: Icon, label }) => (
          <NavLink key={to} to={to} className={linkClass}>
            <Icon className="w-4 h-4 shrink-0" />
            {label}
          </NavLink>
        ))}
        <button
          onClick={logout}
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-slate-400 hover:bg-red-500/10 hover:text-red-400 transition-all duration-150 w-full"
        >
          <LogOut className="w-4 h-4 shrink-0" />
          Sair
        </button>
      </div>
    </aside>
  );
}
