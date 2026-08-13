import { Trash2 } from 'lucide-react';
import type { Tournament } from '@/types';
import Button from '@/components/ui/Button';

interface TournamentListProps {
  tournaments: Tournament[];
  onDelete?: (id: number) => void;
}

export default function TournamentList({ tournaments, onDelete }: TournamentListProps) {
  return (
    <ul className="flex flex-col gap-2">
      {tournaments.map((tournament) => (
        <li
          key={tournament.id}
          className="flex items-center justify-between gap-3 rounded-lg border border-neutral-200 bg-neutral-50/60 px-4 py-3"
        >
          <div>
            <p className="font-medium text-neutral-800">{tournament.description}</p>
            <p className="text-sm text-neutral-500">
              Creado: {new Date(tournament.createdAt).toLocaleDateString('es-AR')}
            </p>
          </div>
          {onDelete && (
            <Button variant="danger" icon={Trash2} onClick={() => onDelete(tournament.id)}>
              Eliminar
            </Button>
          )}
        </li>
      ))}
    </ul>
  );
}