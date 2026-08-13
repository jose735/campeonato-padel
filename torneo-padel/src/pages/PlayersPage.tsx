import { useEffect } from 'react';
import { usePlayerStore } from '@/store/player-store';
import PlayerForm from '@/components/players/PlayerForm';
import PlayerList from '@/components/players/PlayerList';
import { useAuthStore } from '@/store/auth-store';

export default function PlayersPage() {
  const { players, isLoading, fetchPlayers, createPlayer, deletePlayer } = usePlayerStore();
  const role = useAuthStore((s) => s.role);
  const isAdmin = role === 'admin';

  useEffect(() => {
    fetchPlayers();
  }, [fetchPlayers]);

  return (
    <div className="flex flex-col gap-8 lg:gap-6">
      {isAdmin ? (
        <div>
          <h2 className="text-2xl font-semibold text-neutral-800 mb-4">Jugadores</h2>
          <PlayerForm onSubmit={createPlayer} />
        </div>
      ) : (
        <h2 className="text-2xl font-semibold text-neutral-800">Jugadores</h2>
      )}

      <div>
        <h3 className="text-lg font-medium text-neutral-800 mb-2">Listado</h3>
        {isLoading ? (
          <p className="text-neutral-500">Cargando...</p>
        ) : (
          <PlayerList players={players} onDelete={isAdmin ? deletePlayer : undefined} />
        )}
      </div>
    </div>
  );
}