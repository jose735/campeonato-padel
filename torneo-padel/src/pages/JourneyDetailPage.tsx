import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useJourneyStore } from "@/store/journey-store";
import { useJourneyMatchStore } from "@/store/journey-match-store";
import { usePlayerStore } from "@/store/player-store";
import { useTournamentStore } from "@/store/tournament-store";
import RoundSection from "@/components/journeys/RoundSection";
import JourneyStandings from "@/components/journeys/JourneyStandings";
import { calculateStandings } from "@/lib/standings";
import type { CreateJourneyMatchInput } from "@/types";

export default function JourneyDetailPage() {
  const { id } = useParams<{ id: string }>();
  const journeyId = Number(id);
  const navigate = useNavigate();

  const { journeys, fetchJourneys, finishJourney } = useJourneyStore();
  const { tournaments, fetchTournaments } = useTournamentStore();
  const { players, fetchPlayers } = usePlayerStore();
  const { matches, isLoading, fetchMatchesByJourneyId, updateMatch } =
    useJourneyMatchStore();
  const [isFinishing, setIsFinishing] = useState(false);

  useEffect(() => {
    fetchJourneys();
    fetchTournaments();
    fetchPlayers();
    if (journeyId) {
      fetchMatchesByJourneyId(journeyId);
    }
  }, [
    journeyId,
    fetchJourneys,
    fetchTournaments,
    fetchPlayers,
    fetchMatchesByJourneyId,
  ]);

  const journey = journeys.find((j) => j.id === journeyId);
  const isLocked = journey?.status === "finished";
  const tournament = tournaments.find((t) => t.id === journey?.tournamentId);

  const matchesByRound = useMemo(() => {
    const grouped = new Map<number, typeof matches>();
    for (const match of matches) {
      const list = grouped.get(match.round) ?? [];
      list.push(match);
      grouped.set(match.round, list);
    }
    return Array.from(grouped.entries()).sort(([a], [b]) => a - b);
  }, [matches]);

  // Tabla de posiciones de ESTA jornada (parte de 0)
  const standings = useMemo(
    () => calculateStandings(matches, players),
    [matches, players],
  );

  const handleSaveScore = async (
    matchId: number,
    scoreA: number,
    scoreB: number,
    pointsObtained: number,
  ) => {
    const match = matches.find((m) => m.id === matchId);
    if (!match) return;

    const payload: CreateJourneyMatchInput = {
      journeyId: match.journeyId,
      round: match.round,
      playerA1Id: match.playerA1Id,
      playerA2Id: match.playerA2Id,
      playerB1Id: match.playerB1Id,
      playerB2Id: match.playerB2Id,
      scoreA,
      scoreB,
      pointsObtained,
    };

    await updateMatch(matchId, payload);
  };

  const handleFinishJourney = async () => {
    if (!journey || isLocked) return;

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

  if (!journeyId || Number.isNaN(journeyId)) {
    return <p className="text-red-400">ID de jornada inválido.</p>;
  }

  if (!journey) {
    return <p className="text-slate-500">Cargando jornada...</p>;
  }

  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-start justify-between gap-4">
        <div>
          <button
            onClick={() => navigate("/jornadas")}
            className="mb-2 text-sm text-slate-400 hover:text-slate-200"
          >
            ← Volver a jornadas
          </button>
          <h2 className="text-2xl font-semibold">
            {tournament?.description ?? "Jornada"}
          </h2>
          {!isLocked ? (
            <button
              onClick={handleFinishJourney}
              disabled={isFinishing}
              className="rounded-md border border-amber-600/50 bg-amber-900/30 px-4 py-2 text-sm font-medium text-amber-300 hover:bg-amber-900/50 disabled:opacity-50"
            >
              {isFinishing ? "Finalizando..." : "Finalizar jornada"}
            </button>
          ) : (
            <span className="rounded-md bg-slate-800 px-3 py-1.5 text-sm text-slate-400">
              Jornada finalizada
            </span>
          )}
          <p className="mt-1 text-slate-400">
            {journey.journeyDate} · {journey.fieldsQuantity} cancha(s) · hasta{" "}
            {journey.scoreLimit} pts · {matches.length} partido(s)
          </p>
        </div>
      </div>

      {isLoading ? (
        <p className="text-slate-500">Cargando partidos...</p>
      ) : matches.length === 0 ? (
        <p className="text-slate-500">
          Esta jornada aún no tiene partidos generados.
        </p>
      ) : (
        <>
          {/* Partidos por ronda */}
          <div className="flex flex-col gap-8">
            {matchesByRound.map(([round, roundMatches]) => (
              <RoundSection
                key={round}
                round={round}
                matches={roundMatches}
                players={players}
                scoreLimit={journey.scoreLimit}
                isLocked={isLocked}
                onSaveScore={handleSaveScore}
              />
            ))}
          </div>

          {/* Tabla de posiciones de la jornada */}
          <section className="flex flex-col gap-3">
            <h3 className="text-lg font-semibold text-slate-100">
              Tabla de posiciones
            </h3>
            <p className="text-sm text-slate-500">
              Solo de esta jornada. Cada jornada inicia en 0.
            </p>
            <JourneyStandings standings={standings} />
          </section>
        </>
      )}
    </div>
  );
}
