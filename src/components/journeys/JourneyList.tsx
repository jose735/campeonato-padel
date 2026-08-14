import { useMemo, useState } from "react";
import { Users, Eye, Calendar, Trash2, Loader2 } from "lucide-react";
import type { Journey, Tournament } from "@/types";
import Button from "@/components/ui/Button";
import Pagination from "@/components/ui/Pagination";
import SearchInput from "@/components/ui/SearchInput";
import SegmentedControl from "@/components/ui/SegmentedControl";
import { usePagination } from "@/hooks/usePagination";
import { useAuthStore } from "@/store/auth-store";
import { can } from "@/lib/permissions";
import { deleteCompleteJourney } from "@/services/journeyDeletionService";

interface JourneyListProps {
  journeys: Journey[];
  tournaments: Tournament[];
  journeyIdsWithMatches: number[];
  onManagePlayers: (journeyId: number) => void;
  onViewMatches: (journeyId: number) => void;
  onJourneyDeleted: () => Promise<void>;
  pageSize?: number;
}

type StatusFilter = "all" | "open" | "finished";

function normalize(value: string): string {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

export default function JourneyList({
  journeys,
  tournaments,
  journeyIdsWithMatches,
  onManagePlayers,
  onViewMatches,
  onJourneyDeleted,
  pageSize = 10,
}: JourneyListProps) {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] =
    useState<StatusFilter>("all");

  const [deletingJourneyId, setDeletingJourneyId] =
    useState<number | null>(null);

  const role = useAuthStore((state) => state.role);
  const canManagePlayers = can.manageJourneyPlayers(role);
  const canDelete = can.deleteJourney(role);

  const getTournamentName = (tournamentId: number) =>
    tournaments.find((t) => t.id === tournamentId)?.description ??
    "Torneo desconocido";

  const filteredJourneys = useMemo(() => {
    const term = normalize(search.trim());

    return journeys.filter((journey) => {
      const isFinished = journey.status === "finished";

      if (statusFilter === "open" && isFinished) return false;
      if (statusFilter === "finished" && !isFinished) return false;

      if (!term) return true;

      const haystack = normalize(
        `${getTournamentName(journey.tournamentId)} ${journey.journeyDate}`,
      );

      return haystack.includes(term);
    });
  }, [journeys, tournaments, search, statusFilter]);

  const {
    page,
    setPage,
    totalPages,
    pageItems,
    totalItems,
  } = usePagination(filteredJourneys, pageSize);

  const handleSearchChange = (value: string) => {
    setSearch(value);
    setPage(1);
  };

  const handleStatusChange = (value: StatusFilter) => {
    setStatusFilter(value);
    setPage(1);
  };

  const handleDeleteJourney = async (journey: Journey) => {
    const tournamentName = getTournamentName(journey.tournamentId);

    const confirmed = window.confirm(
      `¿Estás seguro de que deseas eliminar la jornada del ${journey.journeyDate} del torneo "${tournamentName}"?\n\nEsta acción eliminará también sus partidos y jugadores asignados y no se puede deshacer.`,
    );

    if (!confirmed) return;

    setDeletingJourneyId(journey.id);

    try {
      await deleteCompleteJourney(journey.id);
      await onJourneyDeleted();
    } catch (error) {
      console.error("Error al eliminar la jornada:", error);

      window.alert(
        "No se pudo eliminar la jornada. Por favor, intenta nuevamente.",
      );
    } finally {
      setDeletingJourneyId(null);
    }
  };

  return (
    <div>
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <SearchInput
          value={search}
          onChange={handleSearchChange}
          placeholder="Buscar por torneo o fecha..."
          className="max-w-sm"
        />

        <SegmentedControl
          value={statusFilter}
          onChange={handleStatusChange}
          options={[
            { label: "Todas", value: "all" },
            { label: "Abiertas", value: "open" },
            { label: "Finalizadas", value: "finished" },
          ]}
        />
      </div>

      {pageItems.length === 0 ? (
        <p className="rounded-lg border border-dashed border-neutral-300 py-8 text-center text-sm text-neutral-500">
          No se encontraron jornadas con esos filtros.
        </p>
      ) : (
        <ul className="flex flex-col gap-2">
          {pageItems.map((journey) => {
            const hasMatches = journeyIdsWithMatches.includes(
              journey.id,
            );

            const isFinished = journey.status === "finished";
            const isDeleting = deletingJourneyId === journey.id;

            return (
              <li
                key={journey.id}
                className="flex flex-col gap-3 rounded-lg border border-neutral-200 bg-neutral-50/60 px-4 py-3 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-medium text-neutral-800">
                      {getTournamentName(journey.tournamentId)}
                    </p>

                    {isFinished && (
                      <span className="rounded-full bg-neutral-200 px-2 py-0.5 text-xs font-medium text-neutral-600">
                        Finalizada
                      </span>
                    )}
                  </div>

                  <p className="mt-0.5 flex items-center gap-1.5 text-sm text-neutral-500">
                    <Calendar size={14} />
                    {journey.journeyDate} ·{" "}
                    {journey.fieldsQuantity} cancha(s) · {" "}
                    {journey.scoreLimit} pts
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2 self-start sm:self-auto">
                  {hasMatches ? (
                    <Button
                      variant="secondary"
                      icon={Eye}
                      onClick={() =>
                        onViewMatches(journey.id)
                      }
                      disabled={isDeleting}
                    >
                      Ver partidos
                    </Button>
                  ) : (
                    canManagePlayers && (
                      <Button
                        variant="secondary"
                        icon={Users}
                        onClick={() =>
                          onManagePlayers(journey.id)
                        }
                        disabled={isDeleting}
                      >
                        Agregar jugadores
                      </Button>
                    )
                  )}

                  {canDelete && (
                    <Button
                      variant="danger"
                      icon={isDeleting ? Loader2 : Trash2}
                      onClick={() =>
                        handleDeleteJourney(journey)
                      }
                      disabled={isDeleting}
                      className={isDeleting ? "[&_svg]:animate-spin" : ""}
                    >
                      {isDeleting
                        ? "Eliminando..."
                        : "Eliminar"}
                    </Button>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      )}

      <Pagination
        page={page}
        totalPages={totalPages}
        totalItems={totalItems}
        pageSize={pageSize}
        onPageChange={setPage}
      />
    </div>
  );
}