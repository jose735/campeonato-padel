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

import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import { Flag } from "lucide-react";

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
    return <p className="text-danger-600">ID de jornada inválido.</p>;
  }

  if (!journey) {
    return <p className="text-neutral-500">Cargando jornada...</p>;
  }

  return (
    <div className="flex flex-col gap-8 lg:gap-6">
      <div className="flex flex-col gap-3">
        <button
          onClick={() => navigate("/jornadas")}
          className="self-start text-sm text-neutral-500 hover:text-neutral-800"
        >
          ← Volver a jornadas
        </button>

        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
          <div>
            <h2 className="text-2xl font-semibold text-neutral-800">
              {tournament?.description ?? "Jornada"}
            </h2>
            <p className="mt-1 text-neutral-500">
              {journey.journeyDate} · {journey.fieldsQuantity} cancha(s) · hasta{" "}
              {journey.scoreLimit} pts · {matches.length} partido(s)
            </p>
          </div>

          {!isLocked ? (
            <Button
              variant="secondary"
              icon={Flag}
              onClick={handleFinishJourney}
              isLoading={isFinishing}
              className="border-warning-300 bg-warning-50 text-warning-700 hover:bg-warning-100"
            >
              Finalizar jornada
            </Button>
          ) : (
            <span className="self-start rounded-full bg-neutral-100 px-3 py-1.5 text-sm font-medium text-neutral-500">
              Jornada finalizada
            </span>
          )}
        </div>
      </div>

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
                onSaveScore={handleSaveScore}
              />
            ))}
          </div>

          <Card
            title="Tabla de posiciones"
            description="Solo de esta jornada. Cada jornada inicia en 0."
          >
            <JourneyStandings standings={standings} />
          </Card>
        </>
      )}
    </div>
  );
}
