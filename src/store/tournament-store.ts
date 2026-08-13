import { create } from 'zustand';
import type { CreateTournamentInput, Tournament } from '@/types';
import {
  createTournament,
  deleteTournament,
  getTournaments,
  updateTournament,
} from '@/services/tournamentService';

type TournamentStore = {
  tournaments: Tournament[];
  isLoading: boolean;
  fetchTournaments: () => Promise<void>;
  createTournament: (tournament: CreateTournamentInput) => Promise<void>;
  updateTournament: (id: number, tournament: CreateTournamentInput) => Promise<void>;
  deleteTournament: (tournamentId: number) => Promise<void>;
  addTournament: (tournament: Tournament) => void;
  editTournament: (tournament: Tournament) => void;
  removeTournament: (tournamentId: number) => void;
};

export const useTournamentStore = create<TournamentStore>((set) => ({
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
}));