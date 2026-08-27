import { supabase } from '@/lib/supabase';
import type { Journey, JourneyMatch, JourneyMatchRecord, JourneyRecord, Player } from '@/types';
import {
  calculateStandings,
  buildWeightedStandings,
  type StandingRow,
} from '@/lib/standings';

const MATCHES_TABLE = 'journeys_matches';
const JOURNEYS_TABLE = 'journeys';
const TOURNAMENTS_TABLE = 'tournaments';
const PARTICIPANTS_TABLE = 'journeys_participants';

function mapMatch(record: JourneyMatchRecord): JourneyMatch {
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

function mapJourney(record: JourneyRecord): Journey {
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

/** Partidos donde el jugador aparece en cualquiera de los 4 slots. */
export async function getMatchesByPlayerId(playerId: number): Promise<JourneyMatch[]> {
  const { data, error } = await supabase
    .from(MATCHES_TABLE)
    .select('*')
    .or(
      `player_a1_id.eq.${playerId},player_a2_id.eq.${playerId},player_b1_id.eq.${playerId},player_b2_id.eq.${playerId}`,
    )
    .order('round', { ascending: true });

  if (error) throw error;
  return (data as JourneyMatchRecord[]).map(mapMatch);
}

/**
 * Partidos del jugador solo en jornadas finalizadas (mismo criterio que Ranking).
 */
async function getFinishedMatchesByPlayerId(
  playerId: number,
): Promise<JourneyMatch[]> {
  const matches = await getMatchesByPlayerId(playerId);
  if (matches.length === 0) return [];

  const journeyIds = [...new Set(matches.map((m) => m.journeyId))];
  const { data: journeys, error } = await supabase
    .from(JOURNEYS_TABLE)
    .select('id, status')
    .in('id', journeyIds);

  if (error) throw error;

  const finishedIds = new Set(
    (journeys ?? [])
      .filter((j) => j.status === 'finished')
      .map((j) => j.id as number),
  );

  return matches.filter((m) => finishedIds.has(m.journeyId));
}

/**
 * Estadísticas ponderadas globales del jugador (todos los torneos).
 * Solo considera jornadas finalizadas, igual que el Ranking.
 */
export async function getPlayerWeightedStats(
  playerId: number,
  players: Player[],
): Promise<StandingRow | null> {
  const finishedMatches = await getFinishedMatchesByPlayerId(playerId);
  if (finishedMatches.length === 0) return null;

  const standings = calculateStandings(finishedMatches, players);
  const weighted = buildWeightedStandings(standings);
  return weighted.find((row) => row.playerId === playerId) ?? null;
}

export type MatchOutcome = 'win' | 'draw' | 'loss' | 'pending';

export type PlayerMatchView = {
  match: JourneyMatch;
  round: number;
  partnerId: number;
  opponentIds: [number, number];
  scoreOwn: number;
  scoreOpp: number;
  outcome: MatchOutcome;
};

export type PlayerJourneyHistoryItem = {
  journey: Journey;
  tournamentId: number;
  tournamentName: string;
  matches: PlayerMatchView[];
};

function buildMatchView(match: JourneyMatch, playerId: number): PlayerMatchView {
  const teamA = [match.playerA1Id, match.playerA2Id];
  const teamB = [match.playerB1Id, match.playerB2Id];
  const inTeamA = teamA.includes(playerId);

  const partnerId = inTeamA
    ? teamA.find((id) => id !== playerId)!
    : teamB.find((id) => id !== playerId)!;
  const opponentIds = (inTeamA ? teamB : teamA) as [number, number];
  const scoreOwn = inTeamA ? match.scoreA : match.scoreB;
  const scoreOpp = inTeamA ? match.scoreB : match.scoreA;

  const hasScore =
    match.scoreA > 0 || match.scoreB > 0 || match.pointsObtained > 0;

  let outcome: MatchOutcome = 'pending';
  if (hasScore) {
    if (scoreOwn > scoreOpp) outcome = 'win';
    else if (scoreOwn < scoreOpp) outcome = 'loss';
    else outcome = 'draw';
  }

  return {
    match,
    round: match.round,
    partnerId,
    opponentIds,
    scoreOwn,
    scoreOpp,
    outcome,
  };
}

type PairStatsAccumulator = {
  points: number;
  wins: number;
  draws: number;
  losses: number;
  matchesPlayed: number;
  journeys: Set<number>;
  pointsFor: number;
  pointsAgainst: number;
};

function emptyAccumulator(): PairStatsAccumulator {
  return {
    points: 0,
    wins: 0,
    draws: 0,
    losses: 0,
    matchesPlayed: 0,
    journeys: new Set(),
    pointsFor: 0,
    pointsAgainst: 0,
  };
}

function applyMatchToAccumulator(
  acc: PairStatsAccumulator,
  view: PlayerMatchView,
): void {
  if (view.outcome === 'pending') return;

  acc.matchesPlayed += 1;
  acc.journeys.add(view.match.journeyId);
  acc.pointsFor += view.scoreOwn;
  acc.pointsAgainst += view.scoreOpp;

  if (view.outcome === 'win') {
    acc.points += 2;
    acc.wins += 1;
  } else if (view.outcome === 'draw') {
    acc.points += 1;
    acc.draws += 1;
  } else {
    acc.losses += 1;
  }
}

function accumulatorsToWeightedRows(
  map: Map<number, PairStatsAccumulator>,
  players: Player[],
): StandingRow[] {
  const playerName = (id: number) =>
    players.find((p) => p.id === id)?.displayName ?? `Jugador #${id}`;

  const rows: StandingRow[] = Array.from(map.entries())
    .filter(([, data]) => data.matchesPlayed > 0)
    .map(([otherId, data]) => {
      const difference = data.pointsFor - data.pointsAgainst;
      return {
        playerId: otherId,
        playerName: playerName(otherId),
        position: 0,
        points: data.points / data.matchesPlayed,
        wins: data.wins,
        draws: data.draws,
        losses: data.losses,
        matchesPlayed: data.matchesPlayed,
        journeysPlayed: data.journeys.size,
        pointsFor: data.pointsFor,
        pointsAgainst: data.pointsAgainst,
        difference: difference / data.matchesPlayed,
      };
    });

  rows.sort((a, b) => {
    if (b.points !== a.points) return b.points - a.points;
    if (b.difference !== a.difference) return b.difference - a.difference;
    if (b.wins !== a.wins) return b.wins - a.wins;
    if (b.draws !== a.draws) return b.draws - a.draws;
    return a.playerName.localeCompare(b.playerName, 'es');
  });

  let position = 1;
  return rows.map((row, index) => {
    if (index === 0) return { ...row, position: 1 };

    const previous = rows[index - 1];
    const same =
      row.points === previous.points &&
      row.difference === previous.difference &&
      row.wins === previous.wins &&
      row.draws === previous.draws;

    if (!same) position = index + 1;
    return { ...row, position };
  });
}

/**
 * Mini-ranking ponderado del jugador con cada pareja (jornadas finalizadas).
 * Cada fila = stats del jugador seleccionado cuando jugó junto a ese partner.
 */
export async function getPlayerPartnerStats(
  playerId: number,
  players: Player[],
): Promise<StandingRow[]> {
  const finishedMatches = await getFinishedMatchesByPlayerId(playerId);
  if (finishedMatches.length === 0) return [];

  const byPartner = new Map<number, PairStatsAccumulator>();

  for (const match of finishedMatches) {
    const view = buildMatchView(match, playerId);
    if (view.outcome === 'pending') continue;

    const partnerId = view.partnerId;
    if (!byPartner.has(partnerId)) {
      byPartner.set(partnerId, emptyAccumulator());
    }
    applyMatchToAccumulator(byPartner.get(partnerId)!, view);
  }

  return accumulatorsToWeightedRows(byPartner, players);
}

/**
 * Mini-ranking ponderado del jugador vs cada rival (jornadas finalizadas).
 * Cada fila = stats del jugador seleccionado cuando enfrentó a ese rival.
 * Un partido cuenta para ambos rivales del equipo contrario.
 */
export async function getPlayerRivalStats(
  playerId: number,
  players: Player[],
): Promise<StandingRow[]> {
  const finishedMatches = await getFinishedMatchesByPlayerId(playerId);
  if (finishedMatches.length === 0) return [];

  const byRival = new Map<number, PairStatsAccumulator>();

  for (const match of finishedMatches) {
    const view = buildMatchView(match, playerId);
    if (view.outcome === 'pending') continue;

    for (const rivalId of view.opponentIds) {
      if (!byRival.has(rivalId)) {
        byRival.set(rivalId, emptyAccumulator());
      }
      applyMatchToAccumulator(byRival.get(rivalId)!, view);
    }
  }

  return accumulatorsToWeightedRows(byRival, players);
}

/**
 * Historial de jornadas del jugador (todos los torneos).
 * Incluye jornadas abiertas y finalizadas en las que participó.
 */
export async function getPlayerJourneyHistory(
  playerId: number,
): Promise<PlayerJourneyHistoryItem[]> {
  // 1) Jornadas donde figura como participante
  const { data: participants, error: partError } = await supabase
    .from(PARTICIPANTS_TABLE)
    .select('journey_id')
    .eq('player_id', playerId);

  if (partError) throw partError;

  const journeyIdsFromParticipants = (participants ?? []).map(
    (p) => p.journey_id as number,
  );

  // 2) También partidos (por si hubo reemplazos y el id quedó solo en matches)
  const matches = await getMatchesByPlayerId(playerId);
  const journeyIdsFromMatches = matches.map((m) => m.journeyId);
  const allJourneyIds = [
    ...new Set([...journeyIdsFromParticipants, ...journeyIdsFromMatches]),
  ];

  if (allJourneyIds.length === 0) return [];

  // 3) Jornadas
  const { data: journeyRows, error: journeyError } = await supabase
    .from(JOURNEYS_TABLE)
    .select('*')
    .in('id', allJourneyIds)
    .order('journey_date', { ascending: false });

  if (journeyError) throw journeyError;

  const journeys = (journeyRows as JourneyRecord[]).map(mapJourney);
  const tournamentIds = [...new Set(journeys.map((j) => j.tournamentId))];

  // 4) Torneos
  const { data: tournamentRows, error: tournamentError } = await supabase
    .from(TOURNAMENTS_TABLE)
    .select('id, description')
    .in('id', tournamentIds);

  if (tournamentError) throw tournamentError;

  const tournamentNameById = new Map<number, string>(
    (tournamentRows ?? []).map((t) => [t.id as number, t.description as string]),
  );

  const matchesByJourney = new Map<number, JourneyMatch[]>();
  for (const m of matches) {
    const list = matchesByJourney.get(m.journeyId) ?? [];
    list.push(m);
    matchesByJourney.set(m.journeyId, list);
  }

  return journeys.map((journey) => {
    const journeyMatches = (matchesByJourney.get(journey.id) ?? [])
      .slice()
      .sort((a, b) => a.round - b.round || a.id - b.id)
      .map((m) => buildMatchView(m, playerId));

    return {
      journey,
      tournamentId: journey.tournamentId,
      tournamentName:
        tournamentNameById.get(journey.tournamentId) ?? `Torneo #${journey.tournamentId}`,
      matches: journeyMatches,
    };
  });
}
