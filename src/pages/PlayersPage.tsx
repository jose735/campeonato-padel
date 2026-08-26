import { useEffect, useState } from 'react';
import { ChevronDown, Users } from 'lucide-react';
import { usePlayerStore } from '@/store/player-store';
import { useAuthStore } from '@/store/auth-store';
import { can } from '@/lib/permissions';
import type { Player } from '@/types';
import type { PlayerFormSubmitData } from '@/components/players/PlayerForm';
import { uploadPlayerPhoto } from '@/services/playerService';
import PlayerForm from '@/components/players/PlayerForm';
import PlayerList from '@/components/players/PlayerList';
import Card from '@/components/ui/Card';

export default function PlayersPage() {
  const { players, isLoading, fetchPlayers, createPlayer, updatePlayer, deletePlayer } =
    usePlayerStore();
  const role = useAuthStore((s) => s.role);
  const canManage = can.managePlayers(role);

  const [editingPlayer, setEditingPlayer] = useState<Player | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);

  useEffect(() => {
    fetchPlayers();
  }, [fetchPlayers]);

  const handleSubmit = async (data: PlayerFormSubmitData) => {
    const { photoFile, removePhoto, ...textData } = data;

    if (editingPlayer) {
      await updatePlayer(editingPlayer.id, {
        ...textData,
        ...(removePhoto ? { photoUrl: null } : {}),
      });

      if (photoFile) {
        const photoUrl = await uploadPlayerPhoto(editingPlayer.id, photoFile);
        await updatePlayer(editingPlayer.id, {
          ...textData,
          photoUrl,
        });
      }

      await fetchPlayers();
      setEditingPlayer(null);
    } else {
      const created = await createPlayer(textData);

      if (photoFile) {
        const photoUrl = await uploadPlayerPhoto(created.id, photoFile);
        await updatePlayer(created.id, {
          firstName: created.firstName,
          lastName: created.lastName,
          nickname: created.nickname,
          photoUrl,
        });
      }

      await fetchPlayers();
    }
  };

  const handleCancelEdit = () => {
    setEditingPlayer(null);
  };

  const handleEdit = (player: Player) => {
    setEditingPlayer(player);
    setIsFormOpen(true);
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
        <div className="overflow-hidden rounded-xl border border-neutral-200 bg-white shadow-sm">
          <button
            type="button"
            onClick={() => setIsFormOpen((prev) => !prev)}
            className="flex w-full items-center justify-between gap-3 px-5 py-4 text-left transition-colors hover:bg-neutral-50 sm:px-6"
            aria-expanded={isFormOpen}
          >
            <div>
              <h3 className="text-base font-semibold text-neutral-800">
                {editingPlayer ? 'Editar jugador' : 'Nuevo jugador'}
              </h3>
              <p className="mt-0.5 text-sm text-neutral-500">
                {editingPlayer
                  ? `Modificando a ${editingPlayer.displayName}`
                  : 'Nombre, apellido, apodo opcional y foto.'}
              </p>
            </div>

            <ChevronDown
              size={18}
              className={`shrink-0 text-neutral-400 transition-transform duration-200 ${
                isFormOpen ? 'rotate-180' : ''
              }`}
            />
          </button>

          {isFormOpen && (
            <div className="border-t border-neutral-100 px-5 py-5 sm:px-6">
              <PlayerForm
                key={editingPlayer?.id ?? 'new'}
                initialData={editingPlayer}
                onSubmit={handleSubmit}
                onCancel={editingPlayer ? handleCancelEdit : undefined}
              />
            </div>
          )}
        </div>
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
            onEdit={canManage ? handleEdit : undefined}
            onDelete={canManage ? deletePlayer : undefined}
          />
        )}
      </Card>
    </div>
  );
}
