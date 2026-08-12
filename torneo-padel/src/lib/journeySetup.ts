import { generateJourneyMatches } from '@/lib/roundRobinGenerator';
import { createJourneyLineup } from '@/services/journeyLineupService';
import { useJourneyParticipantStore } from '@/store/journey-participant-store';
import { useJourneyMatchStore } from '@/store/journey-match-store';

export type SeededPlayer = {
  playerId: number;
  seed: number;
};

export async function setupJourneyLineup(
  journeyId: number,
  seededPlayers: SeededPlayer[]
): Promise<void> {
  if (seededPlayers.length < 4 || seededPlayers.length % 4 !== 0) {
    throw new Error('La cantidad de jugadores debe ser múltiplo de 4');
  }

  const orderedPlayerIds = [...seededPlayers]
    .sort((a, b) => a.seed - b.seed)
    .map((sp) => sp.playerId);

  const generatedMatches = generateJourneyMatches(orderedPlayerIds);

  // Inserta participantes + partidos en una sola transacción (todo o nada)
  await createJourneyLineup(journeyId, seededPlayers, generatedMatches);

  // Sincroniza el estado local con lo que quedó guardado
  await Promise.all([
    useJourneyParticipantStore.getState().fetchParticipantsByJourneyId(journeyId),
    useJourneyMatchStore.getState().fetchMatchesByJourneyId(journeyId),
  ]);
}