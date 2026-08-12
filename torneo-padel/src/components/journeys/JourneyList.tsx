import type { Journey, Tournament } from '@/types';

interface JourneyListProps {
  journeys: Journey[];
  tournaments: Tournament[];
  journeyIdsWithMatches: number[];
  onManagePlayers: (journeyId: number) => void;
  onViewMatches: (journeyId: number) => void;
}

export default function JourneyList({
  journeys,
  tournaments,
  journeyIdsWithMatches,
  onManagePlayers,
  onViewMatches,
}: JourneyListProps) {
  if (journeys.length === 0) {
    return <p className="text-slate-500">Aún no hay jornadas registradas.</p>;
  }

  const getTournamentName = (tournamentId: number) =>
    tournaments.find((t) => t.id === tournamentId)?.description ?? 'Torneo desconocido';

  return (
    <ul className="flex flex-col gap-2">
      {journeys.map((journey) => {
        const hasMatches = journeyIdsWithMatches.includes(journey.id);

        return (
          <li
            key={journey.id}
            className="flex items-center justify-between rounded-md bg-slate-800 px-4 py-3"
          >
            <div>
              <p className="font-medium">{getTournamentName(journey.tournamentId)}</p>
              <p className="text-sm text-slate-400">
                {journey.journeyDate} · {journey.fieldsQuantity} cancha(s) · hasta{' '}
                {journey.scoreLimit} pts
              </p>
            </div>

            {hasMatches ? (
              <button
                onClick={() => onViewMatches(journey.id)}
                className="text-sm text-emerald-400 hover:text-emerald-300"
              >
                Ver partidos
              </button>
            ) : (
              <button
                onClick={() => onManagePlayers(journey.id)}
                className="text-sm text-emerald-400 hover:text-emerald-300"
              >
                Agregar jugadores
              </button>
            )}
          </li>
        );
      })}
    </ul>
  );
}