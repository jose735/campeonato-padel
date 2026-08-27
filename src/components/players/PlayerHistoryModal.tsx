import { useEffect, useMemo, useState } from 'react';
import { X, History, Loader2, ArrowDownWideNarrow, ArrowUpWideNarrow } from 'lucide-react';
import type { Player } from '@/types';
import {
  getPlayerJourneyHistory,
  type PlayerJourneyHistoryItem,
  type MatchOutcome,
} from '@/services/playerStatsService';
import { usePlayerStore } from '@/store/player-store';
import PlayerAvatar from '@/components/players/PlayerAvatar';

interface PlayerHistoryModalProps {
  player: Player;
  onClose: () => void;
}

const OUTCOME_STYLES: Record<
  MatchOutcome,
  { label: string; className: string }
> = {
  win: { label: 'G', className: 'bg-success-100 text-success-700' },
  draw: { label: 'E', className: 'bg-neutral-200 text-neutral-600' },
  loss: { label: 'P', className: 'bg-danger-100 text-danger-700' },
  pending: { label: '—', className: 'bg-neutral-100 text-neutral-400' },
};

function formatDate(iso: string): string {
  const d = new Date(iso.includes('T') ? iso : `${iso}T12:00:00`);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString('es-AR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

function playerName(players: Player[], id: number): string {
  return players.find((p) => p.id === id)?.displayName ?? `Jugador #${id}`;
}

type DateSortOrder = 'desc' | 'asc';

export default function PlayerHistoryModal({
  player,
  onClose,
}: PlayerHistoryModalProps) {
  const players = usePlayerStore((s) => s.players);
  const [items, setItems] = useState<PlayerJourneyHistoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dateSort, setDateSort] = useState<DateSortOrder>('desc');

  useEffect(() => {
    let cancelled = false;

    (async () => {
      setIsLoading(true);
      setError(null);
      try {
        const data = await getPlayerJourneyHistory(player.id);
        if (!cancelled) setItems(data);
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Error al cargar historial');
          setItems([]);
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [player.id]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  const sortedItems = useMemo(() => {
    const copy = [...items];
    copy.sort((a, b) => {
      const da = a.journey.journeyDate;
      const db = b.journey.journeyDate;
      if (da === db) return a.journey.id - b.journey.id;
      if (dateSort === 'desc') return db.localeCompare(da);
      return da.localeCompare(db);
    });
    return copy;
  }, [items, dateSort]);

  const toggleDateSort = () => {
    setDateSort((prev) => (prev === 'desc' ? 'asc' : 'desc'));
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4"
      onClick={onClose}
    >
      <div
        className="flex max-h-[90vh] w-full max-w-lg flex-col overflow-hidden rounded-2xl bg-white shadow-xl"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-labelledby="player-history-title"
      >
        <div className="flex items-start justify-between gap-3 border-b border-neutral-100 px-5 py-4">
          <div className="flex min-w-0 items-center gap-3">
            <PlayerAvatar player={player} size="md" />
            <div className="min-w-0">
              <p
                id="player-history-title"
                className="truncate text-lg font-semibold text-neutral-800"
              >
                {player.displayName}
              </p>
              <p className="flex items-center gap-1.5 text-sm text-neutral-500">
                <History size={14} />
                Historial de partidos
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-neutral-400 hover:bg-neutral-100 hover:text-neutral-600"
            aria-label="Cerrar"
          >
            <X size={18} />
          </button>
        </div>

        <div className="overflow-y-auto px-5 py-4">
          {isLoading ? (
            <div className="flex items-center justify-center gap-2 py-12 text-sm text-neutral-500">
              <Loader2 size={18} className="animate-spin" />
              Cargando...
            </div>
          ) : error ? (
            <p className="py-8 text-center text-sm text-danger-600">{error}</p>
          ) : sortedItems.length === 0 ? (
            <p className="rounded-lg border border-dashed border-neutral-200 py-10 text-center text-sm text-neutral-500">
              Este jugador aún no participó en ninguna jornada.
            </p>
          ) : (
            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs text-neutral-500">
                  {sortedItems.length} jornada
                  {sortedItems.length === 1 ? '' : 's'}
                </span>
                <button
                  type="button"
                  onClick={toggleDateSort}
                  className="inline-flex items-center justify-center rounded-lg border border-neutral-200 bg-white p-1.5 text-neutral-600 hover:bg-neutral-50 hover:text-neutral-800"
                  aria-label={
                    dateSort === 'desc'
                      ? 'Ordenar por fecha ascendente'
                      : 'Ordenar por fecha descendente'
                  }
                  title={
                    dateSort === 'desc'
                      ? 'Más recientes primero'
                      : 'Más antiguas primero'
                  }
                >
                  {dateSort === 'desc' ? (
                    <ArrowDownWideNarrow size={16} />
                  ) : (
                    <ArrowUpWideNarrow size={16} />
                  )}
                </button>
              </div>

              <ul className="flex flex-col gap-3">
                {sortedItems.map((item) => (
                  <li
                    key={item.journey.id}
                    className="overflow-hidden rounded-xl border border-neutral-200 bg-neutral-50/50"
                  >
                    <div className="flex items-center justify-between gap-2 border-b border-neutral-200 bg-white px-3 py-2.5">
                      <div>
                        <p className="text-sm font-semibold text-neutral-800">
                          {formatDate(item.journey.journeyDate)}
                        </p>
                        <p className="text-xs text-neutral-500">
                          {item.tournamentName}
                          {' — '}
                          {item.journey.status === 'finished'
                            ? 'Finalizada'
                            : 'Abierta'}
                        </p>
                      </div>
                    </div>

                    {item.matches.length === 0 ? (
                      <p className="px-3 py-3 text-sm text-neutral-500">
                        Sin partidos generados.
                      </p>
                    ) : (
                      <ul className="divide-y divide-neutral-100">
                        {item.matches.map((mv) => {
                          const outcome = OUTCOME_STYLES[mv.outcome];
                          const partner = playerName(players, mv.partnerId);
                          const opp1 = playerName(players, mv.opponentIds[0]);
                          const opp2 = playerName(players, mv.opponentIds[1]);

                          return (
                            <li
                              key={mv.match.id}
                              className="flex items-center gap-3 px-3 py-2.5"
                            >
                              <span className="w-8 shrink-0 text-center text-xs font-medium text-neutral-400">
                                R{mv.round}
                              </span>
                              <div className="min-w-0 flex-1">
                                <p className="truncate text-sm text-neutral-800">
                                  <span className="font-medium">
                                    {player.displayName}
                                  </span>
                                  {' / '}
                                  {partner}
                                </p>
                                <p className="truncate text-sm text-neutral-500">
                                  vs {opp1} / {opp2}
                                </p>
                              </div>
                              <div className="flex shrink-0 items-center gap-2">
                                <span className="tabular-nums text-sm font-bold text-neutral-800">
                                  {mv.outcome === 'pending'
                                    ? '— : —'
                                    : `${mv.scoreOwn} : ${mv.scoreOpp}`}
                                </span>
                                <span
                                  className={`inline-flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold ${outcome.className}`}
                                >
                                  {outcome.label}
                                </span>
                              </div>
                            </li>
                          );
                        })}
                      </ul>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
