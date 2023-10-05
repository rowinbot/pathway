import { Match } from "./match";
import { Player } from "./player";

export interface Party {
  /**
   * Unique party ID.
   */
  code: string;

  ownerPlayerId: Player["id"];

  /**
   * Active players in the party.
   *
   * This list gets reset after every game to the active players.
   * If the party doesn't have an active match (matches.last)
   * players that disconnect from the server will automatically
   * leave the party -> this list does not include historical players.
   *
   * To get historical players query matches and sum up the players
   * accounting for de-duping.
   */
  players: Player[];

  /**
   * Stack of matches in the party. You can check the active match
   * by querying the last match in the stack and checking if it hasn't ended.
   */
  matchesCodes: Match["code"][];
}

export enum PartyJoinStatus {
  SUCCESS = "success", // Player joined successfully if 1. match isn't full and 2. re-joining already started match.

  // Errors below 👇
  NOT_FOUND = "party-not-found",
  FULL = "party-full",
  BUSY = "party-busy", // Player tried joined after party started a match and wasn't part of it before it started (not a re-join).
}

export enum PartyNewMatchMode {
  /**
   * Shuffle players into different teams.
   */
  SHUFFLE = "shuffle",

  /**
   * Jump straight into a rematch (same players on the same teams).
   */
  FAST_REMATCH = "fast-rematch",

  /**
   * Jump back to lobby.
   */
  NORMAL = "normal",
}
