import { BoardState } from "./board";
import {
  Card,
  CardNumber,
  cardIsJack,
  cardNumber,
  getCards,
  isEmptyCard,
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

export const CARDS_TIL_SEQUENCE = 5;
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

interface NewSequenceBounds {
  startRow: number;
  endRow: number;
  startCol: number;
  endCol: number;
  sequencesCount: number;
}

export function findNewSequenceFromPosition(
  boardState: BoardState,
  row: number,
  col: number,
  team: MatchTeamI,
  getNextPos: (
    row: number,
    col: number,
    goingBackwards: boolean
  ) => [number, number]
): NewSequenceBounds | null {
  if (boardState[row][col].isPartOfASequence) return null;

  let cardsForSequence = 0;

  let sequenceStartRow = row;
  let sequenceStartCol = col;

  let sequenceEndRow = row;
  let sequenceEndCol = col;

  let goingBackwards = true;

  let currentRow = row;
  let currentCol = col;

  while (
    currentRow >= 0 &&
    currentCol >= 0 &&
    currentRow < 10 &&
    currentCol < 10
  ) {
    [currentRow, currentCol] = getNextPos(
      currentRow,
      currentCol,
      goingBackwards
    );

    const stateAtPos = boardState[currentRow][currentCol];
    const cardAtPos = staticBoardRows[currentRow][currentCol];

    const couldCountForSequence =
      isEmptyCard(cardAtPos) || stateAtPos.team === team;

    // If position is filled by team or empty card (intrinsic part of sequence), mark as start of sequence
    if (goingBackwards) {
      if (isEmptyCard(cardAtPos) || stateAtPos.team === team) {
        sequenceStartRow = currentRow;
        sequenceStartCol = currentCol;
      } else {
        goingBackwards = false;
        currentRow = row;
        currentCol = col;
      }
      // going forward :)
    } else {
      if (couldCountForSequence) {
        sequenceEndRow = currentRow;
        sequenceEndCol = currentCol;
      } else {
        // If we're going forward and the card can't count for the sequence, break!
        break;
      }
    }

    if (couldCountForSequence) {
      cardsForSequence++;
    }
  }

  if (CARDS_TIL_SEQUENCE % cardsForSequence === 0) {
    // There might be more than one sequence in the same direction
    const sequencesCount = cardsForSequence / CARDS_TIL_SEQUENCE;

    return {
      startRow: sequenceStartRow,
      startCol: sequenceStartCol,
      endRow: sequenceEndRow,
      endCol: sequenceEndCol,
      sequencesCount,
    };
  }

  return null;
}

export function isNotNull<T>(value: T | null): value is T {
  return value !== null;
}

export function checkNewSequencesForMove(
  boardState: BoardState,
  row: number,
  col: number,
  team: MatchTeamI
): NewSequenceBounds[] {
  const sequences: NewSequenceBounds[] = [];

  if (boardState[row][col].isPartOfASequence) return sequences; // No new sequences if the card is already part of a sequence

  return [
    // Horizontal sequence (top to bottom)
    findNewSequenceFromPosition(
      boardState,
      row,
      col,
      team,
      (row, col, goingBackwards) => [row, col + (goingBackwards ? -1 : 1)]
    ),
    // Vertical sequence (left to right)
    findNewSequenceFromPosition(
      boardState,
      row,
      col,
      team,
      (row, col, goingBackwards) => [row + (goingBackwards ? -1 : 1), col]
    ),
    // Diagonal sequence (top-left to bottom-right)
    findNewSequenceFromPosition(
      boardState,
      row,
      col,
      team,
      (row, col, goingBackwards) => [
        row + (goingBackwards ? -1 : 1),
        col + (goingBackwards ? -1 : 1),
      ]
    ),
    // Diagonal sequence (top-right to bottom-left)
    findNewSequenceFromPosition(
      boardState,
      row,
      col,
      team,
      (row, col, goingBackwards) => [
        row + (goingBackwards ? -1 : 1),
        col + (goingBackwards ? 1 : -1),
      ]
    ),
  ].filter(isNotNull);
}
