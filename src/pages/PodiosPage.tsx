import { useEffect, useMemo, useState } from "react";
import { ArrowDownUp, Medal, Trophy } from "lucide-react";
import { useTournamentStore } from "@/store/tournament-store";
import { usePlayerStore } from "@/store/player-store";
import {
  getCurrentTournamentId,
  getJourneysByTournamentId,
} from "@/services/journeyService";
import { getMatchesByTournamentId } from "@/services/journeyMatchService";
import { calculateStandings } from "@/lib/standings";
import { isDeletedTournamentId } from "@/lib/constants";
import { usePagination } from "@/hooks/usePagination";
import JourneyPodium from "@/components/podios/JourneyPodium";
import SelectField from "@/components/ui/SelectField";
import Pagination from "@/components/ui/Pagination";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import type { Journey, JourneyMatch, Player } from "@/types";
import { supabase } from "@/lib/supabase";

type SortOrder = "desc" | "asc";

type JourneyPodiumData = {
  journey: Journey;
  /** Número de jornada en orden cronológico (1 = más antigua). */
  journeyNumber: number;
  top3: ReturnType<typeof calculateStandings>;
};

const PAGE_SIZE = 6;

export default function PodiosPage() {
  const { tournaments, fetchTournaments } = useTournamentStore();
  const { players, fetchPlayers } = usePlayerStore();

  const selectableTournaments = useMemo(
    () => tournaments.filter((t) => !isDeletedTournamentId(t.id)),
    [tournaments],
  );

  const [selectedTournamentId, setSelectedTournamentId] = useState<
    number | ""
  >("");
  const [currentTournamentId, setCurrentTournamentId] = useState<number | null>(
    null,
  );
  const [journeys, setJourneys] = useState<Journey[]>([]);
  const [matches, setMatches] = useState<JourneyMatch[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  /** Por defecto: más reciente primero (por journey_date). */
  const [sortOrder, setSortOrder] = useState<SortOrder>("desc");

  const hasSelection =
    typeof selectedTournamentId === "number" && selectedTournamentId > 0;

  const playersById = useMemo(() => {
    const map = new Map<number, Player>();
    for (const p of players) map.set(p.id, p);
    return map;
  }, [players]);

  useEffect(() => {
    fetchTournaments();
    fetchPlayers();

    let cancelled = false;
    void getCurrentTournamentId()
      .then((id) => {
        if (!cancelled && id !== null) {
          setCurrentTournamentId(id);
          setSelectedTournamentId(id);
        }
      })
      .catch(console.error);

    return () => {
      cancelled = true;
    };
  }, [fetchTournaments, fetchPlayers]);

  useEffect(() => {
    if (!hasSelection) return;

    let cancelled = false;
    let isFirstLoad = true;

    const load = async () => {
      if (isFirstLoad) setIsLoading(true);
      try {
        const [journeyList, matchList] = await Promise.all([
          getJourneysByTournamentId(selectedTournamentId as number),
          getMatchesByTournamentId(selectedTournamentId as number),
        ]);
        if (!cancelled) {
          const finished = journeyList.filter((j) => j.status === "finished");
          setJourneys(finished);
          setMatches(matchList);
        }
      } catch (error) {
        console.error(error);
        if (!cancelled) {
          setJourneys([]);
          setMatches([]);
        }
      } finally {
        if (!cancelled && isFirstLoad) {
          setIsLoading(false);
          isFirstLoad = false;
        }
      }
    };

    void load();

    const channel = supabase
      .channel(`podios-${String(selectedTournamentId)}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "journeys_matches" },
        () => {
          void load();
        },
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "journeys" },
        () => {
          void load();
        },
      )
      .subscribe();

    return () => {
      cancelled = true;
      void supabase.removeChannel(channel);
    };
  }, [selectedTournamentId, hasSelection]);

  const podiumItems: JourneyPodiumData[] = useMemo(() => {
    if (journeys.length === 0) return [];

    // Numeración estable por fecha de jornada (cronológica ascendente)
    const chronological = [...journeys].sort((a, b) => {
      const byDate = a.journeyDate.localeCompare(b.journeyDate);
      if (byDate !== 0) return byDate;
      return a.id - b.id;
    });
    const numberById = new Map<number, number>();
    chronological.forEach((j, i) => numberById.set(j.id, i + 1));

    const withTop3 = journeys
      .map((journey) => {
        const journeyMatches = matches.filter(
          (m) => m.journeyId === journey.id,
        );
        const standings = calculateStandings(journeyMatches, players);
        const top3 = standings.slice(0, 3);
        return {
          journey,
          journeyNumber: numberById.get(journey.id) ?? 0,
          top3,
        };
      })
      .filter((item) => item.top3.length > 0);

    // Orden de visualización por journey_date
    withTop3.sort((a, b) => {
      const byDate = a.journey.journeyDate.localeCompare(b.journey.journeyDate);
      const tie = a.journey.id - b.journey.id;
      const cmp = byDate !== 0 ? byDate : tie;
      return sortOrder === "desc" ? -cmp : cmp;
    });

    return withTop3;
  }, [journeys, matches, players, sortOrder]);

  const {
    page,
    setPage,
    totalPages,
    pageItems,
    totalItems,
    pageSize,
  } = usePagination(podiumItems, PAGE_SIZE);

  // Reset página al cambiar torneo u orden
  useEffect(() => {
    setPage(1);
  }, [selectedTournamentId, sortOrder, setPage]);

  const selectedTournamentName = useMemo(() => {
    if (!hasSelection) return null;
    return (
      selectableTournaments.find((t) => t.id === selectedTournamentId)
        ?.description ?? null
    );
  }, [hasSelection, selectableTournaments, selectedTournamentId]);

  const toggleSortOrder = () => {
    setSortOrder((prev) => (prev === "desc" ? "asc" : "desc"));
  };

  return (
    <div className="flex flex-col gap-8 lg:gap-6">
      <div>
        <h2 className="text-2xl font-semibold text-neutral-800">Podios</h2>
        <p className="mt-1 text-sm text-neutral-500">
          Top 3 de cada jornada finalizada del torneo, en formato de podio.
        </p>
      </div>

      <Card>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div className="max-w-sm flex-1">
            <SelectField
              label="Torneo"
              icon={Trophy}
              value={
                selectedTournamentId === "" ? "" : String(selectedTournamentId)
              }
              onChange={(e) => {
                const raw = e.target.value;
                if (raw === "") {
                  setSelectedTournamentId("");
                  setJourneys([]);
                  setMatches([]);
                } else {
                  setSelectedTournamentId(Number(raw));
                }
              }}
            >
              <option value="">Elegí un torneo</option>
              {selectableTournaments.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.description}
                  {currentTournamentId === t.id ? " (actual)" : ""}
                </option>
              ))}
            </SelectField>
          </div>

          {hasSelection && podiumItems.length > 0 && (
            <Button
              variant="secondary"
              icon={ArrowDownUp}
              onClick={toggleSortOrder}
              aria-label={
                sortOrder === "desc"
                  ? "Ordenar de más antigua a más reciente"
                  : "Ordenar de más reciente a más antigua"
              }
            >
              {sortOrder === "desc"
                ? "Jornadas más recientes"
                : "Jornadas más antiguas"}
            </Button>
          )}
        </div>
      </Card>

      {!hasSelection ? (
        <p className="text-sm text-neutral-500">
          Elegí un torneo para ver los podios de sus jornadas.
        </p>
      ) : isLoading ? (
        <p className="text-sm text-neutral-500">Cargando podios...</p>
      ) : podiumItems.length === 0 ? (
        <div className="rounded-xl border border-dashed border-neutral-200 bg-neutral-50 px-4 py-12 text-center">
          <Medal className="mx-auto mb-3 text-neutral-300" size={36} />
          <p className="text-sm font-medium text-neutral-600">
            Aún no hay podios para mostrar
          </p>
          <p className="mt-1 text-sm text-neutral-500">
            {selectedTournamentName
              ? `No hay jornadas finalizadas con resultados en «${selectedTournamentName}».`
              : "No hay jornadas finalizadas con resultados."}
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-3 sm:gap-4">
          {pageItems.map(({ journey, journeyNumber, top3 }) => (
            <JourneyPodium
              key={journey.id}
              journeyDate={journey.journeyDate}
              label={`Jornada ${journeyNumber}`}
              top3={top3}
              playersById={playersById}
            />
          ))}

          <Pagination
            page={page}
            totalPages={totalPages}
            totalItems={totalItems}
            pageSize={pageSize}
            onPageChange={setPage}
          />
        </div>
      )}
    </div>
  );
}
