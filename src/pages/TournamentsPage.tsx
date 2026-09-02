import { useEffect, useState } from 'react';
import { Trophy } from 'lucide-react';
import { useTournamentStore } from '@/store/tournament-store';
import { useAuthStore } from '@/store/auth-store';
import { can } from '@/lib/permissions';
import { getCurrentTournamentId } from '@/services/journeyService';
import TournamentForm from '@/components/tournaments/TournamentForm';
import TournamentList from '@/components/tournaments/TournamentList';
import Card from '@/components/ui/Card';

export default function TournamentsPage() {
  const role = useAuthStore((s) => s.role);
  const canManage = can.manageTournaments(role);
  const {
    tournaments,
    isLoading,
    fetchTournaments,
    createTournament,
    updateTournament,
    deleteTournament,
  } = useTournamentStore();
  const [currentTournamentId, setCurrentTournamentId] = useState<number | null>(null);

  useEffect(() => {
    fetchTournaments();

    let cancelled = false;
    void getCurrentTournamentId()
      .then((id) => {
        if (!cancelled) setCurrentTournamentId(id);
      })
      .catch(console.error);

    return () => {
      cancelled = true;
    };
  }, [fetchTournaments]);

  return (
    <div className="flex flex-col gap-8 lg:gap-6">
      <div>
        <h2 className="text-2xl font-semibold text-neutral-800">Torneos</h2>
        <p className="mt-1 text-sm text-neutral-500">
          {canManage
            ? 'Creá y administrá los torneos del club.'
            : 'Consulta los torneos disponibles.'}
        </p>
      </div>

      {canManage && (
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
            currentTournamentId={currentTournamentId}
            onUpdate={canManage ? updateTournament : undefined}
            onDelete={canManage ? deleteTournament : undefined}
          />
        )}
      </Card>
    </div>
  );
}
