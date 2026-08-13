import { useState } from 'react';
import type { JourneyMatch, Player } from '@/types';

interface MatchCardProps {
  match: JourneyMatch;
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

function playerName(players: Player[], id: number): string {
  return players.find((p) => p.id === id)?.displayName ?? `Jugador #${id}`;
}

function isRegistered(match: JourneyMatch): boolean {
  return match.scoreA > 0 || match.scoreB > 0 || match.pointsObtained > 0;
}

export default function MatchCard({
  match,
  players,
  scoreLimit,
  isLocked,
  onSaveScore,
}: MatchCardProps) {
  const [scoreA, setScoreA] = useState(match.scoreA);
  const [scoreB, setScoreB] = useState(match.scoreB);
  const [isEditing, setIsEditing] = useState(!isRegistered(match));
  const [isSaving, setIsSaving] = useState(false);

  const teamA = `${playerName(players, match.playerA1Id)} / ${playerName(players, match.playerA2Id)}`;
  const teamB = `${playerName(players, match.playerB1Id)} / ${playerName(players, match.playerB2Id)}`;

  const isValid =
    Number.isInteger(scoreA) &&
    Number.isInteger(scoreB) &&
    scoreA >= 0 &&
    scoreB >= 0 &&
    scoreA + scoreB === scoreLimit;

  const pointsObtained = scoreA === scoreB ? 1 : 2;

  const hasChanged = scoreA !== match.scoreA || scoreB !== match.scoreB;

  const handleScoreAChange = (value: number) => {
    const clamped = Math.min(Math.max(0, value), scoreLimit);
    setScoreA(clamped);
    setScoreB(scoreLimit - clamped);
  };

  const handleScoreBChange = (value: number) => {
    const clamped = Math.min(Math.max(0, value), scoreLimit);
    setScoreB(clamped);
    setScoreA(scoreLimit - clamped);
  };

  const handleSave = async () => {
    if (!isValid) return;
    setIsSaving(true);
    try {
      await onSaveScore(match.id, scoreA, scoreB, pointsObtained);
      setIsEditing(false);
    } finally {
      setIsSaving(false);
    }
  };

  const handleEdit = () => {
    setScoreA(match.scoreA);
    setScoreB(match.scoreB);
    setIsEditing(true);
  };

  const resultLabel =
    scoreA === scoreB
      ? 'Empate (1 pt)'
      : scoreA > scoreB
        ? 'Gana pareja A (2 pts)'
        : 'Gana pareja B (2 pts)';

  return (
    <div className="rounded-lg border border-neutral-200 bg-white p-4 shadow-sm">
      <div className="mb-3 flex items-center justify-between text-xs text-neutral-400">
        <span>Partido #{match.id}</span>
        {!isEditing && isRegistered(match) && (
          <span className="rounded bg-success-100 px-2 py-0.5 text-success-700">
            Registrado
          </span>
        )}
      </div>

      <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2 sm:gap-3">
        <div className="text-right">
          <p className="text-sm font-medium text-neutral-800">{teamA}</p>
        </div>

        <div className="flex items-center gap-2">
          <input
            type="number"
            min={0}
            max={scoreLimit}
            value={scoreA}
            readOnly={!isEditing}
            onChange={(e) => handleScoreAChange(Number(e.target.value))}
            className={`w-14 rounded-md border px-2 py-1.5 text-center text-sm ${
              isEditing
                ? 'border-primary-300 bg-white text-neutral-800 focus:outline-none focus:ring-2 focus:ring-primary-500'
                : 'border-neutral-200 bg-neutral-50 text-neutral-500 cursor-default'
            }`}
          />
          <span className="text-neutral-400">–</span>
          <input
            type="number"
            min={0}
            max={scoreLimit}
            value={scoreB}
            readOnly={!isEditing}
            onChange={(e) => handleScoreBChange(Number(e.target.value))}
            className={`w-14 rounded-md border px-2 py-1.5 text-center text-sm ${
              isEditing
                ? 'border-primary-300 bg-white text-neutral-800 focus:outline-none focus:ring-2 focus:ring-primary-500'
                : 'border-neutral-200 bg-neutral-50 text-neutral-500 cursor-default'
            }`}
          />
        </div>

        <div className="text-left">
          <p className="text-sm font-medium text-neutral-800">{teamB}</p>
        </div>
      </div>

      <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
        <p className="text-xs text-neutral-500">
          {isEditing
            ? isValid
              ? resultLabel
              : `Suma debe ser ${scoreLimit}`
            : resultLabel}
        </p>

        {isLocked ? (
          <span className="text-xs text-neutral-400">Jornada finalizada</span>
        ) : isEditing ? (
          <button
            onClick={handleSave}
            disabled={!isValid || isSaving || (!hasChanged && isRegistered(match))}
            className="rounded-md bg-primary-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-primary-700 disabled:opacity-40 transition-colors"
          >
            {isSaving ? 'Guardando...' : 'Guardar'}
          </button>
        ) : (
          <button
            onClick={handleEdit}
            className="rounded-md border border-neutral-300 bg-white px-3 py-1.5 text-xs font-medium text-neutral-700 hover:bg-neutral-100"
          >
            Editar
          </button>
        )}
      </div>
    </div>
  );
}