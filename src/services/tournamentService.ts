import { supabase } from '@/lib/supabase';
import { DELETED_TOURNAMENT_ID } from '@/lib/constants';
import type { Tournament, TournamentRecord, CreateTournamentInput } from '@/types';

const TABLE = 'tournaments';

function mapTournamentRecordToTournament(record: TournamentRecord): Tournament {
  return {
    id: record.id,
    description: record.description,
    createdAt: record.created_at,
    isCurrent: Boolean(record.is_current),
    includeInHistorical: Boolean(record.include_in_historical),
  };
}

/** Todos los torneos, incluido el especial de jornadas eliminadas (listado admin). */
export async function getTournaments(): Promise<Tournament[]> {
  const { data, error } = await supabase
    .from(TABLE)
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return (data as TournamentRecord[]).map(mapTournamentRecordToTournament);
}

/** Torneos seleccionables (ranking, formularios, reasignar). Excluye el especial. */
export async function getActiveTournaments(): Promise<Tournament[]> {
  const { data, error } = await supabase
    .from(TABLE)
    .select('*')
    .neq('id', DELETED_TOURNAMENT_ID)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return (data as TournamentRecord[]).map(mapTournamentRecordToTournament);
}

/**
 * Id del torneo marcado como actual (is_current = true).
 * Si ninguno tiene el flag, retorna null (el caller puede usar el fallback por jornadas).
 */
export async function getMarkedCurrentTournamentId(): Promise<number | null> {
  const { data, error } = await supabase
    .from(TABLE)
    .select('id')
    .eq('is_current', true)
    .neq('id', DELETED_TOURNAMENT_ID)
    .maybeSingle();

  if (error) throw error;
  return data?.id ?? null;
}

/**
 * Marca un torneo como actual. Solo puede haber uno.
 * No permite marcar el torneo especial de eliminadas.
 */
export async function setCurrentTournament(tournamentId: number): Promise<void> {
  if (tournamentId === DELETED_TOURNAMENT_ID) {
    throw new Error('No se puede marcar como actual el torneo de jornadas eliminadas.');
  }

  // Quitar el flag de todos
  const { error: clearError } = await supabase
    .from(TABLE)
    .update({ is_current: false })
    .eq('is_current', true);

  if (clearError) throw clearError;

  const { error: setError } = await supabase
    .from(TABLE)
    .update({ is_current: true })
    .eq('id', tournamentId);

  if (setError) throw setError;
}

export async function createTournament(input: CreateTournamentInput): Promise<Tournament> {
  const { data, error } = await supabase
    .from(TABLE)
    .insert({
      description: input.description,
      include_in_historical: input.includeInHistorical ?? false,
    })
    .select()
    .single();

  if (error) throw error;
  return mapTournamentRecordToTournament(data as TournamentRecord);
}

export async function updateTournament(
  id: number,
  input: CreateTournamentInput
): Promise<Tournament> {
  if (id === DELETED_TOURNAMENT_ID) {
    throw new Error('No se puede editar el torneo especial de jornadas eliminadas.');
  }

  const { data, error } = await supabase
    .from(TABLE)
    .update({
      description: input.description,
      include_in_historical: input.includeInHistorical ?? false,
    })
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return mapTournamentRecordToTournament(data as TournamentRecord);
}

export async function deleteTournament(id: number): Promise<void> {
  if (id === DELETED_TOURNAMENT_ID) {
    throw new Error('No se puede eliminar el torneo especial de jornadas eliminadas.');
  }

  const { error } = await supabase.from(TABLE).delete().eq('id', id);
  if (error) throw error;
}
