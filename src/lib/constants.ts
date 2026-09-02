/** Torneo especial que agrupa las jornadas "eliminadas" (soft-delete). */
export const DELETED_TOURNAMENT_ID = 1;

export function isDeletedTournamentId(tournamentId: number): boolean {
  return tournamentId === DELETED_TOURNAMENT_ID;
}
