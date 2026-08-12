import type { Tournament } from '@/types';

interface TournamentListProps {
  tournaments: Tournament[];
  onDelete: (id: number) => void;
}

export default function TournamentList({ tournaments, onDelete }: TournamentListProps) {
  if (tournaments.length === 0) {
    return <p className="text-slate-500">Aún no hay torneos registrados.</p>;
  }

  return (
    <ul className="flex flex-col gap-2">
      {tournaments.map((tournament) => (
        <li
          key={tournament.id}
          className="flex items-center justify-between rounded-md bg-slate-800 px-4 py-3"
        >
          <div>
            <p className="font-medium">{tournament.description}</p>
            <p className="text-sm text-slate-400">
              Creado: {new Date(tournament.createdAt).toLocaleDateString('es-AR')}
            </p>
          </div>
          <button
            onClick={() => onDelete(tournament.id)}
            className="text-sm text-red-400 hover:text-red-300"
          >
            Eliminar
          </button>
        </li>
      ))}
    </ul>
  );
}