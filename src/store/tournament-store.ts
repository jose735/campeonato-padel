import { create } from 'zustand';
import type { CreateTournamentInput, Tournament } from '@/types';
import {
  createTournament,
  deleteTournament,
  getTournaments,
  setCurrentTournament,
  updateTournament,
} from '@/services/tournamentService';
import { DELETED_TOURNAMENT_ID } from '@/lib/constants';

type TournamentStore = {
  tournaments: Tournament[];
  isLoading: boolean;
  fetchTournaments: () => Promise<void>;
  createTournament: (tournament: CreateTournamentInput) => Promise<void>;
  updateTournament: (id: number, tournament: CreateTournamentInput) => Promise<void>;
  deleteTournament: (tournamentId: number) => Promise<void>;
  setAsCurrentTournament: (tournamentId: number) => Promise<void>;
  addTournament: (tournament: Tournament) => void;
  editTournament: (tournament: Tournament) => void;
  removeTournament: (tournamentId: number) => void;
  /** Torneos sin el especial de eliminadas (selectores / ranking). */
  activeTournaments: () => Tournament[];
};

export const useTournamentStore = create<TournamentStore>((set, get) => ({
  tournaments: [],
  isLoading: false,

  fetchTournaments: async () => {
    set({ isLoading: true });
    try {
      const tournaments = await getTournaments();
      set({ tournaments });
    } catch (error) {
      console.error(error);
    } finally {
      set({ isLoading: false });
    }
  },

  createTournament: async (tournamentData) => {
    try {
      const newTournament = await createTournament(tournamentData);
      useTournamentStore.getState().addTournament(newTournament);
    } catch (error) {
      console.error(error);
    }
  },

  updateTournament: async (id, tournamentData) => {
    try {
      const updated = await updateTournament(id, tournamentData);
      useTournamentStore.getState().editTournament(updated);
    } catch (error) {
      console.error(error);
    }
  },

  deleteTournament: async (tournamentId) => {
    try {
      await deleteTournament(tournamentId);
      useTournamentStore.getState().removeTournament(tournamentId);
    } catch (error) {
      console.error(error);
    }
  },

  setAsCurrentTournament: async (tournamentId) => {
    await setCurrentTournament(tournamentId);
    set((state) => ({
      tournaments: state.tournaments.map((t) => ({
        ...t,
        isCurrent: t.id === tournamentId,
      })),
    }));
  },

  addTournament: (tournament) => {
    set((state) => {
      const exists = state.tournaments.some((current) => current.id === tournament.id);
      if (exists) return state;
      return { tournaments: [tournament, ...state.tournaments] };
    });
  },

  editTournament: (tournament) => {
    set((state) => ({
      tournaments: state.tournaments.map((current) =>
        current.id === tournament.id ? tournament : current
      ),
    }));
  },

  removeTournament: (tournamentId) => {
    set((state) => ({
      tournaments: state.tournaments.filter((tournament) => tournament.id !== tournamentId),
    }));
  },

  activeTournaments: () =>
    get().tournaments.filter((t) => t.id !== DELETED_TOURNAMENT_ID),
}));
