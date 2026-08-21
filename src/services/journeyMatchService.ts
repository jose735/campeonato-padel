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
    fieldNumber: record.field_number,
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

export async function getMatchesByTournamentId(
  tournamentId: number
): Promise<JourneyMatch[]> {
  // 1) Solo jornadas finalizadas del torneo
  const { data: journeys, error: journeysError } = await supabase
    .from('journeys')
    .select('id')
    .eq('tournament_id', tournamentId)
    .eq('status', 'finished');

  if (journeysError) throw journeysError;

  const journeyIds = (journeys ?? []).map((j) => j.id);
  if (journeyIds.length === 0) return [];

  // 2) Partidos de esas jornadas
  const { data, error } = await supabase
    .from(TABLE)
    .select('*')
    .in('journey_id', journeyIds)
    .order('round', { ascending: true });

  if (error) throw error;
  return (data as JourneyMatchRecord[]).map(mapRecordToJourneyMatch);
}

export async function getJourneyIdsWithMatches(): Promise<number[]> {
  const { data, error } = await supabase.from(TABLE).select('journey_id');

  if (error) throw error;

  const uniqueIds = new Set((data as { journey_id: number }[]).map((row) => row.journey_id));
  return Array.from(uniqueIds);
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
      field_number: input.fieldNumber,
    })
    .select()
    .single();

  if (error) throw error;
  return mapRecordToJourneyMatch(data as JourneyMatchRecord);
}

export async function createJourneyMatchesBulk(
  inputs: CreateJourneyMatchInput[]
): Promise<JourneyMatch[]> {
  const { data, error } = await supabase
    .from(TABLE)
    .insert(
      inputs.map((input) => ({
        journey_id: input.journeyId,
        round: input.round,
        player_a1_id: input.playerA1Id,
        player_a2_id: input.playerA2Id,
        player_b1_id: input.playerB1Id,
        player_b2_id: input.playerB2Id,
        score_a: input.scoreA,
        score_b: input.scoreB,
        points_obtained: input.pointsObtained,
        field_number: input.fieldNumber,
      }))
    )
    .select();

  if (error) throw error;
  return (data as JourneyMatchRecord[]).map(mapRecordToJourneyMatch);
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
      field_number: input.fieldNumber,
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

/**
 * Reemplaza un player_id por otro en todas las columnas de jugadores
 * de todos los partidos de una jornada.
 * No toca scores ni field_number.
 */
export async function replacePlayerInJourneyMatches(
  journeyId: number,
  oldPlayerId: number,
  newPlayerId: number,
): Promise<void> {
  const columns = [
    'player_a1_id',
    'player_a2_id',
    'player_b1_id',
    'player_b2_id',
  ] as const;

  for (const column of columns) {
    const { error } = await supabase
      .from(TABLE)
      .update({ [column]: newPlayerId })
      .eq('journey_id', journeyId)
      .eq(column, oldPlayerId);

    if (error) throw error;
  }
}

/**
 * Indica si la jornada ya tiene al menos un marcador cargado
 * (score_a, score_b o points_obtained distintos de 0).
 */
export async function journeyHasScores(journeyId: number): Promise<boolean> {
  const { data, error } = await supabase
    .from(TABLE)
    .select('id')
    .eq('journey_id', journeyId)
    .or('score_a.gt.0,score_b.gt.0,points_obtained.gt.0')
    .limit(1);

  if (error) throw error;
  return (data?.length ?? 0) > 0;
}