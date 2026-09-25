import { useState } from "react";
import type { StandingRow } from "@/lib/standings";
import type { Player } from "@/types";
import { usePlayerStore } from "@/store/player-store";
import PlayerStatsModal from "@/components/players/PlayerStatsModal";
import PlayerHistoryModal from "@/components/players/PlayerHistoryModal";

interface JourneyStandingsProps {
  standings: StandingRow[];
  showDecimals?: boolean;
  variant?: "general" | "ponderada";
}

function PositionBadge({ position }: { position: number }) {
  if (position === 1) {
    return (
      <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-amber-100 text-xs font-bold text-amber-700">
        1
      </span>
    );
  }

  if (position === 2) {
    return (
      <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-neutral-200 text-xs font-bold text-neutral-600">
        2
      </span>
    );
  }

  if (position === 3) {
    return (
      <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-orange-100 text-xs font-bold text-orange-700">
        3
      </span>
    );
  }

  return (
    <span className="inline-flex h-7 w-7 items-center justify-center text-xs font-medium text-neutral-400">
      {position}
    </span>
  );
}

function formatFac(fac: number | undefined): string {
  if (fac === undefined) return "—";
  if (fac === 1) return "1";
  return fac.toFixed(1);
}

export default function JourneyStandings({
  standings,
  showDecimals = false,
  variant = "general",
}: JourneyStandingsProps) {
  const isPonderada = variant === "ponderada";
  const players = usePlayerStore((s) => s.players);
  const [statsPlayer, setStatsPlayer] = useState<Player | null>(null);
  const [historyPlayer, setHistoryPlayer] = useState<Player | null>(null);

  const resolvePlayer = (playerId: number, fallbackName: string): Player => {
    const found = players.find((p) => p.id === playerId);
    if (found) return found;
    // Fallback mínimo si el store aún no tiene el jugador
    return {
      id: playerId,
      firstName: fallbackName,
      lastName: "",
      displayName: fallbackName,
      createdAt: "",
      updatedAt: "",
    };
  };

  const openStats = (row: StandingRow) => {
    setStatsPlayer(resolvePlayer(row.playerId, row.playerName));
  };

  const openHistory = (row: StandingRow) => {
    setHistoryPlayer(resolvePlayer(row.playerId, row.playerName));
  };

  if (standings.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-neutral-200 bg-neutral-50 px-4 py-10 text-center">
        <p className="text-sm text-neutral-500">
          Aún no hay resultados cargados para armar la tabla.
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="overflow-hidden rounded-xl border border-neutral-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm min-[480px]:min-w-[600px]">
            <thead>
              <tr className="border-b border-neutral-200 bg-neutral-50 text-left">
                {/* Pos */}
                <th className="w-12 whitespace-nowrap px-2 py-3 text-xs font-semibold uppercase tracking-wide text-neutral-400">
                  Pos
                </th>

                {/* Jugador */}
                <th className="px-2 py-3 text-xs font-semibold uppercase tracking-wide text-neutral-400">
                  Jugador
                </th>

                {/* PTS/F — solo ponderada, primera métrica */}
                {isPonderada && (
                  <th className="w-14 whitespace-nowrap px-1 py-3 text-center text-xs font-semibold uppercase tracking-wide text-neutral-400">
                    Pts/F
                  </th>
                )}

                {/* Pts (general) o se muestra más abajo en ponderada */}
                {!isPonderada && (
                  <th className="w-14 whitespace-nowrap px-1 py-3 text-center text-xs font-semibold uppercase tracking-wide text-neutral-400">
                    Pts
                  </th>
                )}

                {/* Dif / Dif/P */}
                <th className="w-14 whitespace-nowrap px-1 py-3 text-center text-xs font-semibold uppercase tracking-wide text-neutral-400">
                  {isPonderada ? "Dif/P" : "Dif"}
                </th>

                {/* JJ — solo ponderada */}
                {isPonderada && (
                  <th className="w-12 whitespace-nowrap px-1.5 py-3 text-center text-xs font-semibold uppercase tracking-wide text-neutral-400">
                    JJ
                  </th>
                )}

                {/* PTS/P — solo ponderada; oculta en móvil vertical */}
                {isPonderada && (
                  <th className="hidden w-14 whitespace-nowrap px-1 py-3 text-center text-xs font-semibold uppercase tracking-wide text-neutral-400 min-[480px]:table-cell">
                    Pts/P
                  </th>
                )}

                {/* FAC — solo ponderada; oculta en móvil vertical */}
                {isPonderada && (
                  <th className="hidden w-12 whitespace-nowrap px-1.5 py-3 text-center text-xs font-semibold uppercase tracking-wide text-neutral-400 min-[480px]:table-cell">
                    Fac
                  </th>
                )}

                {/* PJ */}
                <th className="hidden w-12 whitespace-nowrap px-1.5 py-3 text-center text-xs font-semibold uppercase tracking-wide text-neutral-400 min-[480px]:table-cell">
                  PJ
                </th>

                {/* PG */}
                <th className="hidden w-12 whitespace-nowrap px-1.5 py-3 text-center text-xs font-semibold uppercase tracking-wide text-neutral-400 min-[480px]:table-cell">
                  PG
                </th>

                {/* PE */}
                <th className="hidden w-12 whitespace-nowrap px-1.5 py-3 text-center text-xs font-semibold uppercase tracking-wide text-neutral-400 min-[480px]:table-cell">
                  PE
                </th>

                {/* PP */}
                <th className="hidden w-12 whitespace-nowrap px-1.5 py-3 text-center text-xs font-semibold uppercase tracking-wide text-neutral-400 min-[480px]:table-cell">
                  PP
                </th>

                {/* PF */}
                <th className="hidden w-12 whitespace-nowrap px-1.5 py-3 text-center text-xs font-semibold uppercase tracking-wide text-neutral-400 min-[480px]:table-cell">
                  PF
                </th>

                {/* PC */}
                <th className="hidden w-12 whitespace-nowrap px-1.5 py-3 text-center text-xs font-semibold uppercase tracking-wide text-neutral-400 min-[480px]:table-cell">
                  PC
                </th>
              </tr>
            </thead>

            <tbody>
              {standings.map((row, index) => {
                const isEven = index % 2 === 1;

                return (
                  <tr
                    key={row.playerId}
                    className={`border-b border-neutral-100 last:border-0 transition-colors hover:bg-primary-50/40 ${
                      isEven ? "bg-neutral-50/40" : "bg-white"
                    }`}
                  >
                    {/* Pos */}
                    <td className="w-12 px-2 py-3">
                      <PositionBadge position={row.position} />
                    </td>

                    {/* Jugador — click abre estadísticas */}
                    <td className="min-w-0 px-2 py-3">
                      <button
                        type="button"
                        onClick={() => openStats(row)}
                        className="block max-w-full truncate text-left font-medium text-neutral-800 text-[17px] hover:text-primary-700 hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-400 focus-visible:ring-offset-1 rounded"
                        title={`Ver estadísticas de ${row.playerName}`}
                      >
                        {row.playerName}
                      </button>
                    </td>

                    {/* PTS/F — solo ponderada; click abre historial */}
                    {isPonderada && (
                      <td className="w-14 whitespace-nowrap px-1 py-3 text-center">
                        <button
                          type="button"
                          onClick={() => openHistory(row)}
                          className="inline-flex min-w-8 items-center justify-center rounded-md bg-primary-50 px-1.5 py-0.5 text-sm font-bold tabular-nums text-primary-700 hover:bg-primary-100 hover:ring-1 hover:ring-primary-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-400"
                          title={`Ver historial de ${row.playerName}`}
                        >
                          {(row.pointsFinal ?? row.points).toFixed(2)}
                        </button>
                      </td>
                    )}

                    {/* Pts — solo general; click abre historial */}
                    {!isPonderada && (
                      <td className="w-14 whitespace-nowrap px-1 py-3 text-center">
                        <button
                          type="button"
                          onClick={() => openHistory(row)}
                          className="inline-flex min-w-8 items-center justify-center rounded-md bg-primary-50 px-1.5 py-0.5 text-sm font-bold tabular-nums text-primary-700 hover:bg-primary-100 hover:ring-1 hover:ring-primary-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-400"
                          title={`Ver historial de ${row.playerName}`}
                        >
                          {row.points}
                        </button>
                      </td>
                    )}

                    {/* Dif / Dif/P */}
                    <td
                      className={`w-14 whitespace-nowrap px-1 py-3 text-center font-medium tabular-nums ${
                        row.difference > 0
                          ? "text-success-600"
                          : row.difference < 0
                            ? "text-danger-600"
                            : "text-neutral-500"
                      }`}
                    >
                      {row.difference > 0 ? "+" : ""}
                      {showDecimals ? row.difference.toFixed(2) : row.difference}
                    </td>

                    {/* JJ — solo ponderada; click abre historial */}
                    {isPonderada && (
                      <td className="w-12 whitespace-nowrap px-1.5 py-3 text-center">
                        <button
                          type="button"
                          onClick={() => openHistory(row)}
                          className="font-medium tabular-nums text-neutral-600 hover:text-primary-700 hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-400 rounded px-0.5"
                          title={`Ver historial de ${row.playerName}`}
                        >
                          {row.journeysPlayed}
                        </button>
                      </td>
                    )}

                    {/* PTS/P — solo ponderada; oculta en móvil vertical */}
                    {isPonderada && (
                      <td className="hidden w-14 whitespace-nowrap px-1 py-3 text-center tabular-nums text-neutral-600 min-[480px]:table-cell">
                        {row.points.toFixed(2)}
                      </td>
                    )}

                    {/* FAC — solo ponderada; oculta en móvil vertical */}
                    {isPonderada && (
                      <td className="hidden w-12 whitespace-nowrap px-1.5 py-3 text-center font-medium tabular-nums text-neutral-600 min-[480px]:table-cell">
                        {formatFac(row.fac)}
                      </td>
                    )}

                    {/* PJ */}
                    <td className="hidden w-12 whitespace-nowrap px-1.5 py-3 text-center tabular-nums text-neutral-600 min-[480px]:table-cell">
                      {row.matchesPlayed}
                    </td>

                    {/* PG */}
                    <td className="hidden w-12 whitespace-nowrap px-1.5 py-3 text-center tabular-nums text-neutral-600 min-[480px]:table-cell">
                      {row.wins}
                    </td>

                    {/* PE */}
                    <td className="hidden w-12 whitespace-nowrap px-1.5 py-3 text-center tabular-nums text-neutral-600 min-[480px]:table-cell">
                      {row.draws}
                    </td>

                    {/* PP */}
                    <td className="hidden w-12 whitespace-nowrap px-1.5 py-3 text-center tabular-nums text-neutral-600 min-[480px]:table-cell">
                      {row.losses}
                    </td>

                    {/* PF */}
                    <td className="hidden w-12 whitespace-nowrap px-1.5 py-3 text-center tabular-nums text-neutral-600 min-[480px]:table-cell">
                      {row.pointsFor}
                    </td>

                    {/* PC */}
                    <td className="hidden w-12 whitespace-nowrap px-1.5 py-3 text-center tabular-nums text-neutral-600 min-[480px]:table-cell">
                      {row.pointsAgainst}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {statsPlayer && (
        <PlayerStatsModal
          player={statsPlayer}
          onClose={() => setStatsPlayer(null)}
        />
      )}
      {historyPlayer && (
        <PlayerHistoryModal
          player={historyPlayer}
          onClose={() => setHistoryPlayer(null)}
        />
      )}
    </>
  );
}
