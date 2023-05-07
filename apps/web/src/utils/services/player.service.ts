import type { Player } from "game-logic";
import { ClientAPI, setClientAxiosDefaultHeader } from "../api";

const PLAYER_ID_LOCAL_STORAGE_KEY = "playerId";

/**
 * Loads the player information from the server.
 */
export async function loadPlayer(): Promise<Player | null> {
  const { status, data } = await ClientAPI.get<Player>(`/player/info`, {
    headers: {
      "x-player-id": localStorage.getItem(PLAYER_ID_LOCAL_STORAGE_KEY),
    },
  });

  if (status !== 200 && status !== 201) {
    return null;
  }

  const player = data;

  localStorage.setItem(PLAYER_ID_LOCAL_STORAGE_KEY, player.id);
  setClientAxiosDefaultHeader("x-player-id", player.id);

  return player;
}
