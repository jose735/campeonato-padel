import { useEffect } from 'react';
import { useTournamentStore } from '@/store/tournament-store';
import TournamentForm from '@/components/tournaments/TournamentForm';
import TournamentList from '@/components/tournaments/TournamentList';

export default function TournamentsPage() {
  const {
    tournaments,
    isLoading,
    fetchTournaments,
    createTournament,
    deleteTournament,
  } = useTournamentStore();

  useEffect(() => {
    fetchTournaments();
  }, [fetchTournaments]);

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h2 className="text-2xl font-semibold mb-4">Torneos</h2>
        <TournamentForm onSubmit={createTournament} />
      </div>

      <div>
        <h3 className="text-lg font-medium mb-2">Listado</h3>
        {isLoading ? (
          <p className="text-slate-500">Cargando...</p>
        ) : (
          <TournamentList tournaments={tournaments} onDelete={deleteTournament} />
        )}
      </div>
    </div>
  );
}