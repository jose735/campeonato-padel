import {
  generateJourneyMatches,
  type GeneratedMatch,
} from "@/lib/roundRobinGenerator";
import { createJourneyLineup } from "@/services/journeyLineupService";
import { useJourneyParticipantStore } from "@/store/journey-participant-store";
import { useJourneyMatchStore } from "@/store/journey-match-store";

export type SeededPlayer = {
  playerId: number;
  seed: number;
};

function assignCourtsToMatches(
  matches: GeneratedMatch[],
  fieldsQuantity: number,
): (GeneratedMatch & { fieldNumber: number })[] {
  const byRound = new Map<number, GeneratedMatch[]>();

  for (const match of matches) {
    const list = byRound.get(match.round) ?? [];
    list.push(match);
    byRound.set(match.round, list);
  }

  const result: (GeneratedMatch & { fieldNumber: number })[] = [];

  for (const [, roundMatches] of byRound) {
    const courts = Array.from({ length: fieldsQuantity }, (_, i) => i + 1);

    // shuffle
    for (let i = courts.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [courts[i], courts[j]] = [courts[j], courts[i]];
    }

    roundMatches.forEach((match, index) => {
      result.push({
        ...match,
        fieldNumber: courts[index % courts.length],
      });
    });
  }

  return result;
}

export async function setupJourneyLineup(
  journeyId: number,
  seededPlayers: SeededPlayer[],
  fieldsQuantity: number
): Promise<void> {
  if (seededPlayers.length < 4 || seededPlayers.length % 4 !== 0) {
    throw new Error('La cantidad de jugadores debe ser múltiplo de 4');
  }

  const orderedPlayerIds = [...seededPlayers]
    .sort((a, b) => a.seed - b.seed)
    .map((sp) => sp.playerId);

  const generatedMatches = generateJourneyMatches(orderedPlayerIds);
  const matchesWithCourts = assignCourtsToMatches(generatedMatches, fieldsQuantity);

  await createJourneyLineup(journeyId, seededPlayers, matchesWithCourts);

  await Promise.all([
    useJourneyParticipantStore.getState().fetchParticipantsByJourneyId(journeyId),
    useJourneyMatchStore.getState().fetchMatchesByJourneyId(journeyId),
  ]);
}
