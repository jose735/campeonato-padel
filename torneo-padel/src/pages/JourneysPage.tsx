import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { CalendarDays } from "lucide-react";
import { useTournamentStore } from "@/store/tournament-store";
import { useJourneyStore } from "@/store/journey-store";
import { useJourneyMatchStore } from "@/store/journey-match-store";
import JourneyForm from "@/components/journeys/JourneyForm";
import JourneyList from "@/components/journeys/JourneyList";
import PlayerSelectionModal from "@/components/journeys/PlayerSelectionModal";
import Card from "@/components/ui/Card";

export default function JourneysPage() {
  const navigate = useNavigate();
  const { tournaments, fetchTournaments } = useTournamentStore();
  const { journeys, isLoading, fetchJourneys, createJourney } =
    useJourneyStore();
  const { journeyIdsWithMatches, fetchJourneyIdsWithMatches } =
    useJourneyMatchStore();
  const [activeJourneyId, setActiveJourneyId] = useState<number | null>(null);

  useEffect(() => {
    fetchTournaments();
    fetchJourneys();
    fetchJourneyIdsWithMatches();
  }, [fetchTournaments, fetchJourneys, fetchJourneyIdsWithMatches]);

  return (
    <div className="flex flex-col gap-8 lg:gap-6">
      <div>
        <h2 className="text-2xl font-semibold text-neutral-800">Jornadas</h2>
        <p className="mt-1 text-sm text-neutral-500">
          Creá fechas, asigná jugadores y generá los partidos automáticamente.
        </p>
      </div>

      <Card
        title="Nueva jornada"
        description="Completá los datos para registrar una fecha."
      >
        <JourneyForm tournaments={tournaments} onSubmit={createJourney} />
      </Card>

      <Card
        title="Listado de jornadas"
        description={`${journeys.length} jornada${journeys.length === 1 ? "" : "s"} registrada${journeys.length === 1 ? "" : "s"}.`}
      >
        {isLoading ? (
          <p className="text-sm text-neutral-500">Cargando...</p>
        ) : journeys.length === 0 ? (
          <div className="flex flex-col items-center gap-2 py-8 text-center">
            <CalendarDays className="text-neutral-300" size={32} />
            <p className="text-sm text-neutral-500">
              Aún no hay jornadas registradas.
            </p>
          </div>
        ) : (
          <JourneyList
            journeys={journeys}
            tournaments={tournaments}
            journeyIdsWithMatches={journeyIdsWithMatches}
            onManagePlayers={setActiveJourneyId}
            onViewMatches={(id) => navigate(`/jornadas/${id}`)}
          />
        )}
      </Card>

      {activeJourneyId !== null && (
        <PlayerSelectionModal
          key={activeJourneyId}
          journeyId={activeJourneyId}
          maxPlayers={
            journeys.find((j) => j.id === activeJourneyId)?.maxPlayers ?? 8
          }
          fieldsQuantity={
            journeys.find((j) => j.id === activeJourneyId)?.fieldsQuantity ?? 2
          }
          onClose={() => setActiveJourneyId(null)}
          onSuccess={() => fetchJourneyIdsWithMatches()}
        />
      )}
    </div>
  );
}
