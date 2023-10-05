import { BoardState } from "./board";
import { Card } from "./cards";
import { TeamI } from "./team";

import { PartyJoinStatus, PartyNewMatchMode } from "./party";

import {
  MatchCurrentTurn,
  MatchPlayer,
  Movement,
  MatchConfig,
  MatchPlayerHand,
  NewSequenceBounds,
} from "./match";

/**
 * Private response to a player movement.
 * Contains sensitive information about a player's hand (`nextCard`).
 */
export interface MovementResponse {
  success: boolean;

  /**
   * The card that was attempted to be placed on the board.
   */
  card: Card | null;
  nextCard: Card | null;
}

export interface LastMovement extends Movement {
  /**
   * The card that was placed on the board.
   */
  card: Card;
  team: TeamI;
  newSequences: NewSequenceBounds[];
}

export enum MatchCouldNotStartReason {
  invalidLayout = "invalidLayout",
  notOwner = "notOwner",
}

export enum NewMatchCouldNotStartReason {
  invalidLayout = "invalidLayout",
  notOwner = "notOwner",
}

export enum ServerToClientEvent {
  /**
   * Fired when a player joins a party.
   */
  PARTY_JOIN = "PARTY_JOIN",

  /**
   * Fired when re-joining a match.
   * This event is fired after `PARTY_JOIN` (when successfully joined) if the latest match already started or when it starts.
   */
  PARTY_STATE = "PARTY_STATE",

  /**
   * Fired when joining a party active match and when the match config is updated.
   */
  PARTY_CONFIG_UPDATED = "PARTY_CONFIG_UPDATED",

  /**
   * Fires when 1. joined a match (started / not started), 2. when a player joins / leaves a match (not started).
   */
  PARTY_PLAYERS_UPDATED = "PARTY_PLAYERS_UPDATED",

  /**
   * Fired when a player places a card on the board.
   *
   * Synchronizes the next turn with the client.
   */
  PLAYER_MOVEMENT = "PLAYER_MOVEMENT",

  /**
   * Fired when a player loses its turn (didn't place a card in time).
   * This event is fired automatically by the server.
   *
   * Synchronizes the next turn with the client.
   */
  TURN_TIMEOUT = "TURN_TIMEOUT",

  /**
   * Fired when a party owner creates/starts a new match.
   */
  PARTY_NEW_MATCH = "PARTY_NEW_MATCH",

  /**
   * Fires when the party owner finishes the party.
   */
  PARTY_FINISHED = "PARTY_FINISHED",

  /**
   * Fires when the match finishes under any of the following conditions:
   * 1. When a team wins the match.                                (winner === TeamI)
   * 2. When no movements are left and the match is a draw.        (winner === null)
   * 3. When the match is stale (no movements in $MAX_MATCH_TIME_SECONDS). (winner === null)
   */
  MATCH_FINISHED = "MATCH_FINISHED",
}

export interface ServerToClientEvents {
  [ServerToClientEvent.PARTY_JOIN](partyJoinStatus: PartyJoinStatus): void;
  [ServerToClientEvent.PARTY_STATE](
    boardState: BoardState,
    matchPlayerHand: MatchPlayerHand,
    currentTurn: MatchCurrentTurn,
    matchWinner: TeamI | null
  ): void;
  [ServerToClientEvent.PARTY_CONFIG_UPDATED](matchConfig: MatchConfig): void;
  [ServerToClientEvent.PARTY_PLAYERS_UPDATED](
    matchPlayers: MatchPlayer[]
  ): void;
  [ServerToClientEvent.PLAYER_MOVEMENT](
    movement: LastMovement,
    currentTurn: MatchCurrentTurn
  ): void;
  [ServerToClientEvent.TURN_TIMEOUT](nextTurn: MatchCurrentTurn): void;
  [ServerToClientEvent.PARTY_FINISHED](): void;
  [ServerToClientEvent.PARTY_NEW_MATCH](
    partyNewMatchMode: PartyNewMatchMode
  ): void;
  [ServerToClientEvent.MATCH_FINISHED](winner: TeamI | null): void;
}

export enum ClientToServerEvent {
  MOVEMENT = "MOVEMENT",

  // Owner only 👇

  START_GAME = "START_GAME",
  MOVE_PLAYER_TO_TEAM = "MOVE_PLAYER_TO_TEAM",

  /**
   * Fired when (after a match ends) the **party** owner starts a new match.
   */
  NEW_MATCH = "NEW_MATCH",
}
export interface ClientToServerEvents {
  [ClientToServerEvent.MOVEMENT](
    movement: Movement,
    callback: (response: MovementResponse) => void
  ): void;

  [ClientToServerEvent.START_GAME](
    callback: (
      success: boolean,
      reason: MatchCouldNotStartReason | null
    ) => void
  ): void;
  [ClientToServerEvent.MOVE_PLAYER_TO_TEAM](
    playerId: string,
    team: TeamI
  ): void;
  [ClientToServerEvent.NEW_MATCH](
    partyNewMatchMode: PartyNewMatchMode,
    callback: (
      success: boolean,
      reason: NewMatchCouldNotStartReason | null
    ) => void
  ): void;
}

export interface InterServerEvents {}

export interface SocketData {
  /**
   * A player _can_ be in only one match at a time.
   */
  matchCode: string | null;

  /**
   * Static information about the player. Is maintained across matches.
   */
  playerId: string;
}
