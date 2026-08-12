import { create } from 'zustand';
import type { CreateJourneyParticipantInput, JourneyParticipant } from '@/types';
import {
  createJourneyParticipant,
  createJourneyParticipantsBulk,
  deleteJourneyParticipant,
  getParticipantsByJourneyId,
} from '@/services/journeyParticipantService';

type JourneyParticipantStore = {
  participants: JourneyParticipant[];
  isLoading: boolean;
  fetchParticipantsByJourneyId: (journeyId: number) => Promise<void>;
  createParticipant: (participant: CreateJourneyParticipantInput) => Promise<void>;
  deleteParticipant: (participantId: number) => Promise<void>;
  addParticipant: (participant: JourneyParticipant) => void;
  removeParticipant: (participantId: number) => void;
  createParticipantsBulk: (participants: CreateJourneyParticipantInput[]) => Promise<JourneyParticipant[]>;
};

export const useJourneyParticipantStore = create<JourneyParticipantStore>((set) => ({
  participants: [],
  isLoading: false,

  fetchParticipantsByJourneyId: async (journeyId) => {
    set({ isLoading: true });
    try {
      const participants = await getParticipantsByJourneyId(journeyId);
      set({ participants });
    } catch (error) {
      console.error(error);
    } finally {
      set({ isLoading: false });
    }
  },

  createParticipant: async (participantData) => {
    try {
      const newParticipant = await createJourneyParticipant(participantData);
      useJourneyParticipantStore.getState().addParticipant(newParticipant);
    } catch (error) {
      console.error(error);
    }
  },

  deleteParticipant: async (participantId) => {
    try {
      await deleteJourneyParticipant(participantId);
      useJourneyParticipantStore.getState().removeParticipant(participantId);
    } catch (error) {
      console.error(error);
    }
  },

  addParticipant: (participant) => {
    set((state) => {
      const exists = state.participants.some((current) => current.id === participant.id);
      if (exists) return state;
      return { participants: [...state.participants, participant] };
    });
  },

  removeParticipant: (participantId) => {
    set((state) => ({
      participants: state.participants.filter(
        (participant) => participant.id !== participantId
      ),
    }));
  },

  createParticipantsBulk: async (participantsData) => {
  try {
    const newParticipants = await createJourneyParticipantsBulk(participantsData);
    set((state) => ({ participants: [...state.participants, ...newParticipants] }));
    return newParticipants;
  } catch (error) {
    console.error(error);
    throw error;
  }
},
}));