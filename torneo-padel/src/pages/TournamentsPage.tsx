import { useEffect } from 'react';
import { Trophy } from 'lucide-react';
import { useTournamentStore } from '@/store/tournament-store';
import { useAuthStore } from '@/store/auth-store';
import TournamentForm from '@/components/tournaments/TournamentForm';
import TournamentList from '@/components/tournaments/TournamentList';
import Card from '@/components/ui/Card';

export default function TournamentsPage() {
  const role = useAuthStore((s) => s.role);
  const isAdmin = role === 'admin';
  const { tournaments, isLoading, fetchTournaments, createTournament, deleteTournament } =
    useTournamentStore();

  useEffect(() => {
    fetchTournaments();
  }, [fetchTournaments]);

  return (
    <div className="flex flex-col gap-8 lg:gap-6">
      <div>
        <h2 className="text-2xl font-semibold text-neutral-800">Torneos</h2>
        <p className="mt-1 text-sm text-neutral-500">
          {isAdmin
            ? 'Creá y administrá los torneos del club.'
            : 'Consulta los torneos disponibles.'}
        </p>
      </div>

      {isAdmin && (
        <Card title="Nuevo torneo" description="Una descripción corta alcanza.">
          <TournamentForm onSubmit={createTournament} />
        </Card>
      )}

      <Card
        title="Listado"
        description={`${tournaments.length} torneo${tournaments.length === 1 ? '' : 's'}.`}
      >
        {isLoading ? (
          <p className="text-sm text-neutral-500">Cargando...</p>
        ) : tournaments.length === 0 ? (
          <div className="flex flex-col items-center gap-2 py-8 text-center">
            <Trophy className="text-neutral-300" size={32} />
            <p className="text-sm text-neutral-500">Aún no hay torneos registrados.</p>
          </div>
        ) : (
          <TournamentList
            tournaments={tournaments}
            onDelete={isAdmin ? deleteTournament : undefined}
          />
        )}
      </Card>
    </div>
  );
}