import type { StandingRow } from '@/lib/standings';

interface JourneyStandingsProps {
  standings: StandingRow[];
}

export default function JourneyStandings({ standings }: JourneyStandingsProps) {
  if (standings.length === 0) {
    return (
      <p className="text-slate-500 text-sm">
        Aún no hay resultados cargados para armar la tabla.
      </p>
    );
  }

  return (
    <div className="overflow-x-auto rounded-lg border border-slate-700">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-slate-700 bg-slate-800/80 text-left text-slate-400">
            <th className="px-3 py-3 font-medium">#</th>
            <th className="px-3 py-3 font-medium">Jugador</th>
            <th className="px-3 py-3 font-medium text-center">PJ</th>
            <th className="px-3 py-3 font-medium text-center">G</th>
            <th className="px-3 py-3 font-medium text-center">E</th>
            <th className="px-3 py-3 font-medium text-center">P</th>
            <th className="px-3 py-3 font-medium text-center">PF</th>
            <th className="px-3 py-3 font-medium text-center">PC</th>
            <th className="px-3 py-3 font-medium text-center">Dif</th>
            <th className="px-3 py-3 font-medium text-center">Pts</th>
          </tr>
        </thead>
        <tbody>
          {standings.map((row) => (
            <tr
              key={row.playerId}
              className="border-b border-slate-800 last:border-0 hover:bg-slate-800/40"
            >
              <td className="px-3 py-2.5 text-slate-500">{row.position}</td>
              <td className="px-3 py-2.5 font-medium text-slate-100">
                {row.playerName}
              </td>
              <td className="px-3 py-2.5 text-center text-slate-300">
                {row.matchesPlayed}
              </td>
              <td className="px-3 py-2.5 text-center text-slate-300">
                {row.wins}
              </td>
              <td className="px-3 py-2.5 text-center text-slate-300">
                {row.draws}
              </td>
              <td className="px-3 py-2.5 text-center text-slate-300">
                {row.losses}
              </td>
              <td className="px-3 py-2.5 text-center text-slate-300">
                {row.pointsFor}
              </td>
              <td className="px-3 py-2.5 text-center text-slate-300">
                {row.pointsAgainst}
              </td>
              <td
                className={`px-3 py-2.5 text-center font-medium ${
                  row.difference > 0
                    ? 'text-emerald-400'
                    : row.difference < 0
                      ? 'text-red-400'
                      : 'text-slate-300'
                }`}
              >
                {row.difference > 0 ? `+${row.difference}` : row.difference}
              </td>
              <td className="px-3 py-2.5 text-center font-semibold text-emerald-400">
                {row.points}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}