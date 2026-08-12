export type GeneratedMatch = {
  round: number;
  playerA1Id: number;
  playerA2Id: number;
  playerB1Id: number;
  playerB2Id: number;
};

/**
 * Genera las parejas (partnerships) de cada ronda usando el método del círculo.
 * Garantiza que cada jugador sea pareja de cada otro jugador exactamente una vez.
 */
function generatePartnershipRounds(playerIds: number[]): number[][][] {
  const n = playerIds.length;

  if (n < 4 || n % 4 !== 0) {
    throw new Error('La cantidad de jugadores debe ser múltiplo de 4');
  }

  const fixed = playerIds[0];
  let rotating = playerIds.slice(1);
  const rounds: number[][][] = [];

  for (let round = 0; round < n - 1; round++) {
    const arranged = [fixed, ...rotating];
    const partnerships: number[][] = [];

    for (let i = 0; i < n / 2; i++) {
      partnerships.push([arranged[i], arranged[n - 1 - i]]);
    }

    rounds.push(partnerships);

    // Rota todos los jugadores excepto el fijo
    rotating = [rotating[rotating.length - 1], ...rotating.slice(0, rotating.length - 1)];
  }

  return rounds;
}

/**
 * Agrupa las parejas de una ronda en partidos (2 parejas vs 2 parejas).
 */
function buildMatchesFromPartnerships(partnerships: number[][]): number[][] {
  const matches: number[][] = [];

  for (let i = 0; i < partnerships.length; i += 2) {
    const teamA = partnerships[i];
    const teamB = partnerships[i + 1];
    matches.push([...teamA, ...teamB]);
  }

  return matches;
}

/**
 * Genera todos los partidos de una jornada a partir de la lista de jugadores
 * (ordenados por seed).
 */
export function generateJourneyMatches(playerIds: number[]): GeneratedMatch[] {
  const partnershipRounds = generatePartnershipRounds(playerIds);
  const matches: GeneratedMatch[] = [];

  partnershipRounds.forEach((partnerships, index) => {
    const roundMatches = buildMatchesFromPartnerships(partnerships);

    roundMatches.forEach(([playerA1Id, playerA2Id, playerB1Id, playerB2Id]) => {
      matches.push({
        round: index + 1,
        playerA1Id,
        playerA2Id,
        playerB1Id,
        playerB2Id,
      });
    });
  });

  return matches;
}