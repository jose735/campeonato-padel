import { create } from "zustand";
import type { CreateJourneyInput, Journey } from "@/types";
import {
  createJourney,
  deleteJourney,
  finishJourney,
  getJourneys,
  getJourneysByTournamentId,
  updateJourney,
} from "@/services/journeyService";

type JourneyStore = {
  journeys: Journey[];
  isLoading: boolean;
  fetchJourneys: () => Promise<void>;
  fetchJourneysByTournamentId: (tournamentId: number) => Promise<void>;
  createJourney: (journey: CreateJourneyInput) => Promise<void>;
  updateJourney: (id: number, journey: CreateJourneyInput) => Promise<void>;
  deleteJourney: (journeyId: number) => Promise<void>;
  addJourney: (journey: Journey) => void;
  editJourney: (journey: Journey) => void;
  removeJourney: (journeyId: number) => void;
  finishJourney: (journeyId: number) => Promise<void>;
};

export const useJourneyStore = create<JourneyStore>((set) => ({
  journeys: [],
  isLoading: false,

  fetchJourneys: async () => {
    set({ isLoading: true });
    try {
      const journeys = await getJourneys();
      set({ journeys });
    } catch (error) {
      console.error(error);
    } finally {
      set({ isLoading: false });
    }
  },

  fetchJourneysByTournamentId: async (tournamentId) => {
    set({ isLoading: true });
    try {
      const journeys = await getJourneysByTournamentId(tournamentId);
      set({ journeys });
    } catch (error) {
      console.error(error);
    } finally {
      set({ isLoading: false });
    }
  },

  createJourney: async (journeyData) => {
    try {
      const newJourney = await createJourney(journeyData);
      useJourneyStore.getState().addJourney(newJourney);
    } catch (error) {
      console.error(error);
    }
  },

  updateJourney: async (id, journeyData) => {
    try {
      const updated = await updateJourney(id, journeyData);
      useJourneyStore.getState().editJourney(updated);
    } catch (error) {
      console.error(error);
    }
  },

  deleteJourney: async (journeyId) => {
    try {
      await deleteJourney(journeyId);
      useJourneyStore.getState().removeJourney(journeyId);
    } catch (error) {
      console.error(error);
    }
  },

  addJourney: (journey) => {
    set((state) => {
      const exists = state.journeys.some(
        (current) => current.id === journey.id,
      );
      if (exists) return state;
      return { journeys: [...state.journeys, journey] };
    });
  },

  editJourney: (journey) => {
    set((state) => ({
      journeys: state.journeys.map((current) =>
        current.id === journey.id ? journey : current,
      ),
    }));
  },

  removeJourney: (journeyId) => {
    set((state) => ({
      journeys: state.journeys.filter((journey) => journey.id !== journeyId),
    }));
  },

  finishJourney: async (journeyId) => {
    try {
      const updated = await finishJourney(journeyId);
      useJourneyStore.getState().editJourney(updated);
    } catch (error) {
      console.error(error);
      throw error;
    }
  },
}));
