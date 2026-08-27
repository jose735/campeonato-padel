import { useEffect, useState } from 'react';
import { X, BarChart3, Loader2 } from 'lucide-react';
import type { Player } from '@/types';
import type { StandingRow } from '@/lib/standings';
import {
  getPlayerWeightedStats,
  getPlayerPartnerStats,
  getPlayerRivalStats,
} from '@/services/playerStatsService';
import { usePlayerStore } from '@/store/player-store';
import PlayerAvatar from '@/components/players/PlayerAvatar';
import SegmentedControl from '@/components/ui/SegmentedControl';

interface PlayerStatsModalProps {
  player: Player;
  onClose: () => void;
}

type StatsTab = 'general' | 'parejas' | 'rivales';

function StatCell({
  label,
  value,
  highlight,
  muted,
}: {
  label: string;
  value: string | number;
  highlight?: boolean;
  muted?: boolean;
}) {
  return (
    <div className="flex flex-col items-center gap-1 rounded-lg border border-neutral-200 bg-white px-2 py-3">
      <span className="text-[10px] font-semibold uppercase tracking-wide text-neutral-400 text-center">
        {label}
      </span>
      <span
        className={`text-base font-bold tabular-nums ${
          highlight
            ? 'text-primary-700'
            : muted
              ? 'text-neutral-500'
              : 'text-neutral-800'
        }`}
      >
        {value}
      </span>
    </div>
  );
}

function PositionBadge({ position }: { position: number }) {
  if (position === 1) {
    return (
      <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-amber-100 text-[10px] font-bold text-amber-700">
        1
      </span>
    );
  }
  if (position === 2) {
    return (
      <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-neutral-200 text-[10px] font-bold text-neutral-600">
        2
      </span>
    );
  }
  if (position === 3) {
    return (
      <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-orange-100 text-[10px] font-bold text-orange-700">
        3
      </span>
    );
  }
  return (
    <span className="inline-flex h-6 w-6 items-center justify-center text-[10px] font-medium text-neutral-400">
      {position}
    </span>
  );
}

function ptsPerMatchClass(pts: number): string {
  if (pts > 1) return 'bg-success-50 text-success-700';
  if (pts < 1) return 'bg-danger-50 text-danger-700';
  return 'bg-primary-50 text-primary-700';
}

