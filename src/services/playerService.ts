import { supabase } from '@/lib/supabase';
import type { Player, PlayerRecord, CreatePlayerInput } from '@/types';

const TABLE = 'players';
const BUCKET = 'player-photos';

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const MAX_FILE_SIZE_BYTES = 2 * 1024 * 1024; // 2 MB

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
    photoUrl: (record.photo_url ?? (record as { photoUrl?: string | null }).photoUrl) || undefined,
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
      photo_url: input.photoUrl ?? null,
    })
    .select()
    .single();

  if (error) throw error;
  return mapPlayerRecordToPlayer(data as PlayerRecord);
}

export async function updatePlayer(id: number, input: CreatePlayerInput): Promise<Player> {
  const payload: Record<string, unknown> = {
    first_name: input.firstName,
    last_name: input.lastName,
    nickname: input.nickname ?? null,
  };

  if (input.photoUrl !== undefined) {
    payload.photo_url = input.photoUrl;
  }

  const { data, error } = await supabase
    .from(TABLE)
    .update(payload)
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

/**
 * Sube una foto al bucket player-photos y devuelve la URL pública.
 * Valida tipo y tamaño en el cliente.
 */
export async function uploadPlayerPhoto(playerId: number, file: File): Promise<string> {
  if (!ALLOWED_TYPES.includes(file.type)) {
    throw new Error('Formato no permitido. Usá JPG, PNG o WebP.');
  }
  if (file.size > MAX_FILE_SIZE_BYTES) {
    throw new Error('La imagen no puede superar los 2 MB.');
  }

  const ext = file.name.split('.').pop()?.toLowerCase() || 'jpg';
  const path = `${playerId}/${Date.now()}.${ext}`;

  const { error } = await supabase.storage
    .from(BUCKET)
    .upload(path, file, { upsert: true, contentType: file.type });

  if (error) throw error;

  const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
  return data.publicUrl;
}
