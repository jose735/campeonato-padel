import { create } from "zustand";
import type { CreateJourneyMatchInput, JourneyMatch } from "@/types";
import {
  createJourneyMatch,
  createJourneyMatchesBulk,
  deleteJourneyMatch,
  getJourneyIdsWithMatches,
  getMatchesByJourneyId,
  updateJourneyMatch,
} from "@/services/journeyMatchService";

type JourneyMatchStore = {
  matches: JourneyMatch[];
  isLoading: boolean;
  journeyIdsWithMatches: number[];
  currentJourneyId: number | null;
  fetchMatchesByJourneyId: (journeyId: number) => Promise<void>;
  createMatch: (match: CreateJourneyMatchInput) => Promise<void>;
  updateMatch: (id: number, match: CreateJourneyMatchInput) => Promise<void>;
  deleteMatch: (matchId: number) => Promise<void>;
  addMatch: (match: JourneyMatch) => void;
  editMatch: (match: JourneyMatch) => void;
  removeMatch: (matchId: number) => void;
  createMatchesBulk: (
    matches: CreateJourneyMatchInput[],
  ) => Promise<JourneyMatch[]>;
  fetchJourneyIdsWithMatches: () => Promise<void>;
};

export const useJourneyMatchStore = create<JourneyMatchStore>((set) => ({
  matches: [],
  isLoading: false,
  journeyIdsWithMatches: [],
  currentJourneyId: null,

  fetchMatchesByJourneyId: async (journeyId) => {
    set({ isLoading: true, currentJourneyId: journeyId });
    try {
      const matches = await getMatchesByJourneyId(journeyId);
      set({ matches });
    } catch (error) {
      console.error(error);
    } finally {
      set({ isLoading: false });
    }
  },

  createMatch: async (matchData) => {
    try {
      const newMatch = await createJourneyMatch(matchData);
      useJourneyMatchStore.getState().addMatch(newMatch);
    } catch (error) {
      console.error(error);
    }
  },

  updateMatch: async (id, matchData) => {
    try {
      const updated = await updateJourneyMatch(id, matchData);
      useJourneyMatchStore.getState().editMatch(updated);
    } catch (error) {
      console.error(error);
    }
  },

  deleteMatch: async (matchId) => {
    try {
      await deleteJourneyMatch(matchId);
      useJourneyMatchStore.getState().removeMatch(matchId);
    } catch (error) {
      console.error(error);
    }
  },

  addMatch: (match) => {
    set((state) => {
      const exists = state.matches.some((current) => current.id === match.id);
      if (exists) return state;
      return { matches: [...state.matches, match] };
    });
  },

  editMatch: (match) => {
    set((state) => ({
      matches: state.matches.map((current) =>
        current.id === match.id ? match : current,
      ),
    }));
  },

  removeMatch: (matchId) => {
    set((state) => ({
      matches: state.matches.filter((match) => match.id !== matchId),
    }));
  },

  createMatchesBulk: async (matchesData) => {
    try {
      const newMatches = await createJourneyMatchesBulk(matchesData);
      set((state) => ({ matches: [...state.matches, ...newMatches] }));
      return newMatches;
    } catch (error) {
      console.error(error);
      throw error;
    }
  },

  fetchJourneyIdsWithMatches: async () => {
    try {
      const journeyIdsWithMatches = await getJourneyIdsWithMatches();
      set({ journeyIdsWithMatches });
    } catch (error) {
      console.error(error);
    }
  },
}));