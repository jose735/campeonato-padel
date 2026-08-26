import { useEffect, useMemo, useState } from 'react';
import { X, History, Loader2, Trophy } from 'lucide-react';
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

/** Colores de badge por torneo (cíclico). */
const TOURNAMENT_BADGE = [
  'bg-primary-100 text-primary-700',
  'bg-accent-100 text-accent-700',
  'bg-success-100 text-success-700',
  'bg-warning-100 text-warning-700',
  'bg-danger-100 text-danger-700',
];

export default function PlayerHistoryModal({
  player,
  onClose,
}: PlayerHistoryModalProps) {
  const players = usePlayerStore((s) => s.players);
  const [items, setItems] = useState<PlayerJourneyHistoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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

  const tournamentColorIndex = useMemo(() => {
    const map = new Map<number, number>();
    let i = 0;
    for (const item of items) {
      if (!map.has(item.tournamentId)) {
        map.set(item.tournamentId, i % TOURNAMENT_BADGE.length);
        i += 1;
      }
    }
    return map;
  }, [items]);

  /** Agrupar por torneo manteniendo orden de jornadas (ya vienen por fecha desc). */
  const groupedByTournament = useMemo(() => {
    const groups: {
      tournamentId: number;
      tournamentName: string;
      journeys: PlayerJourneyHistoryItem[];
    }[] = [];
    const indexByTournament = new Map<number, number>();

    for (const item of items) {
      const existing = indexByTournament.get(item.tournamentId);
      if (existing === undefined) {
        indexByTournament.set(item.tournamentId, groups.length);
        groups.push({
          tournamentId: item.tournamentId,
          tournamentName: item.tournamentName,
          journeys: [item],
        });
      } else {
        groups[existing].journeys.push(item);
      }
    }
    return groups;
  }, [items]);

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
                Historial de jornadas
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
          ) : groupedByTournament.length === 0 ? (
            <p className="rounded-lg border border-dashed border-neutral-200 py-10 text-center text-sm text-neutral-500">
              Este jugador aún no participó en ninguna jornada.
            </p>
          ) : (
            <div className="flex flex-col gap-6">
              {groupedByTournament.map((group) => {
                const badgeClass =
                  TOURNAMENT_BADGE[
                    tournamentColorIndex.get(group.tournamentId) ?? 0
                  ];

                return (
                  <section key={group.tournamentId}>
                    <div className="mb-3 flex items-center gap-2">
                      <span
                        className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${badgeClass}`}
                      >
                        <Trophy size={12} />
                        {group.tournamentName}
                      </span>
                      <span className="text-xs text-neutral-400">
                        {group.journeys.length} jornada
                        {group.journeys.length === 1 ? '' : 's'}
                      </span>
                    </div>

                    <ul className="flex flex-col gap-3">
                      {group.journeys.map((item) => (
                        <li
                          key={item.journey.id}
                          className="overflow-hidden rounded-xl border border-neutral-200 bg-neutral-50/50"
                        >
                          <div className="flex items-center justify-between gap-2 border-b border-neutral-200 bg-white px-3 py-2.5">
                            <div>
                              <p className="text-sm font-semibold text-neutral-800">
                                {formatDate(item.journey.journeyDate)}
                              </p>
                              <p className="text-xs text-neutral-400">
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
                  </section>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
