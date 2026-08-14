import { useState } from "react";
import { ChevronDown, Check, Pencil, Loader2 } from "lucide-react";
import type { JourneyMatch, Player } from "@/types";
import MatchCard from "./MatchCard";

interface RoundSectionProps {
  round: number;
  matches: JourneyMatch[];
  players: Player[];
  scoreLimit: number;
  isLocked: boolean;
  canEdit?: boolean;
  onSaveRound: (
    matches: {
      matchId: number;
      scoreA: number;
      scoreB: number;
      pointsObtained: number;
    }[],
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
  canEdit = false,
  onSaveRound,
}: RoundSectionProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const [scores, setScores] = useState<
    Record<number, { scoreA: number | null; scoreB: number | null }>
  >({});

  const playedCount = matches.filter(isRegistered).length;
  const allPlayed = playedCount === matches.length && matches.length > 0;

  const initializeScores = () => {
    const initialScores: Record<
      number,
      { scoreA: number | null; scoreB: number | null }
    > = {};

    matches.forEach((match) => {
      const registered = isRegistered(match);

      initialScores[match.id] = {
        scoreA: registered ? match.scoreA : null,
        scoreB: registered ? match.scoreB : null,
      };
    });

    setScores(initialScores);
  };

  const handleStartEditing = () => {
    initializeScores();
    setIsEditing(true);
    setIsOpen(true);
  };

  const handleCancelEditing = () => {
    setScores({});
    setIsEditing(false);
  };

  const handleSave = async () => {
    const updates = matches.map((match) => {
      const current = scores[match.id];

      const scoreA = current?.scoreA ?? null;
      const scoreB = current?.scoreB ?? null;

      // Partido sin resultado
      if (scoreA === null && scoreB === null) {
        return {
          matchId: match.id,
          scoreA: 0,
          scoreB: 0,
          pointsObtained: 0,
        };
      }

      return {
        matchId: match.id,
        scoreA: scoreA ?? 0,
        scoreB: scoreB ?? 0,
        pointsObtained: scoreA === scoreB ? 1 : 2,
      };
    });

    // Un partido es inválido únicamente si:
    // - tiene un solo marcador
    // - o la suma de sus marcadores no coincide con scoreLimit
    const hasInvalidScore = matches.some((match) => {
      const current = scores[match.id];

      const scoreA = current?.scoreA ?? null;
      const scoreB = current?.scoreB ?? null;

      // Partido vacío: permitido
      if (scoreA === null && scoreB === null) {
        return false;
      }

      // Uno de los dos valores está vacío: inválido
      if (scoreA === null || scoreB === null) {
        return true;
      }

      // Ambos valores deben sumar el límite
      return (
        scoreA < 0 ||
        scoreB < 0 ||
        scoreA + scoreB !== scoreLimit
      );
    });

    if (hasInvalidScore) return;

    setIsSaving(true);

    try {
      await onSaveRound(updates);
      setIsEditing(false);
      setScores({});
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <section className="overflow-hidden rounded-xl border border-neutral-200 bg-white shadow-sm">
      {/* Header */}
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className="flex w-full items-center gap-3 px-4 py-3.5 text-left transition-colors hover:bg-neutral-50"
        aria-expanded={isOpen}
      >
        <span className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary-600 text-sm font-bold text-white">
          {round}
        </span>

        <div className="min-w-0">
          <h3 className="text-sm font-semibold text-neutral-800">
            Ronda {round}
          </h3>

          <p className="text-xs text-neutral-500">
            {matches.length} partido
            {matches.length === 1 ? "" : "s"}
          </p>
        </div>

        {/* Estado */}
        <span
          className={`ml-auto shrink-0 rounded-full px-2.5 py-1 text-xs font-medium ${
            allPlayed
              ? "bg-success-100 text-success-700"
              : playedCount > 0
                ? "bg-warning-100 text-warning-700"
                : "bg-neutral-100 text-neutral-500"
          }`}
        >
          {allPlayed
            ? "Completa"
            : playedCount > 0
              ? `${playedCount}/${matches.length} jugados`
              : "Sin resultados"}
        </span>

        {/* Chevron */}
        <ChevronDown
          size={18}
          className={`shrink-0 text-neutral-400 transition-transform duration-200 ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>

      {/* Contenido */}
      {isOpen && (
        <div className="border-t border-neutral-100 px-4 py-4">
          <div className="overflow-hidden rounded-xl border border-neutral-200 divide-y divide-neutral-100">
      {matches.map((match) => {
        const currentScores = scores[match.id];
        const registered = isRegistered(match);

        const scoreA = isEditing
          ? (currentScores?.scoreA ?? null)
          : registered
            ? match.scoreA
            : null;

        const scoreB = isEditing
          ? (currentScores?.scoreB ?? null)
          : registered
            ? match.scoreB
            : null;

        return (
          <MatchCard
            key={match.id}
            match={match}
            players={players}
            scoreLimit={scoreLimit}
            isLocked={isLocked}
            isEditing={isEditing}
            scoreA={scoreA}
            scoreB={scoreB}
            grouped
            onScoreChange={(scoreA, scoreB) => {
              setScores((prev) => ({
                ...prev,
                [match.id]: {
                  scoreA,
                  scoreB,
                },
              }));
            }}
          />
        );
      })}
    </div>

          {/* Acciones de la ronda */}
          {!isLocked && canEdit && (
            <div className="mt-4 flex justify-end border-t border-neutral-100 pt-4">
              {!isEditing ? (
                <button
                  type="button"
                  onClick={handleStartEditing}
                  className="inline-flex items-center gap-1.5 rounded-md border border-neutral-300 bg-white px-3 py-1.5 text-xs font-medium text-neutral-700 hover:bg-neutral-100"
                >
                  <Pencil size={13} />
                  Editar ronda
                </button>
              ) : (
                <div className="flex w-full flex-col-reverse gap-2 sm:w-auto sm:flex-row">
                  <button
                    type="button"
                    onClick={handleCancelEditing}
                    disabled={isSaving}
                    className="rounded-md border border-neutral-300 bg-white px-3 py-1.5 text-xs font-medium text-neutral-700 hover:bg-neutral-100 disabled:opacity-50"
                  >
                    Cancelar
                  </button>

                  <button
                    type="button"
                    onClick={handleSave}
                    disabled={isSaving}
                    className="inline-flex items-center justify-center gap-1.5 rounded-md bg-primary-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-primary-700 disabled:opacity-50"
                  >
                    {isSaving ? (
                      <Loader2 size={13} className="animate-spin" />
                    ) : (
                      <Check size={13} />
                    )}

                    {isSaving ? "Guardando..." : "Guardar ronda"}
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </section>
  );
}