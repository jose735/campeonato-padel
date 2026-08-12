import type { JourneyMatch, Player } from "@/types";

export type StandingRow = {
  playerId: number;
  playerName: string;
  position: number;
  points: number;
  wins: number;
  draws: number;
  losses: number;
  matchesPlayed: number;
  pointsFor: number; // Puntos a favor
  pointsAgainst: number; // Puntos en contra
  difference: number; // PF - PC
};

/**
 * Calcula la tabla de posiciones a partir de un conjunto de partidos.
 * - Victoria: cada jugador de la pareja ganadora suma 2 pts
 * - Empate: cada uno de los 4 jugadores suma 1 pt
 * - Derrota: 0 pts
 * - PF: marcador propio en victorias y empates
 * - PC: marcador rival en derrotas
 * - Dif: PF - PC
 */
export function calculateStandings(
  matches: JourneyMatch[],
  players: Player[],
): StandingRow[] {
  const stats = new Map<
    number,
    {
      points: number;
      wins: number;
      draws: number;
      losses: number;
      matchesPlayed: number;
      pointsFor: number;
      pointsAgainst: number;
    }
  >();

  const ensure = (playerId: number) => {
    if (!stats.has(playerId)) {
      stats.set(playerId, {
        points: 0,
        wins: 0,
        draws: 0,
        losses: 0,
        matchesPlayed: 0,
        pointsFor: 0,
        pointsAgainst: 0,
      });
    }
    return stats.get(playerId)!;
  };

  for (const match of matches) {
    const hasScore =
      match.scoreA > 0 || match.scoreB > 0 || match.pointsObtained > 0;

    if (!hasScore) continue;

    const teamA = [match.playerA1Id, match.playerA2Id];
    const teamB = [match.playerB1Id, match.playerB2Id];
    const all = [...teamA, ...teamB];

    all.forEach((id) => {
      ensure(id).matchesPlayed += 1;
    });

    // PF / PC en todos los partidos
    teamA.forEach((id) => {
      const row = ensure(id);
      row.pointsFor += match.scoreA;
      row.pointsAgainst += match.scoreB;
    });
    teamB.forEach((id) => {
      const row = ensure(id);
      row.pointsFor += match.scoreB;
      row.pointsAgainst += match.scoreA;
    });

    // Puntos de ranking (2 victoria / 1 empate)
    if (match.scoreA === match.scoreB) {
      all.forEach((id) => {
        const row = ensure(id);
        row.points += 1;
        row.draws += 1;
      });
    } else if (match.scoreA > match.scoreB) {
      teamA.forEach((id) => {
        const row = ensure(id);
        row.points += 2;
        row.wins += 1;
      });
      teamB.forEach((id) => {
        ensure(id).losses += 1;
      });
    } else {
      teamB.forEach((id) => {
        const row = ensure(id);
        row.points += 2;
        row.wins += 1;
      });
      teamA.forEach((id) => {
        ensure(id).losses += 1;
      });
    }
  }

  const playerName = (id: number) =>
    players.find((p) => p.id === id)?.displayName ?? `Jugador #${id}`;

  const rows: StandingRow[] = Array.from(stats.entries()).map(
    ([playerId, data]) => ({
      playerId,
      playerName: playerName(playerId),
      position: 0,
      points: data.points,
      wins: data.wins,
      draws: data.draws,
      losses: data.losses,
      matchesPlayed: data.matchesPlayed,
      pointsFor: data.pointsFor,
      pointsAgainst: data.pointsAgainst,
      difference: data.pointsFor - data.pointsAgainst,
    }),
  );

  // Orden: puntos → diferencia → victorias → nombre
  rows.sort((a, b) => {
    if (b.points !== a.points) return b.points - a.points;
    if (b.difference !== a.difference) return b.difference - a.difference;
    if (b.wins !== a.wins) return b.wins - a.wins;
    if (b.draws !== a.draws) return b.draws - a.draws;
    return a.playerName.localeCompare(b.playerName, "es");
  });

  // Posición densa: mismos puntos → misma posición
  let currentPosition = 0;
  let lastPoints: number | null = null;

  return rows.map((row) => {
    if (row.points !== lastPoints) {
      currentPosition += 1;
      lastPoints = row.points;
    }
    return { ...row, position: currentPosition };
  });
}
