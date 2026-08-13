import {
  generateJourneyMatches,
} from "@/lib/roundRobinGenerator";
import { createJourneyLineup } from "@/services/journeyLineupService";
import { useJourneyParticipantStore } from "@/store/journey-participant-store";
import { useJourneyMatchStore } from "@/store/journey-match-store";

export type SeededPlayer = {
  playerId: number;
  seed: number;
};

export async function setupJourneyLineup(
  journeyId: number,
  seededPlayers: SeededPlayer[],
  fieldsQuantity: number,
): Promise<void> {
  const expectedPlayers = fieldsQuantity * 4;

  if (fieldsQuantity !== 2 && fieldsQuantity !== 3) {
    throw new Error(
      "La jornada solamente puede utilizar 2 o 3 canchas",
    );
  }

  if (seededPlayers.length !== expectedPlayers) {
    throw new Error(
      `Para ${fieldsQuantity} canchas se requieren exactamente ${expectedPlayers} jugadores`,
    );
  }

  const orderedPlayerIds = [...seededPlayers]
    .sort((a, b) => a.seed - b.seed)
    .map((sp) => sp.playerId);

  const generatedMatches = generateJourneyMatches(
    orderedPlayerIds,
    fieldsQuantity,
  );

  await createJourneyLineup(
    journeyId,
    seededPlayers,
    generatedMatches,
  );

  await Promise.all([
    useJourneyParticipantStore
      .getState()
      .fetchParticipantsByJourneyId(journeyId),

    useJourneyMatchStore
      .getState()
      .fetchMatchesByJourneyId(journeyId),
  ]);
}