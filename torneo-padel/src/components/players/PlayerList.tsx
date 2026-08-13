import { Trash2 } from 'lucide-react';
import type { Player } from '@/types';
import Button from '@/components/ui/Button';

interface PlayerListProps {
  players: Player[];
  onDelete?: (id: number) => void;
}

export default function PlayerList({ players, onDelete }: PlayerListProps) {
  return (
    <ul className="flex flex-col gap-2">
      {players.map((player) => (
        <li
          key={player.id}
          className="flex items-center justify-between gap-3 rounded-lg border border-neutral-200 bg-neutral-50/60 px-4 py-3"
        >
          <div>
            <p className="font-medium text-neutral-800">{player.displayName}</p>
            {player.nickname && (
              <p className="text-sm text-neutral-500">
                {player.firstName} {player.lastName}
              </p>
            )}
          </div>
          {onDelete && (
            <Button variant="danger" icon={Trash2} onClick={() => onDelete(player.id)}>
              Eliminar
            </Button>
          )}
        </li>
      ))}
    </ul>
  );
}