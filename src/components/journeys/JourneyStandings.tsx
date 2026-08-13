import type { StandingRow } from "@/lib/standings";

interface JourneyStandingsProps {
  standings: StandingRow[];
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

function initials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0] ?? ""}${parts[1][0] ?? ""}`.toUpperCase();
}

export default function JourneyStandings({ standings }: JourneyStandingsProps) {
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
        <table className="w-full min-w-160 text-sm">
          <thead>
            <tr className="border-b border-neutral-200 bg-neutral-50 text-left">
              <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-neutral-400">
                Pos
              </th>
              <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-neutral-400">
                Jugador
              </th>
              <th className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wide text-neutral-400">
                Pts
              </th>
              <th className="px-3 py-3 text-center text-xs font-semibold uppercase tracking-wide text-neutral-400">
                Dif
              </th>
              <th className="px-3 py-3 text-center text-xs font-semibold uppercase tracking-wide text-neutral-400">
                PJ
              </th>
              <th className="px-3 py-3 text-center text-xs font-semibold uppercase tracking-wide text-neutral-400">
                PG
              </th>
              <th className="px-3 py-3 text-center text-xs font-semibold uppercase tracking-wide text-neutral-400">
                PE
              </th>
              <th className="px-3 py-3 text-center text-xs font-semibold uppercase tracking-wide text-neutral-400">
                PP
              </th>
              <th className="px-3 py-3 text-center text-xs font-semibold uppercase tracking-wide text-neutral-400">
                PF
              </th>
              <th className="px-3 py-3 text-center text-xs font-semibold uppercase tracking-wide text-neutral-400">
                PC
              </th>
            </tr>
          </thead>
          <tbody>
            {standings.map((row, index) => {
              const isTop3 = row.position <= 3;
              const isEven = index % 2 === 1;

              return (
                <tr
                  key={row.playerId}
                  className={`border-b border-neutral-100 last:border-0 transition-colors hover:bg-primary-50/40 ${
                    isEven ? "bg-neutral-50/40" : "bg-white"
                  }`}
                >
                  <td className="px-4 py-3">
                    <PositionBadge position={row.position} />
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <span
                        className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-semibold ${
                          isTop3
                            ? "bg-primary-100 text-primary-700"
                            : "bg-neutral-100 text-neutral-600"
                        }`}
                      >
                        {initials(row.playerName)}
                      </span>
                      <span className="font-medium text-neutral-800">
                        {row.playerName}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className="inline-flex min-w-8 items-center justify-center rounded-md bg-primary-50 px-2 py-0.5 text-sm font-bold tabular-nums text-primary-700">
                      {row.points}
                    </span>
                  </td>
                  <td
                    className={`px-3 py-3 text-center font-medium tabular-nums ${
                      row.difference > 0
                        ? "text-success-600"
                        : row.difference < 0
                          ? "text-danger-600"
                          : "text-neutral-500"
                    }`}
                  >
                    {row.difference > 0 ? `+${row.difference}` : row.difference}
                  </td>
                  <td className="px-3 py-3 text-center tabular-nums text-neutral-600">
                    {row.matchesPlayed}
                  </td>
                  <td className="px-3 py-3 text-center tabular-nums text-neutral-600">
                    {row.wins}
                  </td>
                  <td className="px-3 py-3 text-center tabular-nums text-neutral-600">
                    {row.draws}
                  </td>
                  <td className="px-3 py-3 text-center tabular-nums text-neutral-600">
                    {row.losses}
                  </td>
                  <td className="px-3 py-3 text-center tabular-nums text-neutral-600">
                    {row.pointsFor}
                  </td>
                  <td className="px-3 py-3 text-center tabular-nums text-neutral-600">
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
