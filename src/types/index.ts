export type Player = {
  id: number;
  firstName: string;
  lastName: string;
  nickname?: string;
  displayName: string;
  createdAt: string;
  updatedAt: string;
};

export type PlayerRecord = {
  id: number;
  first_name: string;
  last_name: string;
  nickname: string | null;
  created_at: string;
  updated_at: string;
};

export type CreatePlayerInput = {
  firstName: string;
  lastName: string;
  nickname?: string;
};

export type Tournament = {
  id: number;
  description: string;
  createdAt: string;
};

export type TournamentRecord = {
  id: number;
  description: string;
  created_at: string;
};

export type CreateTournamentInput = {
  description: string;
};

export type JourneyStatus = 'open' | 'finished';

export type Journey = {
  id: number;
  tournamentId: number;
  journeyDate: string;
  fieldsQuantity: number;
  scoreLimit: number;
  maxPlayers: number;
  status: JourneyStatus;
  journeyMatchSort: number | null;
  createdAt: string;
};

export type JourneyRecord = {
  id: number;
  tournament_id: number;
  journey_date: string;
  fields_quantity: number;
  score_limit: number;
  max_players: number;
  status: JourneyStatus;
  journey_match_sort: number | null;
  created_at: string;
};

export type CreateJourneyInput = {
  tournamentId: number;
  journeyDate: string;
  fieldsQuantity: number;
  scoreLimit: number;
  maxPlayers: number;
  journeyMatchSort: number | null;
};

export type JourneyParticipant = {
  id: number;
  journeyId: number;
  playerId: number;
  seed: number;
  createdAt: string;
};

export type JourneyParticipantRecord = {
  id: number;
  journey_id: number;
  player_id: number;
  seed: number;
  created_at: string;
};

export type CreateJourneyParticipantInput = {
  journeyId: number;
  playerId: number;
  seed: number;
};

export type JourneyMatch = {
  id: number;
  journeyId: number;
  round: number;
  playerA1Id: number;
  playerA2Id: number;
  playerB1Id: number;
  playerB2Id: number;
  scoreA: number;
  scoreB: number;
  pointsObtained: number;
  fieldNumber: number | null;
  createdAt: string;
};

export type JourneyMatchRecord = {
  id: number;
  journey_id: number;
  round: number;
  player_a1_id: number;
  player_a2_id: number;
  player_b1_id: number;
  player_b2_id: number;
  score_a: number;
  score_b: number;
  points_obtained: number;
  field_number: number | null;
  created_at: string;
};

export type CreateJourneyMatchInput = {
  journeyId: number;
  round: number;
  playerA1Id: number;
  playerA2Id: number;
  playerB1Id: number;
  playerB2Id: number;
  scoreA: number;
  scoreB: number;
  pointsObtained: number;
  fieldNumber: number;
};