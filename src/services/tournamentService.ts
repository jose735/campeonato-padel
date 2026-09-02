import { supabase } from '@/lib/supabase';
import { DELETED_TOURNAMENT_ID } from '@/lib/constants';
import type { Tournament, TournamentRecord, CreateTournamentInput } from '@/types';

const TABLE = 'tournaments';

function mapTournamentRecordToTournament(record: TournamentRecord): Tournament {
  return {
    id: record.id,
    description: record.description,
    createdAt: record.created_at,
  };
}

/** Torneos visibles para listados, selectores y ranking. Excluye el torneo especial de eliminadas. */
export async function getTournaments(): Promise<Tournament[]> {
  const { data, error } = await supabase
    .from(TABLE)
    .select('*')
    .neq('id', DELETED_TOURNAMENT_ID)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return (data as TournamentRecord[]).map(mapTournamentRecordToTournament);
}

export async function createTournament(input: CreateTournamentInput): Promise<Tournament> {
  const { data, error } = await supabase
    .from(TABLE)
    .insert({ description: input.description })
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
    .update({ description: input.description })
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
