import type { Player } from "game-logic";
import { ClientAPI, setClientAxiosDefaultHeader } from "@/utils/api";

const PLAYER_ID_LOCAL_STORAGE_KEY = "playerId";

/**
 * Loads the player information from the server.
 */
export async function loadPlayer(): Promise<Player> {
  const { status, data } = await ClientAPI.get<Player>(`/player/info`, {
    headers: {
      "x-player-id": localStorage.getItem(PLAYER_ID_LOCAL_STORAGE_KEY),
    },
  });

  if (status !== 200 && status !== 201) {
    throw new Error("Failed to load player");
  }

  const player = data;

  localStorage.setItem(PLAYER_ID_LOCAL_STORAGE_KEY, player.id);
  setClientAxiosDefaultHeader("x-player-id", player.id);

  return player;
}

export async function updatePlayerInfo(
  partialPlayer: Partial<Omit<Player, "id">>
): Promise<Player> {
  const { status, data } = await ClientAPI.post<Player>(
    `/player/info`,
    partialPlayer,
    {
      headers: {
        "x-player-id": localStorage.getItem(PLAYER_ID_LOCAL_STORAGE_KEY),
      },
    }
  );

  if (status !== 201) {
    throw new Error("Failed to update player info");
  }

  return data;
}
