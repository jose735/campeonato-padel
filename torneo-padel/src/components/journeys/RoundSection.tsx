import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import type { JourneyMatch, Player } from '@/types';
import MatchCard from './MatchCard';

interface RoundSectionProps {
  round: number;
  matches: JourneyMatch[];
  players: Player[];
  scoreLimit: number;
  isLocked: boolean;
  onSaveScore: (
    matchId: number,
    scoreA: number,
    scoreB: number,
    pointsObtained: number
  ) => Promise<void>;
}

function isRegistered(match: JourneyMatch): boolean {
  return match.scoreA > 0 || match.scoreB > 0 || match.pointsObtained > 0;
}

export default function RoundSection({
  round,
  matches,
  players,
  scoreLimit,
  isLocked,
  onSaveScore,
}: RoundSectionProps) {
  const [isOpen, setIsOpen] = useState(false);

  const playedCount = matches.filter(isRegistered).length;
  const allPlayed = playedCount === matches.length && matches.length > 0;

  return (
    <section className="overflow-hidden rounded-xl border border-neutral-200 bg-white shadow-sm">
      {/* Header clickeable */}
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className="flex w-full items-center justify-between gap-3 px-4 py-3.5 text-left transition-colors hover:bg-neutral-50"
        aria-expanded={isOpen}
      >
        <div className="flex items-center gap-3">
          <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-primary-600 text-sm font-bold text-white">
            {round}
          </span>
          <div>
            <h3 className="text-sm font-semibold text-neutral-800">
              Ronda {round}
            </h3>
            <p className="text-xs text-neutral-500">
              {matches.length} partido{matches.length === 1 ? '' : 's'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span
            className={`rounded-full px-2.5 py-1 text-xs font-medium ${
              allPlayed
                ? 'bg-success-100 text-success-700'
                : playedCount > 0
                  ? 'bg-warning-100 text-warning-700'
                  : 'bg-neutral-100 text-neutral-500'
            }`}
          >
            {allPlayed
              ? 'Completa'
              : playedCount > 0
                ? `${playedCount}/${matches.length} jugados`
                : 'Sin resultados'}
          </span>

          <ChevronDown
            size={18}
            className={`text-neutral-400 transition-transform duration-200 ${
              isOpen ? 'rotate-180' : ''
            }`}
          />
        </div>
      </button>

      {/* Contenido colapsable */}
      {isOpen && (
        <div className="border-t border-neutral-100 px-4 py-4">
          <div
            className={`grid gap-3 ${
              matches.length > 1 ? 'lg:grid-cols-2' : 'grid-cols-1'
            }`}
          >
            {matches.map((match) => (
              <MatchCard
                key={match.id}
                match={match}
                players={players}
                scoreLimit={scoreLimit}
                isLocked={isLocked}
                onSaveScore={onSaveScore}
              />
            ))}
          </div>
        </div>
      )}
    </section>
  );
}