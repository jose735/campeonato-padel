import { useEffect, useState } from 'react';
import { Users } from 'lucide-react';
import { usePlayerStore } from '@/store/player-store';
import { useAuthStore } from '@/store/auth-store';
import { can } from '@/lib/permissions';
import type { Player } from '@/types';
import type { CreatePlayerFormData } from '@/schemas/general-schemas';
import PlayerForm from '@/components/players/PlayerForm';
import PlayerList from '@/components/players/PlayerList';
import Card from '@/components/ui/Card';

export default function PlayersPage() {
  const { players, isLoading, fetchPlayers, createPlayer, updatePlayer, deletePlayer } =
    usePlayerStore();
  const role = useAuthStore((s) => s.role);
  const canManage = can.managePlayers(role);

  const [editingPlayer, setEditingPlayer] = useState<Player | null>(null);

  useEffect(() => {
    fetchPlayers();
  }, [fetchPlayers]);

  const handleSubmit = async (data: CreatePlayerFormData) => {
    if (editingPlayer) {
      await updatePlayer(editingPlayer.id, data);
      setEditingPlayer(null);
    } else {
      await createPlayer(data);
    }
  };

  const handleCancelEdit = () => {
    setEditingPlayer(null);
  };

  return (
    <div className="flex flex-col gap-8 lg:gap-6">
      <div>
        <h2 className="text-2xl font-semibold text-neutral-800">Jugadores</h2>
        <p className="mt-1 text-sm text-neutral-500">
          {canManage
            ? 'Alta, edición y administración de jugadores del club.'
            : 'Consulta el listado de jugadores registrados.'}
        </p>
      </div>

      {canManage && (
        <Card
          title={editingPlayer ? 'Editar jugador' : 'Nuevo jugador'}
          description={
            editingPlayer
              ? `Modificando a ${editingPlayer.displayName}`
              : 'Nombre, apellido y apodo opcional.'
          }
        >
          <PlayerForm
            key={editingPlayer?.id ?? 'new'}
            initialData={editingPlayer}
            onSubmit={handleSubmit}
            onCancel={editingPlayer ? handleCancelEdit : undefined}
          />
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
          <PlayerList
            players={players}
            onEdit={canManage ? setEditingPlayer : undefined}
            onDelete={canManage ? deletePlayer : undefined}
          />
        )}
      </Card>
    </div>
  );
}