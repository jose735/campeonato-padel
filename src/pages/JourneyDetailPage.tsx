import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Flag, RotateCcw, X } from "lucide-react";

import copaKolariImg from "@/assets/copa-kolari-imagen-v2.png";

import { useJourneyStore } from "@/store/journey-store";
import { useJourneyMatchStore } from "@/store/journey-match-store";
import { usePlayerStore } from "@/store/player-store";
import { useTournamentStore } from "@/store/tournament-store";
import { useAuthStore } from "@/store/auth-store";
import { can } from "@/lib/permissions";
import { isDeletedTournamentId } from "@/lib/constants";
import { getJourneyById } from "@/services/journeyService";

import RoundSection from "@/components/journeys/RoundSection";
import JourneyStandings from "@/components/journeys/JourneyStandings";
import AssignFieldsModal from "@/components/journeys/AssignFieldsModal";
import Button from "@/components/ui/Button";

import { calculateStandings } from "@/lib/standings";
import type { CreateJourneyMatchInput, Journey } from "@/types";

export default function JourneyDetailPage() {
  const { id } = useParams<{ id: string }>();
  const journeyId = Number(id);
  const navigate = useNavigate();

  const role = useAuthStore((s) => s.role);
  const canFinish = can.finishJourney(role);
  const canEdit = can.editRound(role);
  const canReopen = can.reopenJourney(role);

  const { journeys, fetchJourneys, finishJourney, reopenJourney } =
    useJourneyStore();

  const { tournaments, fetchTournaments } = useTournamentStore();

  const { players, fetchPlayers } = usePlayerStore();

  const { matches, isLoading, fetchMatchesByJourneyId, updateMatch } =
    useJourneyMatchStore();

  // Cache del fetch remoto (p. ej. jornadas eliminadas que no están en el store)
  const [remoteCache, setRemoteCache] = useState<{
    id: number;
    journey: Journey | null;
  } | null>(null);

  const [isFinishing, setIsFinishing] = useState(false);
  const [isReopening, setIsReopening] = useState(false);
  const [isImageOpen, setIsImageOpen] = useState(false);
  const [isFieldsModalOpen, setIsFieldsModalOpen] = useState(false);
  const [fieldsSnapshot, setFieldsSnapshot] = useState<number[]>([]);

  const isValidId = Boolean(journeyId) && !Number.isNaN(journeyId);

  const journeyFromStore = useMemo(() => {
    if (!isValidId) return null;
    return journeys.find((j) => j.id === journeyId) ?? null;
  }, [isValidId, journeyId, journeys]);

  useEffect(() => {
    fetchJourneys();
    fetchTournaments();
    fetchPlayers();

    if (isValidId) {
      fetchMatchesByJourneyId(journeyId);
    }
  }, [
    isValidId,
    journeyId,
    fetchJourneys,
    fetchTournaments,
    fetchPlayers,
    fetchMatchesByJourneyId,
  ]);

  // Solo fetch remoto si no está en el store (p. ej. eliminada).
  // setState únicamente en callbacks async → evita setState síncrono en el effect.
  useEffect(() => {
    if (!isValidId || journeyFromStore) return;
    if (remoteCache?.id === journeyId) return;

    let cancelled = false;

    void getJourneyById(journeyId)
      .then((j) => {
        if (!cancelled) setRemoteCache({ id: journeyId, journey: j });
      })
      .catch((err) => {
        console.error(err);
        if (!cancelled) setRemoteCache({ id: journeyId, journey: null });
      });

    return () => {
      cancelled = true;
    };
  }, [isValidId, journeyId, journeyFromStore, remoteCache?.id]);

  const journey =
    journeyFromStore ??
    (remoteCache?.id === journeyId ? remoteCache.journey : null);

  const isLoadingJourney =
    isValidId && !journeyFromStore && remoteCache?.id !== journeyId;

  const isDeleted =
    journey?.status === "deleted" ||
    (journey != null && isDeletedTournamentId(journey.tournamentId));
  const isLocked = journey?.status === "finished" || isDeleted;

  const tournament = tournaments.find((t) => t.id === journey?.tournamentId);

  const isCopaKolari =
    tournament?.description?.trim().toLowerCase() === "copa kolari";

  const matchesByRound = useMemo(() => {
    const grouped = new Map<number, typeof matches>();

    for (const match of matches) {
      const list = grouped.get(match.round) ?? [];
      list.push(match);
      grouped.set(match.round, list);
    }

    return Array.from(grouped.entries()).sort(([a], [b]) => a - b);
  }, [matches]);

  const standings = useMemo(
    () => calculateStandings(matches, players),
    [matches, players],
  );

  const handleOpenFieldsModal = () => {
    const fields = new Set(
      matches.map((m) => m.fieldNumber).filter((f): f is number => f !== null),
    );

    setFieldsSnapshot(Array.from(fields).sort((a, b) => a - b));
    setIsFieldsModalOpen(true);
  };

  const handleSaveFields = async (mapping: Record<number, number>) => {
    const updates = matches.filter(
      (match): match is typeof match & { fieldNumber: number } =>
        match.fieldNumber !== null && mapping[match.fieldNumber] !== undefined,
    );

    await Promise.all(
      updates.map((match) => {
        const payload: CreateJourneyMatchInput = {
          journeyId: match.journeyId,
          round: match.round,
          playerA1Id: match.playerA1Id,
          playerA2Id: match.playerA2Id,
          playerB1Id: match.playerB1Id,
          playerB2Id: match.playerB2Id,
          scoreA: match.scoreA,
          scoreB: match.scoreB,
          pointsObtained: match.pointsObtained,
          fieldNumber: mapping[match.fieldNumber],
        };

        return updateMatch(match.id, payload);
      }),
    );

    await fetchMatchesByJourneyId(journeyId);
  };

  const handleSaveRound = async (
    roundMatches: {
      matchId: number;
      scoreA: number;
      scoreB: number;
      pointsObtained: number;
    }[],
  ) => {
    await Promise.all(
      roundMatches.map(async (roundMatch) => {
        const match = matches.find((m) => m.id === roundMatch.matchId);

        if (!match) return;

        const payload: CreateJourneyMatchInput = {
          journeyId: match.journeyId,
          round: match.round,
          playerA1Id: match.playerA1Id,
          playerA2Id: match.playerA2Id,
          playerB1Id: match.playerB1Id,
          playerB2Id: match.playerB2Id,
          scoreA: roundMatch.scoreA,
          scoreB: roundMatch.scoreB,
          pointsObtained: roundMatch.pointsObtained,
          fieldNumber: match.fieldNumber ?? 1,
        };

        await updateMatch(match.id, payload);
      }),
    );
  };

  const handleFinishJourney = async () => {
    if (!journey || isLocked || isDeleted) return;

    const confirmed = window.confirm(
      "¿Finalizar esta jornada?\n\nNo se podrán modificar más marcadores. Los partidos sin jugar (0-0) no contarán en la tabla.",
    );

    if (!confirmed) return;

    setIsFinishing(true);

    try {
      await finishJourney(journey.id);
    } finally {
      setIsFinishing(false);
    }
  };

  const handleReopenJourney = async () => {
    if (!journey || !isLocked || isDeleted) return;

    const confirmed = window.confirm(
      "¿Reabrir esta jornada?\n\nSe habilitará nuevamente la edición de marcadores.",
    );

    if (!confirmed) return;

    setIsReopening(true);

    try {
      await reopenJourney(journey.id);
    } finally {
      setIsReopening(false);
    }
  };

  if (!isValidId) {
    return <p className="text-danger-600">ID de jornada inválido.</p>;
  }

  if (isLoadingJourney || !journey) {
    return <p className="text-neutral-500">Cargando jornada...</p>;
  }

  return (
    <div className="flex flex-col gap-8 lg:gap-6">
      {/* Encabezado */}
      <div className="flex flex-col gap-3">
        <button
          onClick={() => navigate("/jornadas")}
          className="self-start text-sm text-neutral-500 hover:text-neutral-800"
        >
          ← Volver a jornadas
        </button>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex items-start gap-3">
            {isCopaKolari && (
              <button
                type="button"
                onClick={() => setIsImageOpen(true)}
                className="shrink-0 overflow-hidden rounded-lg border border-neutral-200 shadow-sm transition hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-primary-500"
                aria-label="Ver imagen de Copa Kolari"
              >
                <img
                  src={copaKolariImg}
                  alt="Copa Kolari"
                  className="h-14 w-14 object-cover sm:h-16 sm:w-16"
                />
              </button>
            )}

            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-2xl font-semibold text-neutral-800">
                  {tournament?.description ?? "Jornada"}
                </h2>
                {isDeleted && (
                  <span className="rounded-full bg-danger-100 px-2.5 py-0.5 text-xs font-medium text-danger-700">
                    Eliminada
                  </span>
                )}
              </div>

              <p className="mt-1 text-neutral-500">
                {journey.journeyDate} · {journey.fieldsQuantity} canchas ·{" "}
                {journey.scoreLimit} pts · {matches.length} partidos
              </p>
            </div>
          </div>

          {!isDeleted && (
            <div className="flex flex-wrap items-center gap-2">
              {!isLocked && canFinish && (
                <Button
                  variant="secondary"
                  icon={Flag}
                  onClick={handleFinishJourney}
                  isLoading={isFinishing}
                  className="border-warning-300 bg-warning-50 text-warning-700 hover:bg-warning-100"
                >
                  Finalizar jornada
                </Button>
              )}

              {isLocked && canReopen && (
                <Button
                  variant="secondary"
                  icon={RotateCcw}
                  onClick={handleReopenJourney}
                  isLoading={isReopening}
                >
                  Reabrir jornada
                </Button>
              )}

              {canEdit && matches.length > 0 && (
                <Button
                  variant="secondary"
                  onClick={handleOpenFieldsModal}
                  disabled={isLocked}
                >
                  Asignar canchas
                </Button>
              )}

              {isLocked && !canReopen && (
                <span className="self-start rounded-full bg-neutral-100 px-3 py-1.5 text-sm font-medium text-neutral-500">
                  Jornada finalizada
                </span>
              )}
            </div>
          )}
        </div>
      </div>

      {isDeleted && (
        <p className="rounded-lg border border-danger-200 bg-danger-50 px-4 py-3 text-sm text-danger-700">
          Esta jornada está eliminada. Solo se puede consultar; no se pueden
          editar marcadores ni cambiar su estado desde aquí.
        </p>
      )}

      {/* Partidos */}
      {isLoading ? (
        <p className="text-neutral-500">Cargando partidos...</p>
      ) : matches.length === 0 ? (
        <p className="text-neutral-500">
          Esta jornada aún no tiene partidos generados.
        </p>
      ) : (
        <>
          <div className="flex flex-col gap-8 lg:gap-6">
            {matchesByRound.map(([round, roundMatches]) => (
              <RoundSection
                key={round}
                round={round}
                matches={roundMatches}
                players={players}
                scoreLimit={journey.scoreLimit}
                isLocked={isLocked}
                canEdit={canEdit && !isDeleted}
                onSaveRound={handleSaveRound}
              />
            ))}
          </div>

          {/* Tabla de posiciones */}
          <h3 className="text-base font-semibold text-neutral-800">
            Tabla de posiciones
          </h3>

          <JourneyStandings standings={standings} />
        </>
      )}

      {/* Modal imagen Copa Kolari */}
      {isImageOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4"
          onClick={() => setIsImageOpen(false)}
        >
          <div
            className="relative max-h-[90vh] max-w-3xl"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setIsImageOpen(false)}
              className="absolute -right-2 -top-2 z-10 rounded-full bg-white p-1.5 text-neutral-600 shadow hover:bg-neutral-100"
              aria-label="Cerrar"
            >
              <X size={18} />
            </button>

            <img
              src={copaKolariImg}
              alt="Copa Kolari"
              className="max-h-[90vh] w-full rounded-lg object-contain"
            />
          </div>
        </div>
      )}

      {isFieldsModalOpen && !isDeleted && (
        <AssignFieldsModal
          currentFields={fieldsSnapshot}
          onClose={() => setIsFieldsModalOpen(false)}
          onSave={handleSaveFields}
        />
      )}
    </div>
  );
}
