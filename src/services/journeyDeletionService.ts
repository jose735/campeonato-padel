import { deleteJourney } from "@/services/journeyService";
import {
  getMatchesByJourneyId,
  deleteJourneyMatch,
} from "@/services/journeyMatchService";
import {
  getParticipantsByJourneyId,
  deleteJourneyParticipant,
} from "@/services/journeyParticipantService";

export async function deleteCompleteJourney(
  journeyId: number,
): Promise<void> {
  // 1. Obtener los partidos de la jornada
  const matches = await getMatchesByJourneyId(journeyId);

  // 2. Eliminar primero los partidos
  await Promise.all(
    matches.map((match) => deleteJourneyMatch(match.id)),
  );

  // 3. Obtener los participantes de la jornada
  const participants = await getParticipantsByJourneyId(journeyId);

  // 4. Eliminar los participantes
  await Promise.all(
    participants.map((participant) =>
      deleteJourneyParticipant(participant.id),
    ),
  );

  // 5. Finalmente eliminar la jornada
  await deleteJourney(journeyId);
}