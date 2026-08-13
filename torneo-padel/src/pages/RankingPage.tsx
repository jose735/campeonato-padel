import { useEffect, useMemo, useState } from 'react';
import { Trophy } from 'lucide-react';
import { useTournamentStore } from '@/store/tournament-store';
import { usePlayerStore } from '@/store/player-store';
import { getMatchesByTournamentId } from '@/services/journeyMatchService';
import { calculateStandings } from '@/lib/standings';
import JourneyStandings from '@/components/journeys/JourneyStandings';
import SelectField from '@/components/ui/SelectField';
import Card from '@/components/ui/Card';
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
        <h2 className="text-2xl font-semibold text-neutral-800">Ranking general</h2>
        <p className="mt-1 text-sm text-neutral-500">
          Suma de todas las jornadas del torneo. Mismas reglas que la tabla por jornada.
        </p>
      </div>

      <Card>
        <div className="max-w-sm">
          <SelectField
            label="Torneo"
            icon={Trophy}
            value={selectedTournamentId}
            onChange={(e) => {
              const value = e.target.value === '' ? '' : Number(e.target.value);
              setSelectedTournamentId(value);
              if (value === '') setMatches([]);
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
      </Card>

      {selectedTournamentId === '' ? (
        <p className="text-sm text-neutral-500">Elige un torneo para ver el ranking general.</p>
      ) : isLoading ? (
        <p className="text-sm text-neutral-500">Cargando ranking...</p>
      ) : (
        <Card title="Tabla general">
          <JourneyStandings standings={standings} />
        </Card>
      )}
    </div>
  );
}