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
    status: record.status ?? 'open',
    createdAt: record.created_at,
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

export async function createJourney(input: CreateJourneyInput): Promise<Journey> {
  const { data, error } = await supabase
    .from(TABLE)
    .insert({
      tournament_id: input.tournamentId,
      journey_date: input.journeyDate,
      fields_quantity: input.fieldsQuantity,
      score_limit: input.scoreLimit,
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
    })
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

export async function deleteJourney(id: number): Promise<void> {
  const { error } = await supabase.from(TABLE).delete().eq('id', id);
  if (error) throw error;
}