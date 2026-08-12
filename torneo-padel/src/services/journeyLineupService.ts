import { supabase } from '@/lib/supabase';
import type { GeneratedMatch } from '@/lib/roundRobinGenerator';

type ParticipantPayload = {
  journey_id: number;
  player_id: number;
  seed: number;
};

type MatchPayload = {
  journey_id: number;
  round: number;
  player_a1_id: number;
  player_a2_id: number;
  player_b1_id: number;
  player_b2_id: number;
  score_a: number;
  score_b: number;
  points_obtained: number;
};

export async function createJourneyLineup(
  journeyId: number,
  participants: { playerId: number; seed: number }[],
  matches: GeneratedMatch[]
): Promise<void> {
  const participantsPayload: ParticipantPayload[] = participants.map((p) => ({
    journey_id: journeyId,
    player_id: p.playerId,
    seed: p.seed,
  }));

  const matchesPayload: MatchPayload[] = matches.map((m) => ({
    journey_id: journeyId,
    round: m.round,
    player_a1_id: m.playerA1Id,
    player_a2_id: m.playerA2Id,
    player_b1_id: m.playerB1Id,
    player_b2_id: m.playerB2Id,
    score_a: 0,
    score_b: 0,
    points_obtained: 0,
  }));

  const { error } = await supabase.rpc('create_journey_lineup', {
    p_journey_id: journeyId,
    p_participants: participantsPayload,
    p_matches: matchesPayload,
  });

  if (error) throw error;
}