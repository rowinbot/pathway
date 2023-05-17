import { BoardState } from "./board";
import {
  Card,
  CardNumber,
  cardIsJack,
  cardNumber,
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
  turnTimeLimitSeconds: number;
  maxPlayers: number;
}

export interface MatchState {
  currentTurn: MatchCurrentTurn;
  boardState: BoardState;
  playerHands: Record<string, MatchPlayerHand>;
  teamSequenceCount: Record<MatchTeamI, number>;
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
  turnTimeLimitSeconds: 30,
  maxPlayers: 4,
};

export const CARDS_PER_PLAYER = 7;
export const MAX_MATCH_TIME_SECONDS = 60 * 60; // 1 hour

export function isMatchCodeValid(code: string): boolean {
  return MATCH_CODE_REGEX.test(code);
}

export function getMatchingPlayerHandCardIndexForCard(
  playerHand: MatchPlayerHand,
  matchingCard: Card
): number[] {
  let compatibleCardsIndexes: number[] = [];

  for (let i = 0; i < playerHand.cards.length; i++) {
    const card = playerHand.cards[i];

    if (card.id === matchingCard.id) {
      compatibleCardsIndexes.push(i);
    }

    if (cardIsJack(card)) compatibleCardsIndexes.push(i);
  }

  return compatibleCardsIndexes;
}

export function getCardAtPos(row: number, col: number): Card | null {
  const cardAtPos = staticBoardRows[row][col];
  const isEmptyCard = typeof cardAtPos === "symbol";

  // Ignore movements to blank cards - blank corners
  if (isEmptyCard) return null;

  return cardAtPos;
}

export function testHandCardToPositionInBoard(
  boardState: BoardState,
  playerTeam: MatchTeamI,
  playerHandCard: Card,
  row: number,
  col: number
): boolean {
  const cardAtPos = getCardAtPos(row, col);
  if (!cardAtPos) return false;

  const positionState = boardState[row][col].team;
  const isPositionFree = positionState === null;
  const isPositionOccupiedByPlayerTeam = positionState === playerTeam;

  // If player has a card that matches the position and the position is free, pick it.
  if (cardAtPos.id === playerHandCard.id && isPositionFree) {
    return true;
  }

  // Otherwise, store the index of any joker card that matches the position to return it later.
  // But we'll still continue to loop to check for a direct card match.
  else if (
    cardNumber(playerHandCard) === CardNumber.DoubleJack &&
    isPositionFree
  ) {
    return true;
  } else if (
    cardNumber(playerHandCard) === CardNumber.SingleJack &&
    !isPositionFree &&
    !isPositionOccupiedByPlayerTeam
  ) {
    return true;
  }

  return false;
}

export function getMatchingHandCardIndexToPositionInBoard(
  boardState: BoardState,
  playerTeam: MatchTeamI,
  playerHand: MatchPlayerHand,
  row: number,
  col: number,
  ignoreJacks = false
): number | null {
  const cardAtPos = getCardAtPos(row, col);
  if (!cardAtPos) return null;

  const compatibleCardsIndexes = getMatchingPlayerHandCardIndexForCard(
    playerHand,
    cardAtPos
  );

  if (compatibleCardsIndexes.length === 0) return null;

  // Jacks have less priority (< direct card match) for placement, so we want to check entire hand before placing a jack.
  let compatibleJackI: number | null = null;

  for (const i of compatibleCardsIndexes) {
    const playerCard = playerHand.cards[i];

    const matchesCardAtPos = testHandCardToPositionInBoard(
      boardState,
      playerTeam,
      playerCard,
      row,
      col
    );

    if (matchesCardAtPos) {
      if (cardIsJack(playerCard)) {
        if (ignoreJacks) continue;

        compatibleJackI = i;
      } else {
        return i;
      }
    }
  }

  return compatibleJackI;
}

export function getNextMatchTurnPlayerId(
  playerIds: string[],
  currentTurnPlayerId: string
) {
  const currentTurnPlayerIdI = playerIds.indexOf(currentTurnPlayerId);

  return playerIds[(currentTurnPlayerIdI + 1) % playerIds.length];
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

export function getCardsShuffled(): Card[] {
  const cards = getCards();

  return cards.sort(() => Math.random() - 0.5);
}

/**
 * Checks if a team made a sequence by placing a card in a given position.
 * @returns boolean - true if the team made a **new** sequence, false otherwise. This value should be used to set the board position to isPartOfASequence:true.
 */
export function checkNewSequencesForMove(
  boardState: BoardState,
  row: number,
  col: number,
  team: MatchTeamI
): boolean {
  if (boardState[row][col].isPartOfASequence) return false;

  // Start to the right
  let nToSequence = 1; // Card at position can already be part of the sequence
  let nFromPos = 1; // Start looking for sequences to the right of the position
  let direction = 1;

  // Check horizontal sequence
  while (true) {
    const stateAtPos = boardState[row][col + nFromPos * direction];

    const validForNewSequence =
      stateAtPos.team === team && !stateAtPos.isPartOfASequence;

    if (validForNewSequence) {
    }
  }

  return false;
}
