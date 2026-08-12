import { supabase } from '@/lib/supabase';
import type { Player, PlayerRecord, CreatePlayerInput } from '@/types';

const TABLE = 'players';

function buildDisplayName(firstName: string, lastName: string, nickname?: string): string {
  const fullName = `${firstName} ${lastName}`;
  return nickname ? nickname : fullName;
}

function mapPlayerRecordToPlayer(record: PlayerRecord): Player {
  const nickname = record.nickname ?? undefined;

  return {
    id: record.id,
    firstName: record.first_name,
    lastName: record.last_name,
    nickname,
    displayName: buildDisplayName(record.first_name, record.last_name, nickname),
    createdAt: record.created_at,
    updatedAt: record.updated_at,
  };
}

export async function getPlayers(): Promise<Player[]> {
  const { data, error } = await supabase
    .from(TABLE)
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return (data as PlayerRecord[]).map(mapPlayerRecordToPlayer);
}

export async function createPlayer(input: CreatePlayerInput): Promise<Player> {
  const { data, error } = await supabase
    .from(TABLE)
    .insert({
      first_name: input.firstName,
      last_name: input.lastName,
      nickname: input.nickname ?? null,
    })
    .select()
    .single();

  if (error) throw error;
  return mapPlayerRecordToPlayer(data as PlayerRecord);
}

export async function updatePlayer(id: number, input: CreatePlayerInput): Promise<Player> {
  const { data, error } = await supabase
    .from(TABLE)
    .update({
      first_name: input.firstName,
      last_name: input.lastName,
      nickname: input.nickname ?? null,
    })
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return mapPlayerRecordToPlayer(data as PlayerRecord);
}

export async function deletePlayer(id: number): Promise<void> {
  const { error } = await supabase.from(TABLE).delete().eq('id', id);
  if (error) throw error;
}