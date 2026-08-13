import type { StandingRow } from '@/lib/standings';

interface JourneyStandingsProps {
  standings: StandingRow[];
}

export default function JourneyStandings({ standings }: JourneyStandingsProps) {
  if (standings.length === 0) {
    return (
      <p className="text-neutral-500 text-sm">
        Aún no hay resultados cargados para armar la tabla.
      </p>
    );
  }

  return (
    <div className="overflow-x-auto rounded-lg border border-neutral-200">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-neutral-200 bg-neutral-100 text-left text-neutral-500">
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
              className="border-b border-neutral-100 last:border-0 hover:bg-neutral-50"
            >
              <td className="px-3 py-2.5 text-neutral-400">{row.position}</td>
              <td className="px-3 py-2.5 font-medium text-neutral-800">{row.playerName}</td>
              <td className="px-3 py-2.5 text-center text-neutral-600">{row.matchesPlayed}</td>
              <td className="px-3 py-2.5 text-center text-neutral-600">{row.wins}</td>
              <td className="px-3 py-2.5 text-center text-neutral-600">{row.draws}</td>
              <td className="px-3 py-2.5 text-center text-neutral-600">{row.losses}</td>
              <td className="px-3 py-2.5 text-center text-neutral-600">{row.pointsFor}</td>
              <td className="px-3 py-2.5 text-center text-neutral-600">{row.pointsAgainst}</td>
              <td
                className={`px-3 py-2.5 text-center font-medium ${
                  row.difference > 0
                    ? 'text-success-600'
                    : row.difference < 0
                      ? 'text-danger-600'
                      : 'text-neutral-500'
                }`}
              >
                {row.difference > 0 ? `+${row.difference}` : row.difference}
              </td>
              <td className="px-3 py-2.5 text-center font-semibold text-primary-700">
                {row.points}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}