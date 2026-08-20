import { supabase } from '@/lib/supabase';
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

export async function getJourneys(): Promise<Journey[]> {
  const { data, error } = await supabase
    .from(TABLE)
    .select('*')
    .order('journey_date', { ascending: true });

  if (error) throw error;
  return (data as JourneyRecord[]).map(mapJourneyRecordToJourney);
}

export async function getJourneysByTournamentId(tournamentId: number): Promise<Journey[]> {
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

export async function getJourneysByDate(journeyDate: string): Promise<Journey[]> {
  const { data, error } = await supabase
    .from(TABLE)
    .select('*')
    .eq('journey_date', journeyDate)
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

export async function deleteJourney(id: number): Promise<void> {
  const { error } = await supabase.from(TABLE).delete().eq('id', id);
  if (error) throw error;
}