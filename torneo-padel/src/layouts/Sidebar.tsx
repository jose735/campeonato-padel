import { NavLink } from 'react-router-dom';

type NavItem = {
  label: string;
  path?: string;
};

const navItems: NavItem[] = [
  { label: 'Inicio', path: '/' },
  { label: 'Jugadores', path: '/jugadores' },
  { label: 'Torneos', path: '/torneos' },
  { label: 'Jornadas', path: '/jornadas' },
  { label: 'Ranking', path: '/ranking' },
];

export default function Sidebar() {
  return (
    <aside className="w-56 shrink-0 border-r border-slate-800 bg-slate-900 px-4 py-6">
      <nav className="flex flex-col gap-1">
        {navItems.map((item) =>
          item.path ? (
            <NavLink
              key={item.label}
              to={item.path}
              end={item.path === '/'}
              className={({ isActive }) =>
                `rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-emerald-600 text-white'
                    : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                }`
              }
            >
              {item.label}
            </NavLink>
          ) : (
            <span
              key={item.label}
              className="cursor-not-allowed rounded-md px-3 py-2 text-sm font-medium text-slate-600"
              title="Próximamente"
            >
              {item.label}
            </span>
          )
        )}
      </nav>
    </aside>
  );
}