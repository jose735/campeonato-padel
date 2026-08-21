import { useEffect, useMemo, useState } from "react";
import { Search, X, Check, Loader2, Users } from "lucide-react";
import { usePlayerStore } from "@/store/player-store";
import { setupJourneyLineup, type SeededPlayer } from "@/lib/journeySetup";
import { replacePlayerInJourney } from "@/services/journeyLineupService";
import { getParticipantsByJourneyId } from "@/services/journeyParticipantService";
import { journeyHasScores } from "@/services/journeyMatchService";

export type PlayerSelectionMode = "create" | "replace";

interface PlayerSelectionModalProps {
  journeyId: number;
  maxPlayers: number;
  fieldsQuantity: number;
  mode?: PlayerSelectionMode;
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
  mode = "create",
  onClose,
  onSuccess,
}: PlayerSelectionModalProps) {
  const isReplace = mode === "replace";

  const { players, fetchPlayers } = usePlayerStore();
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  /** En modo replace: seed fijo por playerId (no se re-shufflea). */
  const [fixedSeedMap, setFixedSeedMap] = useState<Map<number, number>>(
    new Map(),
  );
  /** En modo replace: ids originales al abrir el modal. */
  const [originalIds, setOriginalIds] = useState<number[]>([]);
  const [isLoadingParticipants, setIsLoadingParticipants] = useState(isReplace);
  const [hasScores, setHasScores] = useState(false);
  const [search, setSearch] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchPlayers();
  }, [fetchPlayers]);

  // Cargar participantes existentes y chequear marcadores solo en modo replace
  useEffect(() => {
    if (!isReplace) return;

    let cancelled = false;

    (async () => {
      setIsLoadingParticipants(true);
      setError(null);
      setHasScores(false);
      try {
        const [participants, scoresLoaded] = await Promise.all([
          getParticipantsByJourneyId(journeyId),
          journeyHasScores(journeyId),
        ]);

        if (cancelled) return;

        const ids = participants.map((p) => p.playerId);
        const seedMap = new Map<number, number>();
        participants.forEach((p) => seedMap.set(p.playerId, p.seed));

        setOriginalIds(ids);
        setSelectedIds(ids);
        setFixedSeedMap(seedMap);
        setHasScores(scoresLoaded);

        if (scoresLoaded) {
          setError(
            "No se puede reemplazar un jugador porque la jornada ya tiene marcadores cargados.",
          );
        }
      } catch (err) {
        if (!cancelled) {
          setError((err as Error).message);
        }
      } finally {
        if (!cancelled) setIsLoadingParticipants(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [isReplace, journeyId]);

  const toggleSelection = (playerId: number) => {
    setSelectedIds((prev) => {
      const isChecked = prev.includes(playerId);

      if (isReplace) {
        const removed = originalIds.filter((id) => !prev.includes(id));
        const added = prev.filter((id) => !originalIds.includes(id));

        if (isChecked) {
          // Desmarcar
          const isOriginalPlayer = originalIds.includes(playerId);
          if (isOriginalPlayer) {
            // Solo se puede desmarcar 1 original
            if (removed.length >= 1) return prev;
            // Si ya hay un nuevo seleccionado, al desmarcar el original también
            // quitamos el nuevo para volver a estado inicial limpio
            return prev.filter(
              (id) => id !== playerId && originalIds.includes(id),
            );
          }
          // Desmarcar el jugador nuevo → ok
          return prev.filter((id) => id !== playerId);
        }

        // Marcar (agregar)
        // 1) Restaurar el original que se había desmarcado
        if (removed.length === 1 && removed[0] === playerId) {
          return [...prev, playerId];
        }
        // 2) Agregar un jugador nuevo solo si ya se desmarcó exactamente uno
        //    y aún no hay un reemplazo seleccionado
        if (removed.length !== 1) return prev;
        if (added.length >= 1) return prev;
        if (originalIds.includes(playerId)) return prev;
        return [...prev, playerId];
      }

      // Modo create
      if (isChecked) {
        return prev.filter((id) => id !== playerId);
      }
      if (prev.length >= maxPlayers) return prev;
      return [...prev, playerId];
    });
  };

  // Seeds: en create se shufflean; en replace se mantienen fijos y el nuevo hereda
  const seedMap = useMemo(() => {
    if (isReplace) {
      const map = new Map(fixedSeedMap);
      // Si hay un jugador nuevo, hereda el seed del que se quitó
      const removed = originalIds.filter((id) => !selectedIds.includes(id));
      const added = selectedIds.filter((id) => !originalIds.includes(id));
      if (removed.length === 1 && added.length === 1) {
        const oldSeed = fixedSeedMap.get(removed[0]);
        if (oldSeed != null) {
          map.delete(removed[0]);
          map.set(added[0], oldSeed);
        }
      }
      return map;
    }

    const shuffled = shuffle(selectedIds);
    const map = new Map<number, number>();
    shuffled.forEach((id, index) => map.set(id, index + 1));
    return map;
  }, [isReplace, selectedIds, fixedSeedMap, originalIds]);

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

  // En replace: exactamente 1 quitado y 1 agregado
  const removedIds = isReplace
    ? originalIds.filter((id) => !selectedIds.includes(id))
    : [];
  const addedIds = isReplace
    ? selectedIds.filter((id) => !originalIds.includes(id))
    : [];
  const isValidReplace =
    isReplace &&
    isValidCount &&
    removedIds.length === 1 &&
    addedIds.length === 1;

  const canSubmit = isReplace
    ? isValidReplace && !hasScores
    : isValidCount;

  const getPlayerName = (playerId: number): string => {
    const player = players.find((p) => p.id === playerId);
    return player?.displayName ?? `Jugador #${playerId}`;
  };

  const handleSubmit = async () => {
    if (!canSubmit) return;

    if (isReplace) {
      const oldName = getPlayerName(removedIds[0]);
      const newName = getPlayerName(addedIds[0]);
      const confirmed = window.confirm(
        `¿Confirmás el reemplazo?\n\n` +
          `Se va a reemplazar a "${oldName}" por "${newName}".\n` +
          `El nuevo jugador heredará el seed y ocupará su lugar en todas las rondas.\n\n` +
          `Esta acción no se puede deshacer fácilmente.`,
      );
      if (!confirmed) return;
    }

    setError(null);
    setIsSubmitting(true);

    try {
      if (isReplace) {
        await replacePlayerInJourney(
          journeyId,
          removedIds[0],
          addedIds[0],
        );
      } else {
        const seededPlayers: SeededPlayer[] = selectedIds.map((playerId) => ({
          playerId,
          seed: seedMap.get(playerId)!,
        }));

        await setupJourneyLineup(journeyId, seededPlayers, fieldsQuantity);
      }

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
              {isReplace ? "Reemplazar jugador" : "Seleccionar jugadores"}
            </h3>
            <p className="text-sm text-neutral-500">
              {isReplace
                ? "Desmarcá al jugador que se ausenta y seleccioná al reemplazo. El seed se hereda."
                : `Debés seleccionar exactamente ${maxPlayers} jugadores.`}
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
          {isLoadingParticipants ? (
            <p className="px-2 py-6 text-center text-sm text-neutral-400">
              Cargando jugadores de la jornada...
            </p>
          ) : filteredPlayers.length === 0 ? (
            <p className="px-2 py-6 text-center text-sm text-neutral-400">
              No se encontraron jugadores.
            </p>
          ) : (
            <ul className="flex flex-col gap-1">
              {filteredPlayers.map((player) => {
                const checked = selectedIds.includes(player.id);
                const isOriginal = originalIds.includes(player.id);
                const isNew = isReplace && checked && !isOriginal;

                return (
                  <li key={player.id}>
                    <button
                      type="button"
                      onClick={() => toggleSelection(player.id)}
                      disabled={isLoadingParticipants || hasScores}
                      className={`flex w-full items-center justify-between gap-2 rounded-lg px-3 py-2.5 text-left transition-colors ${
                        checked
                          ? isNew
                            ? "bg-accent-50 ring-1 ring-accent-200"
                            : "bg-primary-50 ring-1 ring-primary-200"
                          : hasScores
                            ? "opacity-60"
                            : "hover:bg-neutral-50"
                      }`}
                    >
                      <span className="flex min-w-0 items-center gap-3">
                        <span
                          className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-semibold ${
                            isNew
                              ? "bg-accent-100 text-accent-700"
                              : "bg-primary-100 text-primary-700"
                          }`}
                        >
                          {initials(player.firstName, player.lastName)}
                        </span>
                        <span className="truncate text-sm font-medium text-neutral-800">
                          {player.displayName}
                          {isNew && (
                            <span className="ml-1.5 text-xs font-normal text-accent-600">
                              (nuevo)
                            </span>
                          )}
                        </span>
                      </span>

                      {checked ? (
                        <span
                          className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white ${
                            isNew ? "bg-accent-600" : "bg-primary-600"
                          }`}
                        >
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
            {isReplace ? (
              hasScores ? (
                <span className="text-danger-600">
                  Marcadores ya cargados
                </span>
              ) : removedIds.length === 0 ? (
                <span className="text-neutral-500">
                  Desmarcá al jugador a reemplazar
                </span>
              ) : addedIds.length === 0 ? (
                <span className="text-warning-700">
                  Seleccioná el jugador de reemplazo
                </span>
              ) : (
                <span className="text-success-700">Listo para guardar</span>
              )
            ) : (
              selectedIds.length > 0 &&
              !isValidCount && (
                <span className="text-warning-700">
                  Faltan {4 - remainder} para completar grupo de 4
                </span>
              )
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
              disabled={!canSubmit || isSubmitting || isLoadingParticipants}
              className="inline-flex items-center gap-1.5 rounded-lg bg-accent-500 px-4 py-2 text-sm font-semibold text-white hover:bg-accent-600 disabled:opacity-50 transition-colors"
            >
              {isSubmitting ? (
                <Loader2 size={14} className="animate-spin" />
              ) : (
                <Check size={14} />
              )}
              {isSubmitting
                ? isReplace
                  ? "Reemplazando..."
                  : "Generando..."
                : isReplace
                  ? "Guardar reemplazo"
                  : "Generar jornada"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
