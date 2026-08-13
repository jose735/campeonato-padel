// src/components/journeys/JourneyList.tsx
import { Users, Eye, Calendar } from 'lucide-react';
import type { Journey, Tournament } from '@/types';
import Button from '@/components/ui/Button';

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
  const getTournamentName = (tournamentId: number) =>
    tournaments.find((t) => t.id === tournamentId)?.description ?? 'Torneo desconocido';

  return (
    <ul className="flex flex-col gap-2">
      {journeys.map((journey) => {
        const hasMatches = journeyIdsWithMatches.includes(journey.id);
        const isFinished = journey.status === 'finished';

        return (
          <li
            key={journey.id}
            className="flex flex-col gap-3 rounded-lg border border-neutral-200 bg-neutral-50/60 px-4 py-3 sm:flex-row sm:items-center sm:justify-between"
          >
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <p className="font-medium text-neutral-800">
                  {getTournamentName(journey.tournamentId)}
                </p>
                {isFinished && (
                  <span className="rounded-full bg-neutral-200 px-2 py-0.5 text-xs font-medium text-neutral-600">
                    Finalizada
                  </span>
                )}
              </div>
              <p className="mt-0.5 flex items-center gap-1.5 text-sm text-neutral-500">
                <Calendar size={14} />
                {journey.journeyDate} · {journey.fieldsQuantity} cancha(s) · hasta{' '}
                {journey.scoreLimit} pts
              </p>
            </div>

            {hasMatches ? (
              <Button
                variant="secondary"
                icon={Eye}
                onClick={() => onViewMatches(journey.id)}
                className="self-start sm:self-auto"
              >
                Ver partidos
              </Button>
            ) : (
              <Button
                variant="secondary"
                icon={Users}
                onClick={() => onManagePlayers(journey.id)}
                className="self-start sm:self-auto"
              >
                Agregar jugadores
              </Button>
            )}
          </li>
        );
      })}
    </ul>
  );
}