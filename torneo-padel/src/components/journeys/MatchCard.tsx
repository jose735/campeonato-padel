import { useState } from "react";
import { Check, Pencil, Loader2 } from "lucide-react";
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

function getPlayer(players: Player[], id: number): Player | undefined {
  return players.find((p) => p.id === id);
}

function initials(player?: Player): string {
  if (!player) return "?";
  return `${player.firstName[0] ?? ""}${player.lastName[0] ?? ""}`.toUpperCase();
}

function teamLabel(p1?: Player, p2?: Player): string {
  return `${p1?.displayName ?? "Jugador"} / ${p2?.displayName ?? "Jugador"}`;
}

function isRegistered(match: JourneyMatch): boolean {
  return match.scoreA > 0 || match.scoreB > 0 || match.pointsObtained > 0;
}

function TeamAvatars({ p1, p2 }: { p1?: Player; p2?: Player }) {
  return (
    <div className="flex -space-x-2.5 shrink-0">
      <div className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-white bg-primary-100 text-[11px] font-semibold text-primary-700">
        {initials(p1)}
      </div>
      <div className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-white bg-primary-100 text-[11px] font-semibold text-primary-700">
        {initials(p2)}
      </div>
    </div>
  );
}

interface TeamRowProps {
  label: string;
  p1?: Player;
  p2?: Player;
  score: number | "";
  isEditing: boolean;
  isWinner: boolean;
  scoreLimit: number;
  onScoreChange: (raw: string) => void;
}

function TeamRow({
  label,
  p1,
  p2,
  score,
  isEditing,
  isWinner,
  scoreLimit,
  onScoreChange,
}: TeamRowProps) {
  return (
    <div
      className={`flex items-center justify-between gap-3 rounded-lg px-3 py-2.5 transition-colors ${
        isWinner ? "bg-primary-50" : ""
      }`}
    >
      <div className="flex min-w-0 items-center gap-3">
        <TeamAvatars p1={p1} p2={p2} />
        <p
          className={`truncate text-sm ${
            isWinner
              ? "font-semibold text-primary-800"
              : "font-medium text-neutral-700"
          }`}
        >
          {label}
        </p>
      </div>

      {isEditing ? (
        <input
          type="number"
          min={0}
          max={scoreLimit}
          value={score}
          onChange={(e) => onScoreChange(e.target.value)}
          placeholder="—"
          className="w-14 shrink-0 rounded-md border border-primary-300 bg-white px-2 py-1 text-center text-lg font-bold text-neutral-800 focus:outline-none focus:ring-2 focus:ring-primary-500"
        />
      ) : (
        <span
          className={`w-10 shrink-0 text-center text-2xl font-bold tabular-nums ${
            isWinner ? "text-primary-700" : "text-neutral-400"
          }`}
        >
          {score}
        </span>
      )}
    </div>
  );
}

