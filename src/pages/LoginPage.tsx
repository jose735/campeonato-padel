import { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { Trophy, ShieldCheck, ArrowLeft, LogIn } from 'lucide-react';
import { useAuthStore } from '@/store/auth-store';
import TextField from '@/components/ui/TextField';
import Button from '@/components/ui/Button';

export default function LoginPage() {
  const role = useAuthStore((s) => s.role);
  const { loginAsGuest, loginAsAdmin } = useAuthStore();
  const [showAdminForm, setShowAdminForm] = useState(false);
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (role) {
    return <Navigate to="/" replace />;
  }

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    const ok = loginAsAdmin(password);
    setIsSubmitting(false);

    if (!ok) {
      setError('Contraseña inválida');
      return;
    }
    setError(null);
  };

  return (
    <div className="flex min-h-screen">
      {/* Panel de marca — solo visible desde lg */}
      <div className="relative hidden w-1/2 flex-col justify-between overflow-hidden bg-primary-900 p-10 text-white lg:flex">
        {/* Patrón decorativo sutil */}
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.07]"
          style={{
            backgroundImage:
              'radial-gradient(circle at 2px 2px, white 1.5px, transparent 0)',
            backgroundSize: '28px 28px',
          }}
        />

        <div className="relative flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/10">
            <Trophy size={18} />
          </div>
          <span className="text-lg font-bold">Torneo Pádel</span>
        </div>

        <div className="relative max-w-sm">
          <h2 className="text-3xl font-bold leading-tight">
            Organiza tus torneos de pádel sin complicaciones.
          </h2>
          <p className="mt-4 text-primary-200">
            Jugadores, jornadas, marcadores y ranking, todo en un solo lugar.
          </p>
        </div>

        <p className="relative text-sm text-primary-300">
          © {new Date().getFullYear()} Torneo Pádel
        </p>
      </div>

      {/* Panel de formulario */}
      <div className="flex w-full flex-col items-center justify-center bg-neutral-50 px-4 py-12 lg:w-1/2">
        <div className="w-full max-w-sm">
          {/* Logo visible solo en mobile/tablet, donde no hay panel de marca */}
          <div className="mb-8 flex items-center justify-center gap-2 lg:hidden">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary-600 text-white">
              <Trophy size={20} />
            </div>
            <span className="text-xl font-bold text-primary-900">Torneo Pádel</span>
          </div>

          <div className="rounded-xl border border-neutral-200 bg-white p-6 shadow-sm sm:p-8">
            <h1 className="text-xl font-semibold text-neutral-800">
              {showAdminForm ? 'Acceso de administrador' : 'Bienvenido'}
            </h1>
            <p className="mt-1 text-sm text-neutral-500">
              {showAdminForm
                ? 'Ingresa la contraseña para gestionar la app.'
                : 'Elige cómo quieres ingresar.'}
            </p>

            {!showAdminForm ? (
              <div className="mt-6 flex flex-col gap-3">
                <Button onClick={loginAsGuest} icon={LogIn} className="w-full">
                  Ingresar como invitado
                </Button>
                <Button
                  variant="secondary"
                  icon={ShieldCheck}
                  className="w-full"
                  onClick={() => {
                    setShowAdminForm(true);
                    setError(null);
                    setPassword('');
                  }}
                >
                  Ingresar como administrador
                </Button>
              </div>
            ) : (
              <form onSubmit={handleAdminLogin} className="mt-6 flex flex-col gap-4">
                <TextField
                  label="Contraseña de administrador"
                  type="password"
                  autoFocus
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setError(null);
                  }}
                  error={error ?? undefined}
                />

                <Button type="submit" icon={ShieldCheck} isLoading={isSubmitting} className="w-full">
                  Entrar
                </Button>

                <button
                  type="button"
                  onClick={() => {
                    setShowAdminForm(false);
                    setError(null);
                    setPassword('');
                  }}
                  className="inline-flex items-center gap-1.5 self-center text-sm text-neutral-500 hover:text-neutral-800"
                >
                  <ArrowLeft size={14} />
                  Volver
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}