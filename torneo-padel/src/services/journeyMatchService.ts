import { supabase } from '@/lib/supabase';
import type { JourneyMatch, JourneyMatchRecord, CreateJourneyMatchInput } from '@/types';

const TABLE = 'journeys_matches';

function mapRecordToJourneyMatch(record: JourneyMatchRecord): JourneyMatch {
  return {
    id: record.id,
    journeyId: record.journey_id,
    round: record.round,
    playerA1Id: record.player_a1_id,
    playerA2Id: record.player_a2_id,
    playerB1Id: record.player_b1_id,
    playerB2Id: record.player_b2_id,
    scoreA: record.score_a,
    scoreB: record.score_b,
    pointsObtained: record.points_obtained,
    createdAt: record.created_at,
  };
}

export async function getMatchesByJourneyId(journeyId: number): Promise<JourneyMatch[]> {
  const { data, error } = await supabase
    .from(TABLE)
    .select('*')
    .eq('journey_id', journeyId)
    .order('round', { ascending: true });

  if (error) throw error;
  return (data as JourneyMatchRecord[]).map(mapRecordToJourneyMatch);
}

export async function createJourneyMatch(input: CreateJourneyMatchInput): Promise<JourneyMatch> {
  const { data, error } = await supabase
    .from(TABLE)
    .insert({
      journey_id: input.journeyId,
      round: input.round,
      player_a1_id: input.playerA1Id,
      player_a2_id: input.playerA2Id,
      player_b1_id: input.playerB1Id,
      player_b2_id: input.playerB2Id,
      score_a: input.scoreA,
      score_b: input.scoreB,
      points_obtained: input.pointsObtained,
    })
    .select()
    .single();

  if (error) throw error;
  return mapRecordToJourneyMatch(data as JourneyMatchRecord);
}

export async function updateJourneyMatch(
  id: number,
  input: CreateJourneyMatchInput
): Promise<JourneyMatch> {
  const { data, error } = await supabase
    .from(TABLE)
    .update({
      round: input.round,
      player_a1_id: input.playerA1Id,
      player_a2_id: input.playerA2Id,
      player_b1_id: input.playerB1Id,
      player_b2_id: input.playerB2Id,
      score_a: input.scoreA,
      score_b: input.scoreB,
      points_obtained: input.pointsObtained,
    })
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return mapRecordToJourneyMatch(data as JourneyMatchRecord);
}

export async function deleteJourneyMatch(id: number): Promise<void> {
  const { error } = await supabase.from(TABLE).delete().eq('id', id);
  if (error) throw error;
}