import { useEffect } from 'react';
import { useTournamentStore } from '@/store/tournament-store';
import TournamentForm from '@/components/tournaments/TournamentForm';
import TournamentList from '@/components/tournaments/TournamentList';
import { useAuthStore } from '@/store/auth-store';

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
      {isAdmin ? (
        <div>
          <h2 className="text-2xl font-semibold text-neutral-800 mb-4">Torneos</h2>
          <TournamentForm onSubmit={createTournament} />
        </div>
      ) : (
        <h2 className="text-2xl font-semibold text-neutral-800">Torneos</h2>
      )}

      <div>
        <h3 className="text-lg font-medium text-neutral-800 mb-2">Listado</h3>
        {isLoading ? (
          <p className="text-neutral-500">Cargando...</p>
        ) : (
          <TournamentList
            tournaments={tournaments}
            onDelete={isAdmin ? deleteTournament : undefined}
          />
        )}
      </div>
    </div>
  );
}