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
  journeysPlayed: number;
  pointsFor: number; // Puntos a favor
  pointsAgainst: number; // Puntos en contra
  difference: number; // PF - PC
  /** Factor de asistencia (solo tabla ponderada). 1 | 0.8 | 0.6 */
  fac?: number;
  /** PTS/P × FAC (solo tabla ponderada). */
  pointsFinal?: number;
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
      journeys: Set<number>;
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
        journeys: new Set<number>(),
        pointsFor: 0,
        pointsAgainst: 0,
      });
    }

    return stats.get(playerId)!;
  };

  for (const match of matches) {
    const hasScore =
      match.scoreA > 0 ||
      match.scoreB > 0 ||
      match.pointsObtained > 0;

    if (!hasScore) continue;

    const teamA = [match.playerA1Id, match.playerA2Id];
    const teamB = [match.playerB1Id, match.playerB2Id];
    const all = [...teamA, ...teamB];

    all.forEach((id) => {
      const row = ensure(id);
      row.matchesPlayed += 1;
      row.journeys.add(match.journeyId);
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

    // Puntos de ranking:
    // Victoria = 2 puntos
    // Empate = 1 punto
    // Derrota = 0 puntos
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
    players.find((p) => p.id === id)?.displayName ??
    `Jugador #${id}`;

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
      journeysPlayed: data.journeys.size,
      pointsFor: data.pointsFor,
      pointsAgainst: data.pointsAgainst,
      difference: data.pointsFor - data.pointsAgainst,
    }),
  );

  /**
   * Orden de la tabla:
   *
   * 1. Puntos
   * 2. Diferencia
   * 3. Victorias
   * 4. Empates
   * 5. Nombre
   *
   * El nombre únicamente sirve para establecer un orden
   * determinista cuando todos los criterios deportivos
   * son exactamente iguales.
   */
  rows.sort((a, b) => {
    if (b.points !== a.points) {
      return b.points - a.points;
    }

    if (b.difference !== a.difference) {
      return b.difference - a.difference;
    }

    if (b.wins !== a.wins) {
      return b.wins - a.wins;
    }

    if (b.draws !== a.draws) {
      return b.draws - a.draws;
    }

    return a.playerName.localeCompare(b.playerName, "es");
  });

  /**
   * Calculamos las posiciones después de ordenar.
   *
   * Dos jugadores comparten posición únicamente cuando
   * tienen exactamente los mismos criterios de desempate:
   *
   * points + difference + wins + draws
   *
   * Si alguno de esos valores cambia, el jugador ocupa
   * su posición real dentro del ranking.
   *
   * Ejemplo:
   *
   * A → 5 / +5 / 2 / 1 → posición 1
   * B → 5 / +5 / 2 / 1 → posición 1
   * C → 4 / -1 / 1 / 1 → posición 3
   * D → 3 / -4 / 0 / 1 → posición 4
   *
   * Resultado:
   * 1
   * 1
   * 3
   * 4
   */
  let position = 1;

  return rows.map((row, index) => {
    // El primer jugador siempre ocupa la posición 1.
    if (index === 0) {
      return {
        ...row,
        position: 1,
      };
    }

    const previous = rows[index - 1];

    const sameRankingCriteria =
      row.points === previous.points &&
      row.difference === previous.difference &&
      row.wins === previous.wins &&
      row.draws === previous.draws;

    // Si alguno de los criterios cambia,
    // usamos la posición real dentro del ranking.
    if (!sameRankingCriteria) {
      position = index + 1;
    }

    return {
      ...row,
      position,
    };
  });
}
/**
 * Calcula el factor de asistencia (FAC) según % de jornadas jugadas
 * respecto al total de jornadas del torneo (días únicos).
 * ≥40% → 1 | ≥20% y <40% → 0.8 | <20% → 0.6
 */
export function computeFac(
  journeysPlayed: number,
  totalUniqueJourneyDays: number,
): number {
  if (totalUniqueJourneyDays <= 0) return 1;
  const ratio = journeysPlayed / totalUniqueJourneyDays;
  if (ratio >= 0.4) return 1;
  if (ratio >= 0.2) return 0.75;
  return 0.5;
}

/**
 * Convierte standings generales a tabla ponderada:
 * pts y diferencia divididos por partidos jugados.
 * Si se indica totalUniqueJourneyDays, calcula FAC y PTS/F y ordena por PTS/F.
 * Solo incluye jugadores con al menos 1 partido.
 */
export function buildWeightedStandings(
  standings: StandingRow[],
  totalUniqueJourneyDays?: number,
): StandingRow[] {
  const hasFac =
    typeof totalUniqueJourneyDays === "number" && totalUniqueJourneyDays >= 0;

  const weighted = standings
    .filter((row) => row.matchesPlayed > 0)
    .map((row) => {
      const pointsPerMatch = row.points / row.matchesPlayed;
      const differencePerMatch = row.difference / row.matchesPlayed;
      const fac = hasFac
        ? computeFac(row.journeysPlayed, totalUniqueJourneyDays)
        : undefined;
      const pointsFinal =
        fac !== undefined ? pointsPerMatch * fac : undefined;

      return {
        ...row,
        points: pointsPerMatch,
        difference: differencePerMatch,
        fac,
        pointsFinal,
      };
    });

  weighted.sort((a, b) => {
    // Orden principal: PTS/F si existe; si no, PTS/P
    const aPrimary = a.pointsFinal ?? a.points;
    const bPrimary = b.pointsFinal ?? b.points;
    if (bPrimary !== aPrimary) return bPrimary - aPrimary;
    if (b.difference !== a.difference) return b.difference - a.difference;
    if (b.wins !== a.wins) return b.wins - a.wins;
    if (b.draws !== a.draws) return b.draws - a.draws;
    return a.playerName.localeCompare(b.playerName, "es");
  });

  let position = 1;

  return weighted.map((row, index) => {
    if (index === 0) {
      return { ...row, position: 1 };
    }

    const previous = weighted[index - 1];
    const samePrimary =
      (row.pointsFinal ?? row.points) ===
      (previous.pointsFinal ?? previous.points);
    const sameRankingCriteria =
      samePrimary &&
      row.difference === previous.difference &&
      row.wins === previous.wins &&
      row.draws === previous.draws;

    if (!sameRankingCriteria) {
      position = index + 1;
    }

    return { ...row, position };
  });
}
