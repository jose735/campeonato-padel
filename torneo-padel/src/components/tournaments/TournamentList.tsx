import type { Tournament } from '@/types';

interface TournamentListProps {
  tournaments: Tournament[];
  onDelete?: (id: number) => void;
}

export default function TournamentList({ tournaments, onDelete }: TournamentListProps) {
  if (tournaments.length === 0) {
    return <p className="text-neutral-500">Aún no hay torneos registrados.</p>;
  }

  return (
    <ul className="flex flex-col gap-3 lg:gap-2">
      {tournaments.map((tournament) => (
        <li
          key={tournament.id}
          className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 rounded-md border border-neutral-200 bg-white px-4 py-3 shadow-sm"
        >
          <div>
            <p className="font-medium text-neutral-800">{tournament.description}</p>
            <p className="text-sm text-neutral-500">
              Creado: {new Date(tournament.createdAt).toLocaleDateString('es-AR')}
            </p>
          </div>
          {onDelete && (
            <button
              onClick={() => onDelete(tournament.id)}
              className="self-start sm:self-auto text-sm font-medium text-danger-600 hover:text-danger-700"
            >
              Eliminar
            </button>
          )}
        </li>
      ))}
    </ul>
  );
}