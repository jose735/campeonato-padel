import { supabase } from '@/lib/supabase';
import type { Tournament, TournamentRecord, CreateTournamentInput } from '@/types';

const TABLE = 'tournaments';

function mapTournamentRecordToTournament(record: TournamentRecord): Tournament {
  return {
    id: record.id,
    description: record.description,
    createdAt: record.created_at,
  };
}

export async function getTournaments(): Promise<Tournament[]> {
  const { data, error } = await supabase
    .from(TABLE)
    .select('*')
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
  const { error } = await supabase.from(TABLE).delete().eq('id', id);
  if (error) throw error;
}