import { supabase } from '@/lib/supabase';
import { DELETED_TOURNAMENT_ID } from '@/lib/constants';
import {
  getJourneyById,
  getJourneysByDate,
  reassignJourneyTournament,
  updateJourneyMatchSort,
  deleteJourney,
} from '@/services/journeyService';

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

/**
 * Soft-delete de una jornada: la mueve al torneo especial "Jornadas eliminadas".
 * No elimina partidos ni participantes.
 * Reordena el journey_match_sort de las jornadas activas de la misma fecha.
 */
export async function softDeleteCompleteJourney(
  journeyId: number,
): Promise<void> {
  const journey = await getJourneyById(journeyId);
  if (!journey) return;

  // Ya está en el torneo de eliminadas
  if (journey.tournamentId === DELETED_TOURNAMENT_ID) return;

  await reassignJourneyTournament(journeyId, DELETED_TOURNAMENT_ID);

  if (journey.journeyDate) {
    await resequenceJourneysForDate(journey.journeyDate);
  }
}

/**
 * Hard-delete: borra partidos, participantes y la jornada.
 * Usar solo desde el modal de jornadas eliminadas, con confirmación.
 */
export async function hardDeleteCompleteJourney(
  journeyId: number,
): Promise<void> {
  const journey = await getJourneyById(journeyId);
  if (!journey) return;

  const { error: matchesError } = await supabase
    .from('journeys_matches')
    .delete()
    .eq('journey_id', journeyId);
  if (matchesError) throw matchesError;

  const { error: participantsError } = await supabase
    .from('journeys_participants')
    .delete()
    .eq('journey_id', journeyId);
  if (participantsError) throw participantsError;

  await deleteJourney(journeyId);

  // Si no estaba en eliminadas, reordenar la fecha de origen
  if (journey.tournamentId !== DELETED_TOURNAMENT_ID && journey.journeyDate) {
    await resequenceJourneysForDate(journey.journeyDate);
  }
}