export default function MatchCard({
  match,
  players,
  scoreLimit,
  isLocked,
  onSaveScore,
}: MatchCardProps) {
  const registeredInitially = isRegistered(match);
  const [scoreA, setScoreA] = useState<number | null>(
    registeredInitially ? match.scoreA : null,
  );
  const [scoreB, setScoreB] = useState<number | null>(
    registeredInitially ? match.scoreB : null,
  );
  const [isEditing, setIsEditing] = useState(!registeredInitially);
  const [isSaving, setIsSaving] = useState(false);

  const playerA1 = getPlayer(players, match.playerA1Id);
  const playerA2 = getPlayer(players, match.playerA2Id);
  const playerB1 = getPlayer(players, match.playerB1Id);
  const playerB2 = getPlayer(players, match.playerB2Id);

  const registered = isRegistered(match);
  const isValid =
    scoreA !== null &&
    scoreB !== null &&
    Number.isInteger(scoreA) &&
    Number.isInteger(scoreB) &&
    scoreA >= 0 &&
    scoreB >= 0 &&
    scoreA + scoreB === scoreLimit;

  const pointsObtained =
    scoreA !== null && scoreB !== null && scoreA === scoreB ? 1 : 2;
  const hasChanged = scoreA !== match.scoreA || scoreB !== match.scoreB;

  const winnerIsA = registered && !isEditing && match.scoreA > match.scoreB;
  const winnerIsB = registered && !isEditing && match.scoreB > match.scoreA;
  const isTie = registered && !isEditing && match.scoreA === match.scoreB;

  const barA = scoreLimit > 0 ? (match.scoreA / scoreLimit) * 100 : 50;

  const handleScoreAChange = (raw: string) => {
    if (raw === "") {
      setScoreA(null);
      setScoreB(null);
      return;
    }
    const value = Number(raw);
    if (Number.isNaN(value)) return;
    const clamped = Math.min(Math.max(0, value), scoreLimit);
    setScoreA(clamped);
    setScoreB(scoreLimit - clamped);
  };

  const handleScoreBChange = (raw: string) => {
    if (raw === "") {
      setScoreA(null);
      setScoreB(null);
      return;
    }
    const value = Number(raw);
    if (Number.isNaN(value)) return;
    const clamped = Math.min(Math.max(0, value), scoreLimit);
    setScoreB(clamped);
    setScoreA(scoreLimit - clamped);
  };

  const handleSave = async () => {
    if (!isValid || scoreA === null || scoreB === null) return;
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

  return (
    <div className="overflow-hidden rounded-xl border border-neutral-200 bg-white shadow-sm transition-shadow hover:shadow-md">
      <div className="flex items-center justify-between border-b border-neutral-100 px-4 py-2">
        <span className="text-xs font-medium text-neutral-400">
          Partido #{match.id}
        </span>
        {isLocked ? (
          <span className="rounded-full bg-neutral-100 px-2.5 py-0.5 text-xs font-medium text-neutral-500">
            Finalizado
          </span>
        ) : registered && !isEditing ? (
          <span className="inline-flex items-center gap-1 rounded-full bg-success-100 px-2.5 py-0.5 text-xs font-medium text-success-700">
            <Check size={12} />
            Registrado
          </span>
        ) : (
          <span className="rounded-full bg-warning-100 px-2.5 py-0.5 text-xs font-medium text-warning-700">
            Pendiente
          </span>
        )}
      </div>

      <div className="flex flex-col gap-0.5 px-2 py-2">
        <TeamRow
          label={teamLabel(playerA1, playerA2)}
          p1={playerA1}
          p2={playerA2}
          score={scoreA ?? ""}
          isEditing={isEditing}
          isWinner={winnerIsA}
          scoreLimit={scoreLimit}
          onScoreChange={handleScoreAChange}
        />
        <div className="flex items-center gap-3 px-3">
          <div className="h-px flex-1 bg-neutral-100" />
          <span className="text-[10px] font-semibold tracking-wide text-neutral-300">
            VS
          </span>
          <div className="h-px flex-1 bg-neutral-100" />
        </div>
        <TeamRow
          label={teamLabel(playerB1, playerB2)}
          p1={playerB1}
          p2={playerB2}
          score={scoreB ?? ""}
          isEditing={isEditing}
          isWinner={winnerIsB}
          scoreLimit={scoreLimit}
          onScoreChange={handleScoreBChange}
        />
      </div>

      {/* Barra de proporción del marcador, estilo "odds bar" */}
      {registered && !isEditing && (
        <div className="flex h-1 w-full">
          <div
            className="bg-primary-500 transition-all"
            style={{ width: `${barA}%` }}
          />
          <div
            className="bg-accent-500 transition-all"
            style={{ width: `${100 - barA}%` }}
          />
        </div>
      )}

      <div className="flex items-center justify-between gap-2 px-4 py-3">
        <p className="text-xs text-neutral-500">
          {isEditing
            ? isValid
              ? isTie
                ? "Empate · 1 pt"
                : "2 pts al ganador"
              : `La suma debe ser ${scoreLimit}`
            : isTie
              ? "Empate · 1 pt"
              : "2 pts al ganador"}
        </p>

        {isLocked ? null : isEditing ? (
          <button
            onClick={handleSave}
            disabled={!isValid || isSaving || (!hasChanged && registered)}
            className="inline-flex items-center gap-1.5 rounded-md bg-primary-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-primary-700 disabled:opacity-40 transition-colors"
          >
            {isSaving ? (
              <Loader2 size={13} className="animate-spin" />
            ) : (
              <Check size={13} />
            )}
            {isSaving ? "Guardando..." : "Guardar"}
          </button>
        ) : (
          <button
            onClick={handleEdit}
            className="inline-flex items-center gap-1.5 rounded-md border border-neutral-300 bg-white px-3 py-1.5 text-xs font-medium text-neutral-700 hover:bg-neutral-100"
          >
            <Pencil size={13} />
            Editar
          </button>
        )}
      </div>
    </div>
  );
}
