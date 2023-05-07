import type { Match, MatchJoinStatus } from "game-logic";
import { ClientAPI } from "../api";

export async function createMatch() {
  const { status, data } = await ClientAPI.put<Match>(`/match/create`);

  if (status === 201) return data;

  return null;
}

export async function joinMatch(matchCode: string) {
  const { data } = await ClientAPI.post<{
    match: Match;
    matchJoinStatus: MatchJoinStatus;
  }>(`/match/join/${matchCode}`);

  return data;
}
