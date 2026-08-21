import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { CalendarDays, ChevronDown } from "lucide-react";
import { useTournamentStore } from "@/store/tournament-store";
import { useJourneyStore } from "@/store/journey-store";
import { useJourneyMatchStore } from "@/store/journey-match-store";
import { useAuthStore } from "@/store/auth-store";
import { can } from "@/lib/permissions";
import JourneyForm from "@/components/journeys/JourneyForm";
import JourneyList from "@/components/journeys/JourneyList";
import PlayerSelectionModal from "@/components/journeys/PlayerSelectionModal";
import Card from "@/components/ui/Card";

export default function JourneysPage() {
  const navigate = useNavigate();
  const role = useAuthStore((s) => s.role);

  const {
    tournaments,
    fetchTournaments,
  } = useTournamentStore();

  const {
    journeys,
    isLoading,
    fetchJourneys,
    createJourney,
  } = useJourneyStore();

  const {
    journeyIdsWithMatches,
    fetchJourneyIdsWithMatches,
  } = useJourneyMatchStore();

  const [activeJourneyId, setActiveJourneyId] =
    useState<number | null>(null);
  const [modalMode, setModalMode] = useState<"create" | "replace">("create");

  const [isFormOpen, setIsFormOpen] = useState(false);

  useEffect(() => {
    fetchTournaments();
    fetchJourneys();
    fetchJourneyIdsWithMatches();
  }, [
    fetchTournaments,
    fetchJourneys,
    fetchJourneyIdsWithMatches,
  ]);

  // Más recientes primero (por fecha de jornada, y si empatan por id)
  const sortedJourneys = useMemo(() => {
    return [...journeys].sort((a, b) => {
      const dateCompare = b.journeyDate.localeCompare(a.journeyDate);
      if (dateCompare !== 0) return dateCompare;
      return b.id - a.id;
    });
  }, [journeys]);

  return (
    <div className="flex flex-col gap-8 lg:gap-6">
      <div>
        <h2 className="text-2xl font-semibold text-neutral-800">
          Jornadas
        </h2>

        <p className="mt-1 text-sm text-neutral-500">
          {can.createJourney(role)
            ? "Creá fechas, asigná jugadores y generá los partidos automáticamente."
            : "Consultá las jornadas registradas y sus partidos."}
        </p>
      </div>

      {can.createJourney(role) && (
        <div className="overflow-hidden rounded-xl border border-neutral-200 bg-white shadow-sm">
          <button
            type="button"
            onClick={() => setIsFormOpen((prev) => !prev)}
            className="flex w-full items-center justify-between gap-3 px-5 py-4 text-left transition-colors hover:bg-neutral-50 sm:px-6"
            aria-expanded={isFormOpen}
          >
            <div>
              <h3 className="text-base font-semibold text-neutral-800">
                Nueva jornada
              </h3>
              <p className="mt-0.5 text-sm text-neutral-500">
                Completá los datos para registrar una fecha.
              </p>
            </div>

            <ChevronDown
              size={18}
              className={`shrink-0 text-neutral-400 transition-transform duration-200 ${
                isFormOpen ? "rotate-180" : ""
              }`}
            />
          </button>

          {isFormOpen && (
            <div className="border-t border-neutral-100 px-5 py-5 sm:px-6">
              <JourneyForm
                tournaments={tournaments}
                onSubmit={createJourney}
              />
            </div>
          )}
        </div>
      )}

      <Card
        title="Listado de jornadas"
        description={`${sortedJourneys.length} jornada${
          sortedJourneys.length === 1 ? "" : "s"
        } registrada${
          sortedJourneys.length === 1 ? "" : "s"
        }.`}
      >
        {isLoading ? (
          <p className="text-sm text-neutral-500">
            Cargando...
          </p>
        ) : sortedJourneys.length === 0 ? (
          <div className="flex flex-col items-center gap-2 py-8 text-center">
            <CalendarDays
              className="text-neutral-300"
              size={32}
            />

            <p className="text-sm text-neutral-500">
              Aún no hay jornadas registradas.
            </p>
          </div>
        ) : (
          <JourneyList
            journeys={sortedJourneys}
            tournaments={tournaments}
            journeyIdsWithMatches={journeyIdsWithMatches}
            onManagePlayers={(id) => {
              setModalMode("create");
              setActiveJourneyId(id);
            }}
            onReplacePlayer={(id) => {
              setModalMode("replace");
              setActiveJourneyId(id);
            }}
            onViewMatches={(id) =>
              navigate(`/jornadas/${id}`)
            }
            onJourneyDeleted={async () => {
              await Promise.all([
                fetchJourneys(),
                fetchJourneyIdsWithMatches(),
              ]);
            }}
          />
        )}
      </Card>

      {activeJourneyId !== null && (
        <PlayerSelectionModal
          key={`${activeJourneyId}-${modalMode}`}
          journeyId={activeJourneyId}
          maxPlayers={
            journeys.find(
              (journey) => journey.id === activeJourneyId,
            )?.maxPlayers ?? 8
          }
          fieldsQuantity={
            journeys.find(
              (journey) => journey.id === activeJourneyId,
            )?.fieldsQuantity ?? 2
          }
          mode={modalMode}
          onClose={() => setActiveJourneyId(null)}
          onSuccess={() =>
            fetchJourneyIdsWithMatches()
          }
        />
      )}
    </div>
  );
}