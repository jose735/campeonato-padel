import type { Player } from '@/types';

interface PlayerListProps {
  players: Player[];
  onDelete?: (id: number) => void;
}

export default function PlayerList({ players, onDelete }: PlayerListProps) {
  if (players.length === 0) {
    return <p className="text-neutral-500">Aún no hay jugadores registrados.</p>;
  }

  return (
    <ul className="flex flex-col gap-3 lg:gap-2">
      {players.map((player) => (
        <li
          key={player.id}
          className="flex items-center justify-between gap-2 rounded-md border border-neutral-200 bg-white px-4 py-3 shadow-sm"
        >
          <span className="text-neutral-800">{player.displayName}</span>
          {onDelete && (
            <button
              onClick={() => onDelete(player.id)}
              className="text-sm font-medium text-danger-600 hover:text-danger-700"
            >
              Eliminar
            </button>
          )}
        </li>
      ))}
    </ul>
  );
}