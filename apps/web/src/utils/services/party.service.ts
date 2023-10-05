import type { Party, PartyJoinStatus } from "game-logic";
import { ClientAPI } from "../api";

export async function createParty() {
  const { status, data } = await ClientAPI.put<Party>(`/party/create`);

  if (status === 201) return data;

  return null;
}

export async function joinParty(code: string) {
  const { data } = await ClientAPI.post<{
    party: Party;
    partyJoinStatus: PartyJoinStatus;
  }>(`/party/join/${code}`);

  return data;
}
