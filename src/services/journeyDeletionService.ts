import {
  deleteJourney,
  getJourneyById,
  getJourneysByDate,
  updateJourneyMatchSort,
} from "@/services/journeyService";
import {
  getMatchesByJourneyId,
  deleteJourneyMatch,
} from "@/services/journeyMatchService";
import {
  getParticipantsByJourneyId,
  deleteJourneyParticipant,
} from "@/services/journeyParticipantService";

async function resequenceJourneysForDate(journeyDate: string): Promise<void> {
  const remaining = await getJourneysByDate(journeyDate);

  if (remaining.length === 0) return;

  if (remaining.length === 1) {
    const only = remaining[0];
    if (only.journeyMatchSort !== null) {
      await updateJourneyMatchSort(only.id, null);
    }
    return;
  }

  await Promise.all(
    remaining.map((journey, index) => {
      const expectedSort = index + 1;
      if (journey.journeyMatchSort === expectedSort) return Promise.resolve();
      return updateJourneyMatchSort(journey.id, expectedSort);
    }),
  );
}

export async function deleteCompleteJourney(
  journeyId: number,
): Promise<void> {
  // 0. Capturar la fecha ANTES de borrar, la vamos a necesitar para reordenar
  const journeyToDelete = await getJourneyById(journeyId);

  // 1. Obtener los partidos de la jornada
  const matches = await getMatchesByJourneyId(journeyId);

  // 2. Eliminar primero los partidos
  await Promise.all(matches.map((match) => deleteJourneyMatch(match.id)));

  // 3. Obtener los participantes de la jornada
  const participants = await getParticipantsByJourneyId(journeyId);

  // 4. Eliminar los participantes
  await Promise.all(
    participants.map((participant) =>
      deleteJourneyParticipant(participant.id),
    ),
  );

  // 5. Eliminar la jornada
  await deleteJourney(journeyId);

  // 6. Reordenar las jornadas restantes de esa misma fecha
  if (journeyToDelete) {
    await resequenceJourneysForDate(journeyToDelete.journeyDate);
  }
}