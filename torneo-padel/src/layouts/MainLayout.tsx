import { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Menu } from 'lucide-react';
import Sidebar from '@/layouts/Sidebar';

const pageTitles: Record<string, string> = {
  '/': 'Inicio',
  '/jugadores': 'Jugadores',
  '/torneos': 'Torneos',
  '/jornadas': 'Jornadas',
  '/ranking': 'Ranking',
};

function getPageTitle(pathname: string): string {
  if (pathname.startsWith('/jornadas/')) return 'Detalle de jornada';
  return pageTitles[pathname] ?? 'Torneo Pádel';
}

export default function MainLayout() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { pathname } = useLocation();
  const title = getPageTitle(pathname);

  return (
    <div className="flex min-h-screen bg-neutral-50 text-neutral-800">
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 flex items-center gap-3 border-b border-neutral-200 bg-white/90 px-4 py-3.5 backdrop-blur-md lg:px-6">
          <button
            onClick={() => setIsSidebarOpen(true)}
            className="rounded-lg p-1.5 text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900 lg:hidden"
            aria-label="Abrir menú"
          >
            <Menu size={22} />
          </button>

          <div className="min-w-0">
            <p className="text-[11px] font-medium uppercase tracking-wider text-neutral-400 lg:hidden">
              Torneo Pádel
            </p>
            <h1 className="truncate text-base font-semibold text-neutral-800 lg:text-lg">
              {title}
            </h1>
          </div>
        </header>

        <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-6 lg:px-6 lg:py-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}