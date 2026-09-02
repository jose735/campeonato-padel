import { useEffect, useMemo, useState } from "react";
import { Trophy } from "lucide-react";
import { useTournamentStore } from "@/store/tournament-store";
import { usePlayerStore } from "@/store/player-store";
import { getMatchesByTournamentId } from "@/services/journeyMatchService";
import { getCurrentTournamentId } from "@/services/journeyService";
import { calculateStandings, buildWeightedStandings } from "@/lib/standings";
import { isDeletedTournamentId } from "@/lib/constants";
import JourneyStandings from "@/components/journeys/JourneyStandings";
import SelectField from "@/components/ui/SelectField";
import SegmentedControl from "@/components/ui/SegmentedControl";
import Card from "@/components/ui/Card";
import type { JourneyMatch } from "@/types";
import { supabase } from "@/lib/supabase";

type RankingMode = "general" | "ponderada";


export default function RankingPage() {
  const { tournaments, fetchTournaments } = useTournamentStore();
  const { players, fetchPlayers } = usePlayerStore();

  const selectableTournaments = useMemo(
    () => tournaments.filter((t) => !isDeletedTournamentId(t.id)),
    [tournaments],
  );

  const [selectedTournamentId, setSelectedTournamentId] = useState<number | "">(
    "",
  );
  const [currentTournamentId, setCurrentTournamentId] = useState<number | null>(
    null,
  );
  const [matches, setMatches] = useState<JourneyMatch[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [mode, setMode] = useState<RankingMode>("ponderada");

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
              {selectableTournaments.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.description}
                  {currentTournamentId === t.id ? " (actual)" : ""}
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
