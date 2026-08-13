import { useEffect } from 'react';
import { Users } from 'lucide-react';
import { usePlayerStore } from '@/store/player-store';
import { useAuthStore } from '@/store/auth-store';
import PlayerForm from '@/components/players/PlayerForm';
import PlayerList from '@/components/players/PlayerList';
import Card from '@/components/ui/Card';

export default function PlayersPage() {
  const { players, isLoading, fetchPlayers, createPlayer, deletePlayer } = usePlayerStore();
  const role = useAuthStore((s) => s.role);
  const isAdmin = role === 'admin';

  useEffect(() => {
    fetchPlayers();
  }, [fetchPlayers]);

  return (
    <div className="flex flex-col gap-8 lg:gap-6">
      <div>
        <h2 className="text-2xl font-semibold text-neutral-800">Jugadores</h2>
        <p className="mt-1 text-sm text-neutral-500">
          {isAdmin
            ? 'Alta y administración de jugadores del club.'
            : 'Consulta el listado de jugadores registrados.'}
        </p>
      </div>

      {isAdmin && (
        <Card title="Nuevo jugador" description="Nombre, apellido y apodo opcional.">
          <PlayerForm onSubmit={createPlayer} />
        </Card>
      )}

      <Card
        title="Listado"
        description={`${players.length} jugador${players.length === 1 ? '' : 'es'}.`}
      >
        {isLoading ? (
          <p className="text-sm text-neutral-500">Cargando...</p>
        ) : players.length === 0 ? (
          <div className="flex flex-col items-center gap-2 py-8 text-center">
            <Users className="text-neutral-300" size={32} />
            <p className="text-sm text-neutral-500">Aún no hay jugadores registrados.</p>
          </div>
        ) : (
          <PlayerList players={players} onDelete={isAdmin ? deletePlayer : undefined} />
        )}
      </Card>
    </div>
  );
}