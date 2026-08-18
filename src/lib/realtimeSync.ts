import { supabase } from "@/lib/supabase";
import type {
  Player,
  PlayerRecord,
  Tournament,
  TournamentRecord,
  Journey,
  JourneyRecord,
  JourneyMatch,
  JourneyMatchRecord,
  JourneyParticipant,
  JourneyParticipantRecord,
} from "@/types";
import { usePlayerStore } from "@/store/player-store";
import { useTournamentStore } from "@/store/tournament-store";
import { useJourneyStore } from "@/store/journey-store";
import { useJourneyMatchStore } from "@/store/journey-match-store";
import { useJourneyParticipantStore } from "@/store/journey-participant-store";

function mapPlayer(record: PlayerRecord): Player {
  const nickname = record.nickname ?? undefined;
  const fullName = `${record.first_name} ${record.last_name}`;
  return {
    id: record.id,
    firstName: record.first_name,
    lastName: record.last_name,
    nickname,
    displayName: nickname ? nickname : fullName,
    createdAt: record.created_at,
    updatedAt: record.updated_at,
  };
}

function mapTournament(record: TournamentRecord): Tournament {
  return {
    id: record.id,
    description: record.description,
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
    status: record.status ?? "open",
    createdAt: record.created_at,
  };
}

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

function mapParticipant(record: JourneyParticipantRecord): JourneyParticipant {
  return {
    id: record.id,
    journeyId: record.journey_id,
    playerId: record.player_id,
    seed: record.seed,
    createdAt: record.created_at,
  };
}

let channel: ReturnType<typeof supabase.channel> | null = null;

export function startRealtimeSync() {
  if (channel) return;

  channel = supabase
    .channel("app-realtime")
    .on(
      "postgres_changes",
      { event: "*", schema: "public", table: "players" },
      (payload) => {
        const store = usePlayerStore.getState();
        if (payload.eventType === "INSERT") {
          store.addPlayer(mapPlayer(payload.new as PlayerRecord));
        } else if (payload.eventType === "UPDATE") {
          store.editPlayer(mapPlayer(payload.new as PlayerRecord));
        } else if (payload.eventType === "DELETE") {
          store.removePlayer((payload.old as PlayerRecord).id);
        }
      },
    )
    .on(
      "postgres_changes",
      { event: "*", schema: "public", table: "tournaments" },
      (payload) => {
        const store = useTournamentStore.getState();
        if (payload.eventType === "INSERT") {
          store.addTournament(mapTournament(payload.new as TournamentRecord));
        } else if (payload.eventType === "UPDATE") {
          store.editTournament(mapTournament(payload.new as TournamentRecord));
        } else if (payload.eventType === "DELETE") {
          store.removeTournament((payload.old as TournamentRecord).id);
        }
      },
    )
    .on(
      "postgres_changes",
      { event: "*", schema: "public", table: "journeys" },
      (payload) => {
        const store = useJourneyStore.getState();
        if (payload.eventType === "INSERT") {
          store.addJourney(mapJourney(payload.new as JourneyRecord));
        } else if (payload.eventType === "UPDATE") {
          store.editJourney(mapJourney(payload.new as JourneyRecord));
        } else if (payload.eventType === "DELETE") {
          store.removeJourney((payload.old as JourneyRecord).id);
        }
      },
    )
    .on(
      "postgres_changes",
      { event: "*", schema: "public", table: "journeys_matches" },
      (payload) => {
        const store = useJourneyMatchStore.getState();
        const currentJourneyId = store.currentJourneyId;

        if (payload.eventType === "INSERT") {
          const match = mapMatch(payload.new as JourneyMatchRecord);
          if (currentJourneyId === match.journeyId) {
            store.addMatch(match);
          }
          if (!store.journeyIdsWithMatches.includes(match.journeyId)) {
            void store.fetchJourneyIdsWithMatches();
          }
        } else if (payload.eventType === "UPDATE") {
          const match = mapMatch(payload.new as JourneyMatchRecord);
          if (currentJourneyId === match.journeyId) {
            store.editMatch(match);
          }
        } else if (payload.eventType === "DELETE") {
          const old = payload.old as JourneyMatchRecord;
          if (currentJourneyId === old.journey_id) {
            store.removeMatch(old.id);
          }
          void store.fetchJourneyIdsWithMatches();
        }
      },
    )
    .on(
      "postgres_changes",
      { event: "*", schema: "public", table: "journeys_participants" },
      (payload) => {
        const store = useJourneyParticipantStore.getState();
        const currentJourneyId = store.currentJourneyId;

        if (payload.eventType === "INSERT") {
          const participant = mapParticipant(
            payload.new as JourneyParticipantRecord,
          );
          if (currentJourneyId === participant.journeyId) {
            store.addParticipant(participant);
          }
        } else if (payload.eventType === "DELETE") {
          const old = payload.old as JourneyParticipantRecord;
          if (currentJourneyId === old.journey_id) {
            store.removeParticipant(old.id);
          }
        }
      },
    )
    .subscribe((status) => {
      if (status === "SUBSCRIBED") {
        console.debug("[realtime] subscribed");
      }
    });
}

export function stopRealtimeSync() {
  if (channel) {
    void supabase.removeChannel(channel);
    channel = null;
  }
}
