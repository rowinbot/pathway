import { BoardState } from "./board";
import { Card } from "./cards";
import { Match, MatchPlayer } from "./match";
import { Player } from "./player";

interface Movement {
  playerId: string;
  action: "add" | "remove";
  card: Card;
  row: number;
  col: number;
}

interface MovementResponse {
  success: boolean;
}

export interface ServerToClientEvents {
  boardState(boardState: BoardState): void;
  playerMovement(movement: Movement): void;
}

export interface ClientToServerEvents {
  movement(movement: Movement): MovementResponse;
}

export interface InterServerEvents {}

export interface SocketData {
  /**
   * A player _can_ be in only one match at a time.
   */
  match: Match | null;

  /**
   * Information about the player in the active match.
   */
  matchPlayer: MatchPlayer | null;

  /**
   * Static information about the player. Is maintained across matches.
   */
  player: Player;
}
