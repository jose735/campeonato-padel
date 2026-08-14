import { Link } from 'react-router-dom';
import { CalendarDays, Trophy, Users, BarChart3, ArrowRight } from 'lucide-react';
import { useAuthStore } from '@/store/auth-store';
import Card from '@/components/ui/Card';

const links = [
  {
    title: 'Jornadas',
    description: 'Creá jornadas, cargá marcadores y consultá la tabla de cada fecha.',
    to: '/jornadas',
    icon: CalendarDays,
  },
  {
    title: 'Ranking',
    description: 'Ranking general del torneo con todas las jornadas acumuladas.',
    to: '/ranking',
    icon: BarChart3,
  },
  {
    title: 'Jugadores',
    description: 'Consultá el listado de jugadores del club.',
    to: '/jugadores',
    icon: Users,
  },
  {
    title: 'Torneos',
    description: 'Revisá los torneos disponibles.',
    to: '/torneos',
    icon: Trophy,
  },
];

export default function HomePage() {
  const role = useAuthStore((s) => s.role);

  const sessionLabel =
    role === 'admin'
      ? 'Sesión de administrador'
      : role === 'coordinador'
        ? 'Sesión de coordinador'
        : 'Sesión de invitado';

  return (
    <div className="flex flex-col gap-8 lg:gap-6">
      <section className="rounded-xl border border-neutral-200 bg-white p-6 shadow-sm sm:p-8">
        <p className="text-sm font-medium text-primary-600">{sessionLabel}</p>
        <h2 className="mt-1 text-2xl font-semibold text-neutral-800 sm:text-3xl">
          Bienvenido a Torneo Pádel
        </h2>
        <p className="mt-2 max-w-2xl text-neutral-500">
          Gestioná jugadores, torneos, jornadas y rankings desde un solo lugar.
        </p>
      </section>

      <section className="grid gap-4 sm:grid-cols-2">
        {links.map(({ title, description, to, icon: Icon }) => (
          <Link key={to} to={to} className="group">
            <Card className="h-full transition-shadow group-hover:shadow-md">
              <div className="flex items-start gap-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary-50 text-primary-600">
                  <Icon size={20} />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="font-semibold text-neutral-800">{title}</h3>
                    <ArrowRight
                      size={16}
                      className="text-neutral-300 transition-transform group-hover:translate-x-0.5 group-hover:text-primary-600"
                    />
                  </div>
                  <p className="mt-1 text-sm text-neutral-500">{description}</p>
                </div>
              </div>
            </Card>
          </Link>
        ))}
      </section>
    </div>
  );
}