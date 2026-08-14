import { NavLink } from 'react-router-dom';
import {
  X,
  Home,
  Users,
  Trophy,
  CalendarDays,
  BarChart3,
  LogOut,
  ShieldCheck,
  UserRound,
  UserCog,
} from 'lucide-react';
import { useAuthStore } from '@/store/auth-store';

type NavItem = {
  label: string;
  path: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
};

const navItems: NavItem[] = [
  { label: 'Inicio', path: '/', icon: Home },
  { label: 'Jugadores', path: '/jugadores', icon: Users },
  { label: 'Torneos', path: '/torneos', icon: Trophy },
  { label: 'Jornadas', path: '/jornadas', icon: CalendarDays },
  { label: 'Ranking', path: '/ranking', icon: BarChart3 },
];

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
  const role = useAuthStore((s) => s.role);
  const logout = useAuthStore((s) => s.logout);

  const roleLabel =
    role === 'admin'
      ? 'Administrador'
      : role === 'coordinador'
        ? 'Coordinador'
        : 'Invitado';

  const roleDescription =
    role === 'admin'
      ? 'Acceso completo'
      : role === 'coordinador'
        ? 'Gestión de jornadas'
        : 'Solo consulta';

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/40 backdrop-blur-[1px] lg:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-64 shrink-0 flex-col border-r border-neutral-200 bg-white transition-transform duration-200 lg:static lg:w-60 lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand */}
        <div className="flex items-center justify-between border-b border-neutral-100 px-5 py-5">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary-600 text-white shadow-sm">
              <Trophy size={18} />
            </div>
            <div>
              <p className="text-sm font-bold text-primary-900">Torneo Pádel</p>
              <p className="text-[11px] text-neutral-400">Gestión de torneos</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-md p-1.5 text-neutral-400 hover:bg-neutral-100 hover:text-neutral-700 lg:hidden"
            aria-label="Cerrar menú"
          >
            <X size={18} />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex flex-1 flex-col gap-1 px-3 py-4">
          <p className="mb-2 px-3 text-[11px] font-semibold uppercase tracking-wider text-neutral-400">
            Menú
          </p>
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.label}
                to={item.path}
                end={item.path === '/'}
                onClick={onClose}
                className={({ isActive }) =>
                  `group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-primary-600 text-white shadow-sm'
                      : 'text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <Icon
                      size={18}
                      className={
                        isActive
                          ? 'text-white'
                          : 'text-neutral-400 group-hover:text-neutral-600'
                      }
                    />
                    {item.label}
                  </>
                )}
              </NavLink>
            );
          })}
        </nav>

        {/* Footer sesión */}
        <div className="border-t border-neutral-100 p-4">
          <div className="mb-3 flex items-center gap-3 rounded-lg bg-neutral-50 px-3 py-2.5">
            <div
              className={`flex h-8 w-8 items-center justify-center rounded-full ${
                role === 'admin'
                  ? 'bg-primary-100 text-primary-700'
                  : role === 'coordinador'
                    ? 'bg-accent-100 text-accent-700'
                    : 'bg-neutral-200 text-neutral-600'
              }`}
            >
              {role === 'admin' ? (
                <ShieldCheck size={16} />
              ) : role === 'coordinador' ? (
                <UserCog size={16} />
              ) : (
                <UserRound size={16} />
              )}
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-medium text-neutral-800">
                {roleLabel}
              </p>
              <p className="text-[11px] text-neutral-400">{roleDescription}</p>
            </div>
          </div>

          <button
            onClick={logout}
            className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm font-medium text-neutral-500 transition-colors hover:bg-danger-50 hover:text-danger-600"
          >
            <LogOut size={16} />
            Cerrar sesión
          </button>
        </div>
      </aside>
    </>
  );
}