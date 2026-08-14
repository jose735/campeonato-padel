import type { UserRole } from '@/store/auth-store';

export const can = {
  // Jugadores
  managePlayers: (role: UserRole | null) => role === 'admin',

  // Torneos
  manageTournaments: (role: UserRole | null) => role === 'admin',

  // Jornadas
  createJourney: (role: UserRole | null) =>
    role === 'coordinador' || role === 'admin',

  manageJourneyPlayers: (role: UserRole | null) =>
    role === 'coordinador' || role === 'admin',

  editRound: (role: UserRole | null) =>
    role === 'coordinador' || role === 'admin',

  finishJourney: (role: UserRole | null) =>
    role === 'coordinador' || role === 'admin',

  deleteJourney: (role: UserRole | null) => role === 'admin',

  reopenJourney: (role: UserRole | null) => role === 'admin',
} as const;