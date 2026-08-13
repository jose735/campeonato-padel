import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Menu } from 'lucide-react';
import Sidebar from '@/layouts/Sidebar';

export default function MainLayout() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-neutral-50 text-neutral-800">
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex items-center gap-3 border-b border-neutral-200 bg-white px-4 py-4 lg:px-6">
          <button
            onClick={() => setIsSidebarOpen(true)}
            className="text-neutral-600 hover:text-neutral-900 lg:hidden"
            aria-label="Abrir menú"
          >
            <Menu size={22} />
          </button>
          <h1 className="text-lg font-bold text-primary-900 lg:text-xl">Torneo Padel</h1>
        </header>

        <main className="flex-1 px-4 py-6 lg:px-6 lg:py-4">
          <Outlet />
        </main>
      </div>
    </div>
  );
}