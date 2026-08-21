import { supabase } from '@/lib/supabase';
import type {
  JourneyParticipant,
  JourneyParticipantRecord,
  CreateJourneyParticipantInput,
} from '@/types';

const TABLE = 'journeys_participants';

function mapRecordToParticipant(record: JourneyParticipantRecord): JourneyParticipant {
  return {
    id: record.id,
    journeyId: record.journey_id,
    playerId: record.player_id,
    seed: record.seed,
    createdAt: record.created_at,
  };
}

export async function getParticipantsByJourneyId(
  journeyId: number
): Promise<JourneyParticipant[]> {
  const { data, error } = await supabase
    .from(TABLE)
    .select('*')
    .eq('journey_id', journeyId)
    .order('seed', { ascending: true });

  if (error) throw error;
  return (data as JourneyParticipantRecord[]).map(mapRecordToParticipant);
}

export async function createJourneyParticipant(
  input: CreateJourneyParticipantInput
): Promise<JourneyParticipant> {
  const { data, error } = await supabase
    .from(TABLE)
    .insert({
      journey_id: input.journeyId,
      player_id: input.playerId,
      seed: input.seed,
    })
    .select()
    .single();

  if (error) throw error;
  return mapRecordToParticipant(data as JourneyParticipantRecord);
}

export async function createJourneyParticipantsBulk(
  inputs: CreateJourneyParticipantInput[]
): Promise<JourneyParticipant[]> {
  const { data, error } = await supabase
    .from(TABLE)
    .insert(
      inputs.map((input) => ({
        journey_id: input.journeyId,
        player_id: input.playerId,
        seed: input.seed,
      }))
    )
    .select();

  if (error) throw error;
  return (data as JourneyParticipantRecord[]).map(mapRecordToParticipant);
}

export async function deleteJourneyParticipant(id: number): Promise<void> {
  const { error } = await supabase.from(TABLE).delete().eq('id', id);
  if (error) throw error;
}

/**
 * Cambia el player_id de un participante manteniendo el mismo seed.
 * Usado para reemplazar un jugador ausente sin regenerar la jornada.
 */
export async function updateParticipantPlayerId(
  participantId: number,
  newPlayerId: number,
): Promise<JourneyParticipant> {
  const { data, error } = await supabase
    .from(TABLE)
    .update({ player_id: newPlayerId })
    .eq('id', participantId)
    .select()
    .single();

  if (error) throw error;
  return mapRecordToParticipant(data as JourneyParticipantRecord);
}