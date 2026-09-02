import { supabase } from '@/lib/supabase';
import { DELETED_TOURNAMENT_ID } from '@/lib/constants';
import type { Journey, JourneyRecord, CreateJourneyInput } from '@/types';

const TABLE = 'journeys';

function mapJourneyRecordToJourney(record: JourneyRecord): Journey {
  return {
    id: record.id,
    tournamentId: record.tournament_id,
    journeyDate: record.journey_date,
    fieldsQuantity: record.fields_quantity,
    scoreLimit: record.score_limit,
    maxPlayers: record.max_players,
    status: record.status ?? 'open',
    createdAt: record.created_at,
    journeyMatchSort: record.journey_match_sort,
  };
}

/** Jornadas activas (abiertas o finalizadas). Excluye las del torneo especial de eliminadas. */
export async function getJourneys(): Promise<Journey[]> {
  const { data, error } = await supabase
    .from(TABLE)
    .select('*')
    .neq('tournament_id', DELETED_TOURNAMENT_ID)
    .order('journey_date', { ascending: true });

  if (error) throw error;
  return (data as JourneyRecord[]).map(mapJourneyRecordToJourney);
}

/** Solo jornadas del torneo especial "Jornadas eliminadas" (admin). */
export async function getDeletedJourneys(): Promise<Journey[]> {
  const { data, error } = await supabase
    .from(TABLE)
    .select('*')
    .eq('tournament_id', DELETED_TOURNAMENT_ID)
    .order('journey_date', { ascending: false });

  if (error) throw error;
  return (data as JourneyRecord[]).map(mapJourneyRecordToJourney);
}

export async function getJourneysByTournamentId(tournamentId: number): Promise<Journey[]> {
  // No devolver jornadas del torneo especial salvo que se pida explícitamente ese id
  if (tournamentId === DELETED_TOURNAMENT_ID) {
    return getDeletedJourneys();
  }

  const { data, error } = await supabase
    .from(TABLE)
    .select('*')
    .eq('tournament_id', tournamentId)
    .order('journey_date', { ascending: true });

  if (error) throw error;
  return (data as JourneyRecord[]).map(mapJourneyRecordToJourney);
}

export async function getJourneyById(id: number): Promise<Journey | null> {
  const { data, error } = await supabase
    .from(TABLE)
    .select('*')
    .eq('id', id)
    .maybeSingle();

  if (error) throw error;
  return data ? mapJourneyRecordToJourney(data as JourneyRecord) : null;
}

/**
 * Devuelve el id del torneo que se considera "actual":
 * el que tiene la jornada (no eliminada) con journey_date más reciente
 * (y, en caso de empate, el id de jornada más alto).
 * Retorna null si no hay jornadas.
 */
export async function getCurrentTournamentId(): Promise<number | null> {
  const { data, error } = await supabase
    .from(TABLE)
    .select('tournament_id')
    .neq('tournament_id', DELETED_TOURNAMENT_ID)
    .order('journey_date', { ascending: false })
    .order('id', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) throw error;
  return data?.tournament_id ?? null;
}

/** Jornadas activas de una fecha (para reordenar sort). Excluye eliminadas. */
export async function getJourneysByDate(journeyDate: string): Promise<Journey[]> {
  const { data, error } = await supabase
    .from(TABLE)
    .select('*')
    .eq('journey_date', journeyDate)
    .neq('tournament_id', DELETED_TOURNAMENT_ID)
    .order('journey_match_sort', { ascending: true, nullsFirst: false });

  if (error) throw error;
  return (data as JourneyRecord[]).map(mapJourneyRecordToJourney);
}

export async function createJourney(input: CreateJourneyInput): Promise<Journey> {
  const { data, error } = await supabase
    .from(TABLE)
    .insert({
      tournament_id: input.tournamentId,
      journey_date: input.journeyDate,
      fields_quantity: input.fieldsQuantity,
      score_limit: input.scoreLimit,
      max_players: input.maxPlayers,
      journey_match_sort: input.journeyMatchSort,
    })
    .select()
    .single();

  if (error) throw error;
  return mapJourneyRecordToJourney(data as JourneyRecord);
}

export async function updateJourney(id: number, input: CreateJourneyInput): Promise<Journey> {
  const { data, error } = await supabase
    .from(TABLE)
    .update({
      tournament_id: input.tournamentId,
      journey_date: input.journeyDate,
      fields_quantity: input.fieldsQuantity,
      score_limit: input.scoreLimit,
      max_players: input.maxPlayers,
      journey_match_sort: input.journeyMatchSort,
    })
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return mapJourneyRecordToJourney(data as JourneyRecord);
}

export async function updateJourneyMatchSort(
  id: number,
  journeyMatchSort: number | null,
): Promise<Journey> {
  const { data, error } = await supabase
    .from(TABLE)
    .update({ journey_match_sort: journeyMatchSort })
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return mapJourneyRecordToJourney(data as JourneyRecord);
}

export async function finishJourney(id: number): Promise<Journey> {
  const { data, error } = await supabase
    .from(TABLE)
    .update({ status: 'finished' })
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return mapJourneyRecordToJourney(data as JourneyRecord);
}

export async function reopenJourney(id: number): Promise<Journey> {
  const { data, error } = await supabase
    .from(TABLE)
    .update({ status: 'open' })
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return mapJourneyRecordToJourney(data as JourneyRecord);
}

/**
 * Soft-delete legado por status. Preferir mover al torneo especial
 * con softDeleteCompleteJourney / reassignJourneyTournament(id, DELETED_TOURNAMENT_ID).
 */
export async function softDeleteJourney(id: number): Promise<Journey> {
  const { data, error } = await supabase
    .from(TABLE)
    .update({ status: 'deleted' })
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return mapJourneyRecordToJourney(data as JourneyRecord);
}

/** Cambia el torneo de una jornada. Partidos y participantes siguen ligados por journey_id. */
export async function reassignJourneyTournament(
  id: number,
  tournamentId: number,
): Promise<Journey> {
  const { data, error } = await supabase
    .from(TABLE)
    .update({ tournament_id: tournamentId })
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return mapJourneyRecordToJourney(data as JourneyRecord);
}

/** Hard delete de la fila journeys. Preferir hardDeleteCompleteJourney para borrar dependencias. */
export async function deleteJourney(id: number): Promise<void> {
  const { error } = await supabase.from(TABLE).delete().eq('id', id);
  if (error) throw error;
}
