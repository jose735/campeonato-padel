import type { JourneyMatch, Player } from "@/types";
import MatchCard from "./MatchCard";

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
    pointsObtained: number,
  ) => Promise<void>;
}

export default function RoundSection({
  round,
  matches,
  players,
  scoreLimit,
  isLocked,
  onSaveScore,
}: RoundSectionProps) {
  return (
    <section className="flex flex-col gap-3">
      <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-400">
        Ronda {round}
      </h3>
      <div className="flex flex-col gap-2">
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
    </section>
  );
}
