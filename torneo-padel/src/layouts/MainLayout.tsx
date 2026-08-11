import { Outlet } from 'react-router-dom';
import Sidebar from '@/layouts/Sidebar';

export default function MainLayout() {
  return (
    <div className="flex min-h-screen bg-slate-950 text-slate-100">
      <Sidebar />

      <div className="flex flex-1 flex-col">
        <header className="border-b border-slate-800 px-6 py-4">
          <h1 className="text-xl font-bold">Torneo Padel</h1>
        </header>

        <main className="flex-1 px-6 py-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}