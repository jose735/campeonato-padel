import { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuthStore } from '@/store/auth-store';

export default function LoginPage() {
  const role = useAuthStore((s) => s.role);
  const { loginAsGuest, loginAsAdmin } = useAuthStore();
  const [showAdminForm, setShowAdminForm] = useState(false);
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

  if (role) {
    return <Navigate to="/" replace />;
  }

  const handleAdminLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const ok = loginAsAdmin(password);
    if (!ok) {
      setError('Contraseña inválida');
      return;
    }
    setError(null);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-primary-900 px-4">
      <div className="w-full max-w-sm rounded-xl border border-primary-800 bg-white p-6 sm:p-8 shadow-lg">
        <h1 className="text-center text-2xl font-bold text-primary-900">Torneo Pádel</h1>
        <p className="mt-2 text-center text-sm text-neutral-500">
          Elige cómo quieres ingresar
        </p>

        {!showAdminForm ? (
          <div className="mt-8 flex flex-col gap-3">
            <button
              onClick={loginAsGuest}
              className="rounded-md bg-primary-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-primary-700 transition-colors"
            >
              Ingresar como invitado
            </button>
            <button
              onClick={() => {
                setShowAdminForm(true);
                setError(null);
                setPassword('');
              }}
              className="rounded-md border border-neutral-300 bg-white px-4 py-2.5 text-sm font-semibold text-neutral-700 hover:bg-neutral-100"
            >
              Ingresar como administrador
            </button>
          </div>
        ) : (
          <form onSubmit={handleAdminLogin} className="mt-8 flex flex-col gap-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-neutral-600">
                Contraseña de administrador
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setError(null);
                }}
                autoFocus
                className="w-full rounded-md border border-neutral-300 bg-white px-3 py-2.5 text-neutral-800 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              />
              {error && <p className="mt-1 text-sm text-danger-600">{error}</p>}
            </div>
            <button
              type="submit"
              className="rounded-md bg-primary-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-primary-700 transition-colors"
            >
              Entrar
            </button>
            <button
              type="button"
              onClick={() => {
                setShowAdminForm(false);
                setError(null);
                setPassword('');
              }}
              className="text-sm text-neutral-500 hover:text-neutral-800"
            >
              ← Volver
            </button>
          </form>
        )}
      </div>
    </div>
  );
}