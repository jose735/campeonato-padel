import { NavLink } from 'react-router-dom';
import { X } from 'lucide-react';
import { useAuthStore } from '@/store/auth-store';

type NavItem = {
  label: string;
  path: string;
};

const navItems: NavItem[] = [
  { label: 'Inicio', path: '/' },
  { label: 'Jugadores', path: '/jugadores' },
  { label: 'Torneos', path: '/torneos' },
  { label: 'Jornadas', path: '/jornadas' },
  { label: 'Ranking', path: '/ranking' },
];

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
  const role = useAuthStore((s) => s.role);
  const logout = useAuthStore((s) => s.logout);

  return (
    <>
      {/* Overlay solo en mobile/tablet cuando el sidebar está abierto */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/40 lg:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-64 shrink-0 flex-col border-r border-neutral-200 bg-white px-4 py-6 transition-transform duration-200 lg:static lg:w-56 lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="mb-6 flex items-center justify-between lg:hidden">
          <span className="font-semibold text-primary-900">Menú</span>
          <button onClick={onClose} className="text-neutral-500 hover:text-neutral-800">
            <X size={20} />
          </button>
        </div>

        <nav className="flex flex-col gap-1">
          {navItems.map((item) => (
            <NavLink
              key={item.label}
              to={item.path}
              end={item.path === '/'}
              onClick={onClose}
              className={({ isActive }) =>
                `rounded-md px-3 py-2.5 text-sm font-medium transition-colors lg:py-2 ${
                  isActive
                    ? 'bg-primary-600 text-white'
                    : 'text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900'
                }`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="mt-auto border-t border-neutral-200 pt-4">
          <p className="mb-2 px-3 text-xs text-neutral-400">
            {role === 'admin' ? 'Administrador' : 'Invitado'}
          </p>
          <button
            onClick={logout}
            className="w-full rounded-md px-3 py-2.5 text-left text-sm text-neutral-500 hover:bg-neutral-100 hover:text-neutral-900 lg:py-2"
          >
            Cerrar sesión
          </button>
        </div>
      </aside>
    </>
  );
}