import type { StandingRow } from "@/lib/standings";

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

export default function JourneyStandings({
  standings,
  showDecimals = false,
  variant = "general",
}: JourneyStandingsProps) {
  const isPonderada = variant === "ponderada";
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

              {/* Pts */}
              <th className="w-14 whitespace-nowrap px-1 py-3 text-center text-xs font-semibold uppercase tracking-wide text-neutral-400">
                {isPonderada ? "Pts/P" : "Pts"}
              </th>

              {/* Dif */}
              <th className="w-14 whitespace-nowrap px-1 py-3 text-center text-xs font-semibold uppercase tracking-wide text-neutral-400">
                {isPonderada ? "Dif/P" : "Dif"}
              </th>

              {isPonderada && (
                <th className="w-12 whitespace-nowrap px-1.5 py-3 text-center text-xs font-semibold uppercase tracking-wide text-neutral-400">
                  JJ
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

                  {/* Jugador */}
                  <td className="min-w-0 px-2 py-3">
                    <span className="block truncate font-medium text-neutral-800 text-[17px]">
                      {row.playerName}
                    </span>
                  </td>

                  {/* Pts */}
                  <td className="w-14 whitespace-nowrap px-1 py-3 text-center">
                    <span className="inline-flex min-w-8 items-center justify-center rounded-md bg-primary-50 px-1.5 py-0.5 text-sm font-bold tabular-nums text-primary-700">
                      {showDecimals ? row.points.toFixed(2) : row.points}
                    </span>
                  </td>

                  {/* Dif */}
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

                  {/* JJ — solo ponderada */}
                  {isPonderada && (
                    <td className="w-12 whitespace-nowrap px-1.5 py-3 text-center font-medium tabular-nums text-neutral-600">
                      {row.journeysPlayed}
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
  );
}
