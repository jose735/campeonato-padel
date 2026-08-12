import { useState } from "react";
import type { JourneyMatch, Player } from "@/types";

interface MatchCardProps {
  match: JourneyMatch;
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
      ? "Empate (1 pt)"
      : scoreA > scoreB
        ? "Gana pareja A (2 pts)"
        : "Gana pareja B (2 pts)";

  return (
    <div className="rounded-lg border border-slate-700 bg-slate-800/60 p-4">
      <div className="mb-3 flex items-center justify-between text-xs text-slate-500">
        <span>Partido #{match.id}</span>
        {!isEditing && isRegistered(match) && (
          <span className="rounded bg-emerald-900/50 px-2 py-0.5 text-emerald-400">
            Registrado
          </span>
        )}
      </div>

      <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3">
        <div className="text-right">
          <p className="text-sm font-medium text-slate-200">{teamA}</p>
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
                ? "border-slate-600 bg-slate-900 text-slate-100"
                : "border-slate-700 bg-slate-800/50 text-slate-300 cursor-default"
            }`}
          />
          <span className="text-slate-500">–</span>
          <input
            type="number"
            min={0}
            max={scoreLimit}
            value={scoreB}
            readOnly={!isEditing}
            onChange={(e) => handleScoreBChange(Number(e.target.value))}
            className={`w-14 rounded-md border px-2 py-1.5 text-center text-sm ${
              isEditing
                ? "border-slate-600 bg-slate-900 text-slate-100"
                : "border-slate-700 bg-slate-800/50 text-slate-300 cursor-default"
            }`}
          />
        </div>

        <div className="text-left">
          <p className="text-sm font-medium text-slate-200">{teamB}</p>
        </div>
      </div>

      <div className="mt-3 flex items-center justify-between gap-2">
        <p className="text-xs text-slate-400">
          {isEditing
            ? isValid
              ? resultLabel
              : `Suma debe ser ${scoreLimit}`
            : resultLabel}
        </p>

        {isLocked ? (
          <span className="text-xs text-slate-500">Jornada finalizada</span>
        ) : isEditing ? (
          <button
            onClick={handleSave}
            disabled={
              !isValid || isSaving || (!hasChanged && isRegistered(match))
            }
            className="rounded-md bg-emerald-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-emerald-500 disabled:opacity-40"
          >
            {isSaving ? "Guardando..." : "Guardar"}
          </button>
        ) : (
          <button
            onClick={handleEdit}
            className="rounded-md border border-slate-600 bg-slate-800 px-3 py-1.5 text-xs font-medium text-slate-200 hover:bg-slate-700"
          >
            Editar
          </button>
        )}
      </div>
    </div>
  );
}
