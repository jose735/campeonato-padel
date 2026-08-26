import { useEffect, useState } from 'react';
import { X, BarChart3, Loader2 } from 'lucide-react';
import type { Player } from '@/types';
import type { StandingRow } from '@/lib/standings';
import { getPlayerWeightedStats } from '@/services/playerStatsService';
import { usePlayerStore } from '@/store/player-store';
import PlayerAvatar from '@/components/players/PlayerAvatar';

interface PlayerStatsModalProps {
  player: Player;
  onClose: () => void;
}

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

export default function PlayerStatsModal({ player, onClose }: PlayerStatsModalProps) {
  const players = usePlayerStore((s) => s.players);
  const [stats, setStats] = useState<StandingRow | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      setIsLoading(true);
      setError(null);
      try {
        const row = await getPlayerWeightedStats(player.id, players);
        if (!cancelled) setStats(row);
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Error al cargar estadísticas');
          setStats(null);
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
        className="flex max-h-[90vh] w-full max-w-md flex-col overflow-hidden rounded-2xl bg-white shadow-xl"
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

        <div className="overflow-y-auto px-5 py-4">
          {isLoading ? (
            <div className="flex items-center justify-center gap-2 py-12 text-sm text-neutral-500">
              <Loader2 size={18} className="animate-spin" />
              Cargando...
            </div>
          ) : error ? (
            <p className="py-8 text-center text-sm text-danger-600">{error}</p>
          ) : !stats ? (
            <p className="rounded-lg border border-dashed border-neutral-200 py-10 text-center text-sm text-neutral-500">
              Aún no hay partidos finalizados para este jugador.
            </p>
          ) : (
            <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
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
          )}
        </div>
      </div>
    </div>
  );
}
