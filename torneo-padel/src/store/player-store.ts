import { create } from 'zustand';
import type { CreatePlayerInput, Player } from '@/types';
import { createPlayer, deletePlayer, getPlayers, updatePlayer } from '@/services/playerService';

type PlayerStore = {
  players: Player[];
  isLoading: boolean;
  fetchPlayers: () => Promise<void>;
  createPlayer: (player: CreatePlayerInput) => Promise<void>;
  updatePlayer: (id: string, player: CreatePlayerInput) => Promise<void>;
  deletePlayer: (playerId: string) => Promise<void>;
  addPlayer: (player: Player) => void;
  editPlayer: (player: Player) => void;
  removePlayer: (playerId: string) => void;
};

export const usePlayerStore = create<PlayerStore>((set) => ({
  players: [],
  isLoading: false,

  fetchPlayers: async () => {
    set({ isLoading: true });

    try {
      const players = await getPlayers();

      set({
        players,
      });
    } catch (error) {
      console.error(error);
    } finally {
      set({
        isLoading: false,
      });
    }
  },

  createPlayer: async (playerData) => {
    try {
      const newPlayer = await createPlayer(playerData);

      usePlayerStore.getState().addPlayer(newPlayer);
    } catch (error) {
      console.error(error);
    }
  },

  updatePlayer: async (id, playerData) => {
    try {
      const updated = await updatePlayer(id, playerData);

      usePlayerStore.getState().editPlayer(updated);
    } catch (error) {
      console.error(error);
    }
  },

  deletePlayer: async (playerId) => {
    try {
      await deletePlayer(playerId);

      usePlayerStore.getState().removePlayer(playerId);
    } catch (error) {
      console.error(error);
    }
  },

  addPlayer: (player) => {
    set((state) => {
      const exists = state.players.some((current) => current.id === player.id);

      if (exists) {
        return state;
      }

      return {
        players: [player, ...state.players],
      };
    });
  },

  editPlayer: (player) => {
    set((state) => ({
      players: state.players.map((current) =>
        current.id === player.id ? player : current
      ),
    }));
  },

  removePlayer: (playerId) => {
    set((state) => ({
      players: state.players.filter((player) => player.id !== playerId),
    }));
  },
}));