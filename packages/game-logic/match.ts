import { BoardState } from "./board";
import { Card } from "./cards";
import { Player } from "./player";
import { TupleMatrix } from "./types";

const MATCH_CODE_REGEX = /^P-[0-9a-zA-Z]{0,4}$/;

export function isMatchCodeValid(code: string): boolean {
  return MATCH_CODE_REGEX.test(code);
}

export interface Match {
  code: string;
  started: boolean;
  owner: MatchPlayer;
  players: MatchPlayer[];

  /**
   * State of the match.
   * **Initialized** when match starts.
   */
  matchState: MatchState | null;
}

export interface MatchState {
  boardState: BoardState;
  playerHands: Record<string, PlayerHand>;
  nextCard: Card | null;
  cardsDeck: Card[];
}

export interface MatchPlayer extends Player {
  isOwner: boolean;
}

export interface PlayerHand {
  cards: Card[];
}

export enum MatchJoinStatus {
  SUCCESS = "success", // Player joined successfully if 1. match isn't full and 2. re-joining already started match.

  // Errors below 👇
  MATCH_NOT_FOUND = "match-not-found",
  MATCH_FULL = "match-full",
  MATCH_STARTED = "match-started", // Player tried joined after match started and wasn't part of it before it started (not a re-join).
}
