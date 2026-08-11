import { useEffect } from 'react';
import { usePlayerStore } from '@/store/player-store';
import PlayerForm from '@/components/players/PlayerForm';
import PlayerList from '@/components/players/PlayerList';

export default function PlayersPage() {
  const { players, isLoading, fetchPlayers, createPlayer, deletePlayer } = usePlayerStore();

  useEffect(() => {
    fetchPlayers();
  }, [fetchPlayers]);

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h2 className="text-2xl font-semibold mb-4">Jugadores</h2>
        <PlayerForm onSubmit={createPlayer} />
      </div>

      <div>
        <h3 className="text-lg font-medium mb-2">Listado</h3>
        {isLoading ? (
          <p className="text-slate-500">Cargando...</p>
        ) : (
          <PlayerList players={players} onDelete={deletePlayer} />
        )}
      </div>
    </div>
  );
}