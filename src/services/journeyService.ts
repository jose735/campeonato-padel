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

/**
 * Cantidad de jornadas "efectivas" de un torneo para FAC / título ponderado:
 * solo jornadas finalizadas, contando como una sola las del mismo journey_date.
 */
export async function getUniqueJourneyDayCountByTournamentId(
  tournamentId: number,
): Promise<number> {
  if (
    typeof tournamentId !== "number" ||
    !Number.isFinite(tournamentId) ||
    tournamentId <= 0 ||
    tournamentId === DELETED_TOURNAMENT_ID
  ) {
    return 0;
  }

  const { data, error } = await supabase
    .from(TABLE)
    .select("journey_date")
    .eq("tournament_id", tournamentId)
    .eq("status", "finished");

  if (error) throw error;
  const dates = new Set(
    (data as { journey_date: string }[] | null)?.map((r) => r.journey_date) ??
      [],
  );
  return dates.size;
}

/**
 * Cantidad de jornadas efectivas (días únicos, solo finalizadas) de todos los
 * torneos con include_in_historical = true. Usado en Tabla Histórica ponderada.
 */
export async function getUniqueJourneyDayCountForHistorical(): Promise<number> {
  const { data: tournaments, error: tournamentsError } = await supabase
    .from("tournaments")
    .select("id")
    .eq("include_in_historical", true);

  if (tournamentsError) throw tournamentsError;
  const tournamentIds = (tournaments ?? []).map((t) => t.id as number);
  if (tournamentIds.length === 0) return 0;

  const { data, error } = await supabase
    .from(TABLE)
    .select("journey_date")
    .in("tournament_id", tournamentIds)
    .eq("status", "finished");

  if (error) throw error;
  const dates = new Set(
    (data as { journey_date: string }[] | null)?.map((r) => r.journey_date) ??
      [],
  );
  return dates.size;
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
 * 1) el marcado explícitamente con is_current = true;
 * 2) si no hay ninguno, el de la jornada (no eliminada) con journey_date más reciente
 *    (y, en caso de empate, el id de jornada más alto).
 * Retorna null si no hay torneo marcado ni jornadas.
 */
export async function getCurrentTournamentId(): Promise<number | null> {
  try {
    const { data: marked, error: markedError } = await supabase
      .from('tournaments')
      .select('id')
      .eq('is_current', true)
      .neq('id', DELETED_TOURNAMENT_ID)
      .maybeSingle();

    // Si la columna aún no existe, seguimos con el fallback por jornadas
    if (!markedError && marked?.id != null) return marked.id;
  } catch {
    // ignore y usar fallback
  }

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

/**
 * Actualiza solo el score_limit de una jornada.
 * El caller debe garantizar que no hay marcadores cargados.
 */
export async function updateJourneyScoreLimit(
  id: number,
  scoreLimit: number,
): Promise<Journey> {
  const { data, error } = await supabase
    .from(TABLE)
    .update({ score_limit: scoreLimit })
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
