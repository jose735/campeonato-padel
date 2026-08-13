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
    return <p className="text-neutral-500">Aún no hay jornadas registradas.</p>;
  }

  const getTournamentName = (tournamentId: number) =>
    tournaments.find((t) => t.id === tournamentId)?.description ?? 'Torneo desconocido';

  return (
    <ul className="flex flex-col gap-3 lg:gap-2">
      {journeys.map((journey) => {
        const hasMatches = journeyIdsWithMatches.includes(journey.id);

        return (
          <li
            key={journey.id}
            className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 rounded-md border border-neutral-200 bg-white px-4 py-3 shadow-sm"
          >
            <div>
              <p className="font-medium text-neutral-800">
                {getTournamentName(journey.tournamentId)}
              </p>
              <p className="text-sm text-neutral-500">
                {journey.journeyDate} · {journey.fieldsQuantity} cancha(s) · hasta{' '}
                {journey.scoreLimit} pts
              </p>
            </div>

            {hasMatches ? (
              <button
                onClick={() => onViewMatches(journey.id)}
                className="self-start sm:self-auto text-sm font-medium text-primary-600 hover:text-primary-700"
              >
                Ver partidos
              </button>
            ) : (
              <button
                onClick={() => onManagePlayers(journey.id)}
                className="self-start sm:self-auto text-sm font-medium text-primary-600 hover:text-primary-700"
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