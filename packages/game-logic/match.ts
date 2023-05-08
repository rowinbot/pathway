import { BoardState } from "./board";
import {
  BlackCardKind,
  Card,
  CardNumber,
  RedCardKind,
  card,
  getCards,
  staticBoardRows,
} from "./cards";
import { Player } from "./player";

export interface Match {
  code: string;
  started: boolean;
  owner: MatchPlayer;
  players: MatchPlayer[];
  config: MatchConfig;

  /**
   * State of the match.
   * **Initialized** when match starts.
   */
  matchState: MatchState | null;
}

/**
 * These number of teams is pretty much static and will not change.
 * They're bound to the max number of players.
 *
 * Possible combinations:
 * - 1 * 1      (2 players)
 * - 1 * 1 * 1  (3 players)
 * - 2 * 2      (4 players)
 * - 3 * 3      (6 players)
 * - 2 * 2 * 2  (6 players)
 * - 4 * 4      (8 players)
 * - 3 * 3 * 3, (9 players)
 * - 4 * 4 * 4  (12 players)
 */
export enum MatchTeamI {
  One = 0,
  Two = 1,
  Three = 2,
}

export interface MatchPlayer extends Player {
  team: MatchTeamI;
  isOwner: boolean;

  /**
   * Whether the player is connected to the match (socket).
   */
  isConnected: boolean;
}

export interface MatchConfig {
  turnTimeLimit: number;
  maxPlayers: number;
}

export interface MatchState {
  currentTurn: MatchCurrentTurn;
  boardState: BoardState;
  playerHands: Record<string, MatchPlayerHand>;
  cardsDeck: Card[];
}

export interface MatchCurrentTurn {
  turnStartTime: number;
  turnPlayerId: string;
}

export interface MatchPlayerHand {
  cards: Card[];
}

export enum MatchJoinStatus {
  SUCCESS = "success", // Player joined successfully if 1. match isn't full and 2. re-joining already started match.

  // Errors below 👇
  MATCH_NOT_FOUND = "match-not-found",
  MATCH_FULL = "match-full",
  MATCH_STARTED = "match-started", // Player tried joined after match started and wasn't part of it before it started (not a re-join).
}

export interface Movement {
  playerId: string;
  card: Card;
  row: number;
  col: number;
}

export interface MatchTeam {
  name: string;
  players: MatchPlayer[];
}

// Utilities below 👇

const MATCH_CODE_REGEX = /^P-[0-9a-zA-Z]{0,4}$/;

export const DEFAULT_ROOM_CONFIG = {
  turnTimeLimit: 30,
  maxPlayers: 4,
};

export const CARDS_PER_PLAYER = 7;

export function isMatchCodeValid(code: string): boolean {
  return MATCH_CODE_REGEX.test(code);
}

export function testMovementWithMatchPlayerHand(
  boardState: BoardState,
  playerHand: MatchPlayerHand,
  card: Card,
  col: number,
  row: number
): boolean {
  const cardAtPos = staticBoardRows[row][col];
  const isEmptyCard = typeof cardAtPos === "symbol";

  // Ignore movements to blank cards - blank corners
  if (isEmptyCard) return false;

  const playerHasCard = playerHand.cards.some((card) => card.id === card.id);

  // If player doesn't have the card being played, ignore the movement
  if (!playerHasCard) return false;

  // The card being played is the same as the one in the position and the position is free
  const isValidCardForPos =
    cardAtPos.id === card.id && boardState[row][col] === null;

  // There's NOT a card in the position and DoubleJack (wildcard) is being played
  const isDoubleJackAndValid =
    cardAtPos.number === CardNumber.DoubleJack && boardState[row][col] === null;

  // There IS a card in the position and SingleJack (remove wildcard) is being played
  const isSingleJackAndValid =
    cardAtPos.number === CardNumber.SingleJack && boardState[row][col] !== null;

  return isValidCardForPos || isDoubleJackAndValid || isSingleJackAndValid;
}

export function getNextMatchTurnPlayerId(
  playerIds: string[],
  currentTurnPlayerId: string
) {
  const currentTurnPlayerIdI = playerIds.indexOf(currentTurnPlayerId);

  return playerIds[currentTurnPlayerIdI % playerIds.length];
}

export function getMatchTeams(matchPlayers: MatchPlayer[]) {
  const teams: [MatchPlayer[], MatchPlayer[], MatchPlayer[]] = [[], [], []];

  for (const player of matchPlayers) {
    teams[player.team].push(player);
  }

  return teams;
}

/**
 * Tests if the teams layout is valid based on the number of players per team.
 */
export function testTeamsLayout(matchPlayers: MatchPlayer[]) {
  const teams = getMatchTeams(matchPlayers);

  let teamsWithPlayers = 0;

  for (const team of teams) {
    if (team.length > 0) {
      teamsWithPlayers++;
    }
  }

  // The game requires at least two teams with players
  if (teamsWithPlayers < 2) return false;

  // Two teams combinations
  if (
    teamsWithPlayers === 2 &&
    teams[MatchTeamI.One].length >= 1 &&
    teams[MatchTeamI.One].length <= 4 &&
    teams[MatchTeamI.One].length === teams[MatchTeamI.Two].length
  ) {
    return true;
  }

  // Three teams combinations
  if (
    teamsWithPlayers === 3 &&
    teams[MatchTeamI.One].length >= 1 &&
    teams[MatchTeamI.One].length <= 4 &&
    teams[MatchTeamI.One].length === teams[MatchTeamI.Two].length &&
    teams[MatchTeamI.One].length === teams[MatchTeamI.Three].length
  ) {
    return true;
  }
}

export function getMatchTeamName(teamI: MatchTeamI) {
  switch (teamI) {
    case MatchTeamI.One:
      return "Team Blue";
    case MatchTeamI.Two:
      return "Team Red";
    case MatchTeamI.Three:
      return "Team Green";
  }
}

export function getCardsShuffled(): Card[] {
  const cards = getCards();

  return cards.sort(() => Math.random() - 0.5);
}