function MiniRankingTable({
  rows,
  emptyMessage,
  nameColumnLabel,
}: {
  rows: StandingRow[];
  emptyMessage: string;
  nameColumnLabel: string;
}) {
  if (rows.length === 0) {
    return (
      <p className="rounded-lg border border-dashed border-neutral-200 py-10 text-center text-sm text-neutral-500">
        {emptyMessage}
      </p>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border border-neutral-200 bg-white">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-neutral-200 bg-neutral-50 text-left">
              <th className="w-10 whitespace-nowrap px-2 py-2.5 text-xs font-semibold uppercase tracking-wide text-neutral-400">
                Pos
              </th>
              <th className="px-2 py-2.5 text-xs font-semibold uppercase tracking-wide text-neutral-400">
                {nameColumnLabel}
              </th>
              <th className="w-14 whitespace-nowrap px-1 py-2.5 text-center text-xs font-semibold uppercase tracking-wide text-neutral-400">
                Pts/P
              </th>
              <th className="w-14 whitespace-nowrap px-1 py-2.5 text-center text-xs font-semibold uppercase tracking-wide text-neutral-400">
                Dif/P
              </th>
              <th className="hidden w-10 whitespace-nowrap px-1 py-2.5 text-center text-xs font-semibold uppercase tracking-wide text-neutral-400 min-[420px]:table-cell">
                PJ
              </th>
              <th className="hidden w-10 whitespace-nowrap px-1 py-2.5 text-center text-xs font-semibold uppercase tracking-wide text-neutral-400 min-[420px]:table-cell">
                PG
              </th>
              <th className="hidden w-10 whitespace-nowrap px-1 py-2.5 text-center text-xs font-semibold uppercase tracking-wide text-neutral-400 min-[420px]:table-cell">
                PE
              </th>
              <th className="hidden w-10 whitespace-nowrap px-1 py-2.5 text-center text-xs font-semibold uppercase tracking-wide text-neutral-400 min-[420px]:table-cell">
                PP
              </th>
              <th className="hidden w-10 whitespace-nowrap px-1 py-2.5 text-center text-xs font-semibold uppercase tracking-wide text-neutral-400 min-[420px]:table-cell">
                PF
              </th>
              <th className="hidden w-10 whitespace-nowrap px-1 py-2.5 text-center text-xs font-semibold uppercase tracking-wide text-neutral-400 min-[420px]:table-cell">
                PC
              </th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, index) => {
              const isEven = index % 2 === 1;
              return (
                <tr
                  key={row.playerId}
                  className={`border-b border-neutral-100 last:border-0 ${
                    isEven ? 'bg-neutral-50/40' : 'bg-white'
                  }`}
                >
                  <td className="w-10 px-2 py-2.5">
                    <PositionBadge position={row.position} />
                  </td>
                  <td className="min-w-0 px-2 py-2.5">
                    <span className="block truncate font-medium text-neutral-800 text-[15px]">
                      {row.playerName}
                    </span>
                  </td>
                  <td className="w-14 whitespace-nowrap px-1 py-2.5 text-center">
                    <span
                      className={`inline-flex min-w-8 items-center justify-center rounded-md px-1.5 py-0.5 text-sm font-bold tabular-nums ${ptsPerMatchClass(row.points)}`}
                    >
                      {row.points.toFixed(2)}
                    </span>
                  </td>
                  <td
                    className={`w-14 whitespace-nowrap px-1 py-2.5 text-center font-medium tabular-nums ${
                      row.difference > 0
                        ? 'text-success-600'
                        : row.difference < 0
                          ? 'text-danger-600'
                          : 'text-neutral-500'
                    }`}
                  >
                    {row.difference > 0 ? '+' : ''}
                    {row.difference.toFixed(2)}
                  </td>
                  <td className="hidden w-10 whitespace-nowrap px-1 py-2.5 text-center tabular-nums text-neutral-600 min-[420px]:table-cell">
                    {row.matchesPlayed}
                  </td>
                  <td className="hidden w-10 whitespace-nowrap px-1 py-2.5 text-center tabular-nums text-neutral-600 min-[420px]:table-cell">
                    {row.wins}
                  </td>
                  <td className="hidden w-10 whitespace-nowrap px-1 py-2.5 text-center tabular-nums text-neutral-600 min-[420px]:table-cell">
                    {row.draws}
                  </td>
                  <td className="hidden w-10 whitespace-nowrap px-1 py-2.5 text-center tabular-nums text-neutral-600 min-[420px]:table-cell">
                    {row.losses}
                  </td>
                  <td className="hidden w-10 whitespace-nowrap px-1 py-2.5 text-center tabular-nums text-neutral-600 min-[420px]:table-cell">
                    {row.pointsFor}
                  </td>
                  <td className="hidden w-10 whitespace-nowrap px-1 py-2.5 text-center tabular-nums text-neutral-600 min-[420px]:table-cell">
                    {row.pointsAgainst}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default function PlayerStatsModal({ player, onClose }: PlayerStatsModalProps) {
  const players = usePlayerStore((s) => s.players);
  const [tab, setTab] = useState<StatsTab>('general');
  const [stats, setStats] = useState<StandingRow | null>(null);
  const [partnerRows, setPartnerRows] = useState<StandingRow[]>([]);
  const [rivalRows, setRivalRows] = useState<StandingRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      setIsLoading(true);
      setError(null);
      try {
        const [row, partners, rivals] = await Promise.all([
          getPlayerWeightedStats(player.id, players),
          getPlayerPartnerStats(player.id, players),
          getPlayerRivalStats(player.id, players),
        ]);
        if (!cancelled) {
          setStats(row);
          setPartnerRows(partners);
          setRivalRows(rivals);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Error al cargar estadísticas');
          setStats(null);
          setPartnerRows([]);
          setRivalRows([]);
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [player.id, players]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  const formatDif = (value: number) => {
    const sign = value > 0 ? '+' : '';
    return `${sign}${value.toFixed(2)}`;
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
        aria-labelledby="player-stats-title"
      >
        <div className="flex items-start justify-between gap-3 border-b border-neutral-100 px-5 py-4">
          <div className="flex min-w-0 items-center gap-3">
            <PlayerAvatar player={player} size="md" />
            <div className="min-w-0">
              <p
                id="player-stats-title"
                className="truncate text-lg font-semibold text-neutral-800"
              >
                {player.displayName}
              </p>
              <p className="flex items-center gap-1.5 text-sm text-neutral-500">
                <BarChart3 size={14} />
                Estadísticas ponderadas
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

        <div className="border-b border-neutral-100 px-5 py-3">
          <SegmentedControl
            value={tab}
            onChange={setTab}
            options={[
              { label: 'General', value: 'general' },
              { label: 'Parejas', value: 'parejas' },
              { label: 'Rivales', value: 'rivales' },
            ]}
          />
        </div>

        <div className="overflow-y-auto px-5 py-4">
          {isLoading ? (
            <div className="flex items-center justify-center gap-2 py-12 text-sm text-neutral-500">
              <Loader2 size={18} className="animate-spin" />
              Cargando...
            </div>
          ) : error ? (
            <p className="py-8 text-center text-sm text-danger-600">{error}</p>
          ) : tab === 'general' ? (
            !stats ? (
              <p className="rounded-lg border border-dashed border-neutral-200 py-10 text-center text-sm text-neutral-500">
                Aún no hay partidos finalizados para este jugador.
              </p>
            ) : (
              <div className="grid grid-cols-3 gap-2">
                <StatCell label="Pts por partido" value={stats.points.toFixed(2)} highlight />
                <StatCell
                  label="Dif por partido"
                  value={formatDif(stats.difference)}
                  muted={stats.difference === 0}
                />
                <StatCell label="Jornadas Jugadas" value={stats.journeysPlayed} />
                <StatCell label="Partidos Jugados" value={stats.matchesPlayed} />
                <StatCell label="Puntos a Favor" value={stats.pointsFor} />
                <StatCell label="Puntos en Contra" value={stats.pointsAgainst} />
                <StatCell label="Partidos Ganados" value={stats.wins} />
                <StatCell label="Partidos Empatados" value={stats.draws} />
                <StatCell label="Partidos Perdidos" value={stats.losses} />
              </div>
            )
          ) : tab === 'parejas' ? (
            <MiniRankingTable
              rows={partnerRows}
              emptyMessage="Aún no hay partidos finalizados en pareja para este jugador."
              nameColumnLabel="Pareja"
            />
          ) : (
            <MiniRankingTable
              rows={rivalRows}
              emptyMessage="Aún no hay partidos finalizados contra rivales para este jugador."
              nameColumnLabel="Rival"
            />
          )}
        </div>
      </div>
    </div>
  );
}
