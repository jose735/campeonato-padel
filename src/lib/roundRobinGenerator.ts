export type GeneratedMatch = {
  round: number;
  playerA1Id: number;
  playerA2Id: number;
  playerB1Id: number;
  playerB2Id: number;
  fieldNumber: number;
};

type MatchTemplate = [number, number, number, number];

/**
 * Patrón para 8 jugadores / 2 canchas.
 *
 * Cada número representa el seed del jugador,
 * no su ID real de Supabase.
 */
const PATTERN_8_PLAYERS: MatchTemplate[][] = [
  // Ronda 1
  [
    [1, 2, 3, 4],
    [5, 6, 7, 8],
  ],

  // Ronda 2
  [
    [1, 3, 5, 7],
    [2, 4, 6, 8],
  ],

  // Ronda 3
  [
    [1, 4, 5, 8],
    [2, 3, 6, 7],
  ],

  // Ronda 4
  [
    [1, 5, 2, 6],
    [3, 7, 4, 8],
  ],

  // Ronda 5
  [
    [1, 6, 3, 8],
    [2, 5, 4, 7],
  ],

  // Ronda 6
  [
    [1, 7, 4, 6],
    [2, 8, 3, 5],
  ],

  // Ronda 7
  [
    [3, 6, 4, 5],
    [1, 8, 2, 7],
  ],
];

/**
 * Patrón para 12 jugadores / 3 canchas.
 *
 * Cada número representa el seed del jugador,
 * no su ID real de Supabase.
 */
const PATTERN_12_PLAYERS: MatchTemplate[][] = [
  // Ronda 1
  [
    [5, 7, 9, 10],
    [12, 1, 2, 8],
    [3, 6, 4, 11],
  ],

  // Ronda 2
  [
    [12, 4, 5, 11],
    [6, 9, 7, 3],
    [8, 10, 1, 2],
  ],

  // Ronda 3
  [
    [9, 1, 10, 6],
    [11, 2, 4, 5],
    [12, 7, 8, 3],
  ],

  // Ronda 4
  [
    [3, 5, 7, 8],
    [12, 10, 11, 6],
    [1, 4, 2, 9],
  ],

  // Ronda 5
  [
    [12, 2, 3, 9],
    [4, 7, 5, 1],
    [6, 8, 10, 11],
  ],

  // Ronda 6
  [
    [7, 10, 8, 4],
    [9, 11, 2, 3],
    [12, 5, 6, 1],
  ],

  // Ronda 7
  [
    [1, 3, 5, 6],
    [12, 8, 9, 4],
    [10, 2, 11, 7],
  ],

  // Ronda 8
  [
    [12, 11, 1, 7],
    [2, 5, 3, 10],
    [4, 6, 8, 9],
  ],

  // Ronda 9
  [
    [5, 8, 6, 2],
    [7, 9, 11, 1],
    [12, 3, 4, 10],
  ],

  // Ronda 10
  [
    [10, 1, 3, 4],
    [12, 6, 7, 2],
    [8, 11, 9, 5],
  ],

  // Ronda 11
  [
    [12, 9, 10, 5],
    [11, 3, 1, 8],
    [2, 4, 6, 7],
  ],
];

/**
 * Genera los partidos de una jornada utilizando
 * el patrón correspondiente a la cantidad de jugadores.
 *
 * Los playerIds deben estar ordenados por seed:
 *
 * index 0 → seed 1
 * index 1 → seed 2
 * index 2 → seed 3
 * ...
 */
export function generateJourneyMatches(
  playerIds: number[],
  fieldsQuantity: number,
): GeneratedMatch[] {
  const playersQuantity = playerIds.length;

  if (fieldsQuantity !== 2 && fieldsQuantity !== 3) {
    throw new Error(
      "La jornada solamente puede utilizar 2 o 3 canchas",
    );
  }

  const expectedPlayers = fieldsQuantity * 4;

  if (playersQuantity !== expectedPlayers) {
    throw new Error(
      `Para ${fieldsQuantity} canchas se requieren exactamente ${expectedPlayers} jugadores`,
    );
  }

  const pattern =
    playersQuantity === 8
      ? PATTERN_8_PLAYERS
      : PATTERN_12_PLAYERS;

  const matches: GeneratedMatch[] = [];

  pattern.forEach((roundMatches, roundIndex) => {
    roundMatches.forEach(
      ([playerA1Seed, playerA2Seed, playerB1Seed, playerB2Seed], matchIndex) => {
        const playerA1Id = playerIds[playerA1Seed - 1];
        const playerA2Id = playerIds[playerA2Seed - 1];
        const playerB1Id = playerIds[playerB1Seed - 1];
        const playerB2Id = playerIds[playerB2Seed - 1];

        if (
          playerA1Id === undefined ||
          playerA2Id === undefined ||
          playerB1Id === undefined ||
          playerB2Id === undefined
        ) {
          throw new Error(
            `No se pudo encontrar un jugador para la ronda ${roundIndex + 1}`,
          );
        }

        matches.push({
          round: roundIndex + 1,
          playerA1Id,
          playerA2Id,
          playerB1Id,
          playerB2Id,
          fieldNumber: matchIndex + 1,
        });
      },
    );
  });

  return matches;
}