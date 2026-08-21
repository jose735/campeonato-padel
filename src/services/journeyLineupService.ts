import { supabase } from '@/lib/supabase';
import type { GeneratedMatch } from '@/lib/roundRobinGenerator';
import {
  getParticipantsByJourneyId,
  updateParticipantPlayerId,
} from '@/services/journeyParticipantService';
import {
  replacePlayerInJourneyMatches,
  journeyHasScores,
} from '@/services/journeyMatchService';

type MatchWithCourt = GeneratedMatch & { fieldNumber: number };

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
  field_number: number;
};

export async function createJourneyLineup(
  journeyId: number,
  participants: { playerId: number; seed: number }[],
  matches: MatchWithCourt[]
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
    field_number: m.fieldNumber, 
  }));

  const { error } = await supabase.rpc('create_journey_lineup', {
    p_journey_id: journeyId,
    p_participants: participantsPayload,
    p_matches: matchesPayload,
  });

  if (error) throw error;
}

/**
 * Reemplaza un jugador en una jornada ya generada.
 * - El nuevo jugador hereda el seed del jugador reemplazado.
 * - Se actualizan todos los partidos (las 4 columnas de jugadores).
 * - No se regeneran seeds ni partidos.
 */
export async function replacePlayerInJourney(
  journeyId: number,
  oldPlayerId: number,
  newPlayerId: number,
): Promise<void> {
  if (oldPlayerId === newPlayerId) {
    throw new Error('El jugador de reemplazo debe ser distinto al actual.');
  }

  const hasScores = await journeyHasScores(journeyId);
  if (hasScores) {
    throw new Error(
      'No se puede reemplazar un jugador porque la jornada ya tiene marcadores cargados.',
    );
  }

  const participants = await getParticipantsByJourneyId(journeyId);
  const oldParticipant = participants.find((p) => p.playerId === oldPlayerId);

  if (!oldParticipant) {
    throw new Error('El jugador a reemplazar no pertenece a esta jornada.');
  }

  const alreadyInJourney = participants.some((p) => p.playerId === newPlayerId);
  if (alreadyInJourney) {
    throw new Error('El jugador de reemplazo ya está inscrito en esta jornada.');
  }

  // 1) Actualizar el participante (mantiene el seed)
  await updateParticipantPlayerId(oldParticipant.id, newPlayerId);

  // 2) Reemplazar el player_id en todos los partidos de la jornada
  await replacePlayerInJourneyMatches(journeyId, oldPlayerId, newPlayerId);
}