import { useEffect, useMemo, useState } from "react";
import { Trophy } from "lucide-react";
import { useTournamentStore } from "@/store/tournament-store";
import { usePlayerStore } from "@/store/player-store";
import { getMatchesByTournamentId } from "@/services/journeyMatchService";
import { calculateStandings, type StandingRow } from "@/lib/standings";
import JourneyStandings from "@/components/journeys/JourneyStandings";
import SelectField from "@/components/ui/SelectField";
import SegmentedControl from "@/components/ui/SegmentedControl";
import Card from "@/components/ui/Card";
import type { JourneyMatch } from "@/types";
import { supabase } from "@/lib/supabase";

type RankingMode = "general" | "ponderada";

function buildWeightedStandings(standings: StandingRow[]): StandingRow[] {
  const weighted = standings
    .filter((row) => row.matchesPlayed > 0)
    .map((row) => ({
      ...row,
      points: row.points / row.matchesPlayed,
      difference: row.difference / row.matchesPlayed,
    }));

  weighted.sort((a, b) => {
    if (b.points !== a.points) return b.points - a.points;
    if (b.difference !== a.difference) return b.difference - a.difference;
    if (b.wins !== a.wins) return b.wins - a.wins;
    if (b.draws !== a.draws) return b.draws - a.draws;
    return a.playerName.localeCompare(b.playerName, "es");
  });

  let position = 1;

  return weighted.map((row, index) => {
    if (index === 0) {
      return { ...row, position: 1 };
    }

    const previous = weighted[index - 1];
    const sameRankingCriteria =
      row.points === previous.points &&
      row.difference === previous.difference &&
      row.wins === previous.wins &&
      row.draws === previous.draws;

    if (!sameRankingCriteria) {
      position = index + 1;
    }

    return { ...row, position };
  });
}

export default function RankingPage() {
  const { tournaments, fetchTournaments } = useTournamentStore();
  const { players, fetchPlayers } = usePlayerStore();

  const [selectedTournamentId, setSelectedTournamentId] = useState<number | "">(
    "",
  );
  const [matches, setMatches] = useState<JourneyMatch[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [mode, setMode] = useState<RankingMode>("ponderada");

  useEffect(() => {
    fetchTournaments();
    fetchPlayers();
  }, [fetchTournaments, fetchPlayers]);

  useEffect(() => {
    if (selectedTournamentId === "") return;

    let cancelled = false;
    let isFirstLoad = true;

    const load = async () => {
      if (isFirstLoad) {
        setIsLoading(true);
      }
      try {
        const data = await getMatchesByTournamentId(selectedTournamentId);
        if (!cancelled) setMatches(data);
      } catch (error) {
        console.error(error);
        if (!cancelled) setMatches([]);
      } finally {
        if (!cancelled && isFirstLoad) {
          setIsLoading(false);
          isFirstLoad = false;
        }
      }
    };

    void load();

    const channel = supabase
      .channel(`ranking-${selectedTournamentId}`)
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
  }, [selectedTournamentId]);

  const generalStandings = useMemo(
    () =>
      selectedTournamentId === "" ? [] : calculateStandings(matches, players),
    [selectedTournamentId, matches, players],
  );

  const standings = useMemo(() => {
    if (mode === "ponderada") {
      return buildWeightedStandings(generalStandings);
    }
    return generalStandings;
  }, [mode, generalStandings]);

  return (
    <div className="flex flex-col gap-8 lg:gap-6">
      <div>
        <h2 className="text-2xl font-semibold text-neutral-800">
          Ranking general
        </h2>
        <p className="mt-1 text-sm text-neutral-500">
          Suma de todas las jornadas finalizadas del torneo. Las jornadas
          abiertas no se incluyen.
        </p>
      </div>

      <Card>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div className="max-w-sm flex-1">
            <SelectField
              label="Torneo"
              icon={Trophy}
              value={selectedTournamentId}
              onChange={(e) => {
                const value =
                  e.target.value === "" ? "" : Number(e.target.value);
                setSelectedTournamentId(value);
                if (value === "") setMatches([]);
              }}
            >
              <option value="">Selecciona un torneo</option>
              {tournaments.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.description}
                </option>
              ))}
            </SelectField>
          </div>

          {selectedTournamentId !== "" && (
            <SegmentedControl
              value={mode}
              onChange={setMode}
              options={[
                { label: "Ponderada", value: "ponderada" },
                { label: "General", value: "general" },
              ]}
            />
          )}
        </div>
      </Card>

      {selectedTournamentId === "" ? (
        <p className="text-sm text-neutral-500">
          Elige un torneo para ver el ranking general.
        </p>
      ) : isLoading ? (
        <p className="text-sm text-neutral-500">Cargando ranking...</p>
      ) : (
        <Card title={mode === "general" ? "Tabla general" : "Tabla ponderada"}>
          <JourneyStandings
            standings={standings}
            showDecimals={mode === "ponderada"}
            variant={mode === "ponderada" ? "ponderada" : "general"}
          />
        </Card>
      )}
    </div>
  );
}
