import { Player } from "@/interfaces/player";
import { v4 as uuid } from "uuid";
import {
  uniqueNamesGenerator,
  adjectives,
  colors,
  animals,
} from "unique-names-generator";

const idToPlayer = {} as Record<string, Player>;

export function createPlayer(nickname?: string) {
  const id = uuid();

  const player = {
    id,
    nickname: nickname || getRandomName(),
  };

  idToPlayer[id] = player;

  return player;
}

export function updatePlayer(
  id: string,
  newFields: Partial<Omit<Player, "id">>
) {
  if (!playerExists(id)) {
    return null;
  }

  idToPlayer[id] = {
    ...idToPlayer[id],
    ...newFields,
  };

  return idToPlayer[id];
}

export function playerExists(id: string) {
  return id in idToPlayer;
}

export function getPlayer(id: string) {
  return playerExists(id) ? idToPlayer[id] : null;
}

// Utilities below 👇

/**
 * Generates random names, e.g big_red_donkey
 */
const getRandomName = () =>
  uniqueNamesGenerator({ dictionaries: [adjectives, animals] });
