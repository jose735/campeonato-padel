import { useEffect, useMemo, useState } from 'react';
import { usePlayerStore } from '@/store/player-store';
import { setupJourneyLineup, type SeededPlayer } from '@/lib/journeySetup';

interface PlayerSelectionModalProps {
  journeyId: number;
  onClose: () => void;
  onSuccess: () => void;
}

function shuffle<T>(array: T[]): T[] {
  const result = [...array];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

export default function PlayerSelectionModal({
  journeyId,
  onClose,
  onSuccess,
}: PlayerSelectionModalProps) {
  const { players, fetchPlayers } = usePlayerStore();
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchPlayers();
  }, [fetchPlayers]);

  const seedMap = useMemo(() => {
    const shuffled = shuffle(selectedIds);
    const map = new Map<number, number>();
    shuffled.forEach((id, index) => map.set(id, index + 1));
    return map;
  }, [selectedIds]);

  const toggleSelection = (playerId: number) => {
    setSelectedIds((prev) =>
      prev.includes(playerId) ? prev.filter((id) => id !== playerId) : [...prev, playerId]
    );
  };

  const isValidCount = selectedIds.length >= 4 && selectedIds.length % 4 === 0;

  const handleSubmit = async () => {
    if (!isValidCount) return;

    setError(null);
    setIsSubmitting(true);

    try {
      const seededPlayers: SeededPlayer[] = selectedIds.map((playerId) => ({
        playerId,
        seed: seedMap.get(playerId)!,
      }));

      await setupJourneyLineup(journeyId, seededPlayers);
      onSuccess();
      onClose();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
      <div className="w-full max-w-md rounded-lg bg-white border border-neutral-200 shadow-lg p-6">
        <h3 className="text-lg font-semibold text-neutral-800 mb-1">Seleccionar jugadores</h3>
        <p className="text-sm text-neutral-500 mb-4">
          La cantidad seleccionada debe ser múltiplo de 4.
        </p>

        <ul className="flex flex-col gap-1 max-h-80 overflow-y-auto mb-4">
          {players.map((player) => {
            const checked = selectedIds.includes(player.id);
            return (
              <li key={player.id}>
                <label className="flex items-center justify-between gap-2 rounded-md px-3 py-2.5 lg:py-2 hover:bg-neutral-100 cursor-pointer">
                  <span className="flex items-center gap-2 text-neutral-700">
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => toggleSelection(player.id)}
                      className="accent-primary-600"
                    />
                    {player.displayName}
                  </span>
                  {checked && (
                    <span className="text-xs text-neutral-400">seed {seedMap.get(player.id)}</span>
                  )}
                </label>
              </li>
            );
          })}
        </ul>

        <p className="text-sm text-neutral-500 mb-2">
          Seleccionados: {selectedIds.length}
          {!isValidCount && selectedIds.length > 0 && (
            <span className="text-warning-700"> (debe ser múltiplo de 4)</span>
          )}
        </p>

        {error && <p className="text-danger-600 text-sm mb-2">{error}</p>}

        <div className="flex justify-end gap-2 mt-4">
          <button
            onClick={onClose}
            className="rounded-md px-4 py-2.5 lg:py-2 text-sm text-neutral-600 hover:bg-neutral-100"
          >
            Cancelar
          </button>
          <button
            onClick={handleSubmit}
            disabled={!isValidCount || isSubmitting}
            className="rounded-md bg-accent-500 hover:bg-accent-600 disabled:opacity-50 px-4 py-2.5 lg:py-2 text-sm font-medium text-white transition-colors"
          >
            {isSubmitting ? 'Generando...' : 'Generar jornada'}
          </button>
        </div>
      </div>
    </div>
  );
}