import { useEffect, useMemo, useState } from 'react';
import { useTournamentStore } from '@/store/tournament-store';
import { usePlayerStore } from '@/store/player-store';
import { getMatchesByTournamentId } from '@/services/journeyMatchService';
import { calculateStandings } from '@/lib/standings';
import JourneyStandings from '@/components/journeys/JourneyStandings';
import type { JourneyMatch } from '@/types';

export default function RankingPage() {
  const { tournaments, fetchTournaments } = useTournamentStore();
  const { players, fetchPlayers } = usePlayerStore();

  const [selectedTournamentId, setSelectedTournamentId] = useState<number | ''>('');
  const [matches, setMatches] = useState<JourneyMatch[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    fetchTournaments();
    fetchPlayers();
  }, [fetchTournaments, fetchPlayers]);

  useEffect(() => {
    if (selectedTournamentId === '') return;

    let cancelled = false;

    const load = async () => {
      setIsLoading(true);
      try {
        const data = await getMatchesByTournamentId(selectedTournamentId);
        if (!cancelled) setMatches(data);
      } catch (error) {
        console.error(error);
        if (!cancelled) setMatches([]);
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };

    load();

    return () => {
      cancelled = true;
    };
  }, [selectedTournamentId]);

  const standings = useMemo(
    () => (selectedTournamentId === '' ? [] : calculateStandings(matches, players)),
    [selectedTournamentId, matches, players]
  );

  return (
    <div className="flex flex-col gap-8 lg:gap-6">
      <div>
        <h2 className="text-2xl font-semibold text-neutral-800 mb-1">Ranking general</h2>
        <p className="text-sm text-neutral-500">
          Suma de todas las jornadas del torneo. Mismas reglas que la tabla por jornada.
        </p>
      </div>

      <div className="max-w-sm">
        <label className="block text-sm font-medium text-neutral-600 mb-1">Torneo</label>
        <select
          value={selectedTournamentId}
          onChange={(e) => {
            const value = e.target.value === '' ? '' : Number(e.target.value);
            setSelectedTournamentId(value);
            if (value === '') {
              setMatches([]);
            }
          }}
          className="w-full rounded-md bg-white border border-neutral-300 px-3 py-2.5 lg:py-2 text-neutral-800 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
        >
          <option value="">Selecciona un torneo</option>
          {tournaments.map((t) => (
            <option key={t.id} value={t.id}>
              {t.description}
            </option>
          ))}
        </select>
      </div>

      {selectedTournamentId === '' ? (
        <p className="text-neutral-500 text-sm">Elige un torneo para ver el ranking general.</p>
      ) : isLoading ? (
        <p className="text-neutral-500 text-sm">Cargando ranking...</p>
      ) : (
        <section className="flex flex-col gap-3">
          <h3 className="text-lg font-semibold text-neutral-800">Tabla general</h3>
          <JourneyStandings standings={standings} />
        </section>
      )}
    </div>
  );
}