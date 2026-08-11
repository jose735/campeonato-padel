export type Player = {
  id: string;
  firstName: string;
  lastName: string;
  nickname?: string;
  displayName: string;
  createdAt: string;
};

export type PlayerRecord = {
  id: string;
  first_name: string;
  last_name: string;
  nickname: string | null;
  created_at: string;
};

export type CreatePlayerInput = {
  firstName: string;
  lastName: string;
  nickname?: string;
};