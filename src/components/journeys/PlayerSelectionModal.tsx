import { useEffect, useMemo, useState } from "react";
import { Search, X, Check, Loader2, Users } from "lucide-react";
import { usePlayerStore } from "@/store/player-store";
import { setupJourneyLineup, type SeededPlayer } from "@/lib/journeySetup";

interface PlayerSelectionModalProps {
  journeyId: number;
  maxPlayers: number;
  fieldsQuantity: number;
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

function initials(firstName: string, lastName: string): string {
  return `${firstName[0] ?? ""}${lastName[0] ?? ""}`.toUpperCase();
}

export default function PlayerSelectionModal({
  journeyId,
  maxPlayers,
  fieldsQuantity,
  onClose,
  onSuccess,
}: PlayerSelectionModalProps) {
  const { players, fetchPlayers } = usePlayerStore();
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [search, setSearch] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchPlayers();
  }, [fetchPlayers]);

  const toggleSelection = (playerId: number) => {
  setSelectedIds((prev) => {
    if (prev.includes(playerId)) {
      return prev.filter((id) => id !== playerId);
    }

    if (prev.length >= maxPlayers) {
      return prev;
    }

    return [...prev, playerId];
  });
};

  const seedMap = useMemo(() => {
    const shuffled = shuffle(selectedIds);
    const map = new Map<number, number>();
    shuffled.forEach((id, index) => map.set(id, index + 1));
    return map;
  }, [selectedIds]);

  const filteredPlayers = useMemo(() => {
  const term = search.trim().toLowerCase();

  const sortedPlayers = [...players].sort((a, b) =>
    a.displayName.localeCompare(b.displayName, "es", {
      sensitivity: "base",
    }),
  );

  if (!term) return sortedPlayers;

  return sortedPlayers.filter((p) =>
    p.displayName.toLowerCase().includes(term),
  );
}, [players, search]);

  const isValidCount = selectedIds.length === maxPlayers;
  const remainder = selectedIds.length % 4;

  const handleSubmit = async () => {
    if (!isValidCount) return;

    setError(null);
    setIsSubmitting(true);

    try {
      const seededPlayers: SeededPlayer[] = selectedIds.map((playerId) => ({
        playerId,
        seed: seedMap.get(playerId)!,
      }));

      await setupJourneyLineup(journeyId, seededPlayers, fieldsQuantity);
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
      <div className="flex max-h-[85vh] w-full max-w-md flex-col rounded-xl border border-neutral-200 bg-white shadow-lg">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-neutral-100 px-5 py-4">
          <div>
            <h3 className="text-base font-semibold text-neutral-800">
              Seleccionar jugadores
            </h3>
            <p className="text-sm text-neutral-500">
              Debés seleccionar exactamente {maxPlayers} jugadores.
            </p>
          </div>
          <button
            onClick={onClose}
            className="rounded-md p-1.5 text-neutral-400 hover:bg-neutral-100 hover:text-neutral-600"
            aria-label="Cerrar"
          >
            <X size={18} />
          </button>
        </div>

        {/* Buscador */}
        <div className="border-b border-neutral-100 px-5 py-3">
          <div className="relative">
            <Search
              size={16}
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400"
            />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar jugador..."
              className="w-full rounded-lg border border-neutral-300 bg-white py-2 pl-9 pr-3 text-sm text-neutral-800 focus:outline-none focus:ring-2 focus:ring-primary-500/40 focus:border-primary-500"
            />
          </div>
        </div>

        {/* Lista */}
        <div className="flex-1 overflow-y-auto px-3 py-2">
          {filteredPlayers.length === 0 ? (
            <p className="px-2 py-6 text-center text-sm text-neutral-400">
              No se encontraron jugadores.
            </p>
          ) : (
            <ul className="flex flex-col gap-1">
              {filteredPlayers.map((player) => {
                const checked = selectedIds.includes(player.id);
                return (
                  <li key={player.id}>
                    <button
                      type="button"
                      onClick={() => toggleSelection(player.id)}
                      className={`flex w-full items-center justify-between gap-2 rounded-lg px-3 py-2.5 text-left transition-colors ${
                        checked
                          ? "bg-primary-50 ring-1 ring-primary-200"
                          : "hover:bg-neutral-50"
                      }`}
                    >
                      <span className="flex min-w-0 items-center gap-3">
                        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary-100 text-xs font-semibold text-primary-700">
                          {initials(player.firstName, player.lastName)}
                        </span>
                        <span className="truncate text-sm font-medium text-neutral-800">
                          {player.displayName}
                        </span>
                      </span>

                      {checked ? (
                        <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary-600 text-xs font-bold text-white">
                          {seedMap.get(player.id)}
                        </span>
                      ) : (
                        <span className="h-6 w-6 shrink-0 rounded-full border-2 border-neutral-200" />
                      )}
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-neutral-100 px-5 py-4">
          <div className="mb-3 flex items-center justify-between text-sm">
            <span className="inline-flex items-center gap-1.5 text-neutral-600">
              <Users size={14} />
              {selectedIds.length} / {maxPlayers} seleccionados
            </span>
            {selectedIds.length > 0 && !isValidCount && (
              <span className="text-warning-700">
                Faltan {4 - remainder} para completar grupo de 4
              </span>
            )}
          </div>

          {error && <p className="mb-3 text-sm text-danger-600">{error}</p>}

          <div className="flex justify-end gap-2">
            <button
              onClick={onClose}
              className="rounded-lg px-4 py-2 text-sm font-medium text-neutral-600 hover:bg-neutral-100"
            >
              Cancelar
            </button>
            <button
              onClick={handleSubmit}
              disabled={!isValidCount || isSubmitting}
              className="inline-flex items-center gap-1.5 rounded-lg bg-accent-500 px-4 py-2 text-sm font-semibold text-white hover:bg-accent-600 disabled:opacity-50 transition-colors"
            >
              {isSubmitting ? (
                <Loader2 size={14} className="animate-spin" />
              ) : (
                <Check size={14} />
              )}
              {isSubmitting ? "Generando..." : "Generar jornada"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
