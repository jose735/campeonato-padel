import type { Player } from '@/types';

interface PlayerListProps {
  players: Player[];
  onDelete: (id: number) => void;
}

export default function PlayerList({ players, onDelete }: PlayerListProps) {
  if (players.length === 0) {
    return <p className="text-slate-500">Aún no hay jugadores registrados.</p>;
  }

  return (
    <ul className="flex flex-col gap-2">
      {players.map((player) => (
        <li
          key={player.id}
          className="flex items-center justify-between rounded-md bg-slate-800 px-4 py-3"
        >
          <span>{player.displayName}</span>
          <button
            onClick={() => onDelete(player.id)}
            className="text-sm text-red-400 hover:text-red-300"
          >
            Eliminar
          </button>
        </li>
      ))}
    </ul>
  );
}