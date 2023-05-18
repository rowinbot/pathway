import { Match, MatchPlayer, MatchJoinStatus } from "@/interfaces/match";
import type {
  Movement,
  Player,
  MatchPlayerHand,
  NewSequenceBounds,
  Card,
  MatchState,
} from "game-logic";
import {
  buildBoard,
  getMatchingHandCardIndexToPositionInBoard,
  CardNumber,
  DEFAULT_ROOM_CONFIG,
  getNextMatchTurnPlayerId,
  getMatchTeamsPlayers,
  TeamI,
  CARDS_PER_PLAYER,
  getCardsShuffled,
  cardIsJack,
  staticBoardRows,
  cardNumber,
  testNewSequencesForMovement,
  updateBoardStateFromNewSequences,
} from "game-logic";

const codeToMatch = {} as Record<Match["code"], Match>;

export function createMatch(owner: MatchPlayer) {
  const match: Match = {
    code: generateMatchCode(),
    started: false,
    owner: owner,
    players: [owner],
    matchState: null,
    config: { ...DEFAULT_ROOM_CONFIG },
  };

  codeToMatch[match.code] = match;

  return match;
}

export function deleteMatch(code: string) {
  delete codeToMatch[code];
}

function getNextCardInDeck(
  matchState: MatchState,
  player: MatchPlayer
): Card | null {
  const nextCard = matchState.cardsDeck.pop();

  if (!nextCard) {
    return null;
  }

  if (cardIsJack(nextCard)) {
    return nextCard;
  }

  for (let row = 0; row < staticBoardRows.length; row++) {
    const rowCols = staticBoardRows[row];

    for (let col = 0; col < rowCols.length; col++) {
      const cardAtPos = rowCols[col];
      const isPositionFree = matchState.boardState[row][col].team === null;

      if (typeof cardAtPos === "symbol") continue;
      else if (isPositionFree && cardAtPos.id === nextCard.id) return nextCard;
    }
  }

  return getNextCardInDeck(matchState, player);
}

export function testAndApplyMatchPlayerMovement(
  matchCode: string,
  playerId: string,
  movement: Movement
): {
  isMovementValid: boolean;
  newSequences: NewSequenceBounds[];
  card: Card | null;
  nextCard: Card | null;
} {
  const matchState = getMatchByCode(matchCode)?.matchState;
  if (!matchState)
    return {
      isMovementValid: false,
      newSequences: [],
      card: null,
      nextCard: null,
    };

  const matchPlayer = getMatchPlayer(matchCode, playerId)!;
  const playerHand = matchState.playerHands[playerId];

  if (matchState.currentTurn.turnPlayerId !== playerId)
    // Not their turn
    return {
      isMovementValid: false,
      newSequences: [],
      card: null,
      nextCard: null,
    };

  const matchingCardI = getMatchingHandCardIndexToPositionInBoard(
    matchState.boardState,
    matchPlayer.team,
    playerHand,
    movement.row,
    movement.col
  );

  if (matchingCardI === null)
    // Invalid movement
    return {
      isMovementValid: false,
      newSequences: [],
      card: null,
      nextCard: null,
    };

  const card = playerHand.cards[matchingCardI];

  // Remove card from player's hand
  playerHand.cards.splice(matchingCardI, 1);

  // Add another card to player's hand
  const nextCard = getNextCardInDeck(matchState, matchPlayer);

  if (nextCard) {
    playerHand.cards.push(nextCard);
  }

  const newSequences = testNewSequencesForMovement(
    matchState.boardState,
    movement.row,
    movement.col,
    matchPlayer.team
  );
  const formedANewSequence = newSequences.length > 0;

  // Add card to board
  matchState.boardState[movement.row][movement.col] = {
    team: cardNumber(card) === CardNumber.SingleJack ? null : matchPlayer.team,
    isPartOfASequence: formedANewSequence,
  };

  updateBoardStateFromNewSequences(matchState.boardState, newSequences);

  return {
    isMovementValid: true,
    newSequences,
    card,
    nextCard,
  };
}

export function nextMatchTurn(code: string) {
  const match = getMatchByCode(code);

  if (!match || !match.matchState) {
    throw new Error(`Couldn't find match with code "${code}"`);
  }

  const nextTurn = {
    turnPlayerId: getNextMatchTurnPlayerId(
      match.players.map((p) => p.id),
      match.matchState.currentTurn.turnPlayerId
    ),
    turnStartTime: Date.now(),
  };

  match.matchState.currentTurn = nextTurn;

  return nextTurn;
}

export function getMatchByCode(code: string): Match | null {
  return codeToMatch[code] ?? null;
}

export function startMatch(matchCode: string): boolean {
  const match = getMatchByCode(matchCode);

  if (!match) {
    return false;
  }

  const cardsDeck = getCardsShuffled();
  const playerHands = {} as Record<string, MatchPlayerHand>;

  for (const player of match.players) {
    const cards: Card[] = [];

    for (let i = 0; i < CARDS_PER_PLAYER; i++) {
      cards.push(cardsDeck.pop()!);
    }

    playerHands[player.id] = {
      cards,
    };
  }

  match.started = true;
  match.matchState = {
    boardState: buildBoard(),
    playerHands,
    cardsDeck,
    currentTurn: {
      turnStartTime: Date.now(),
      turnPlayerId: match.players[0].id,
    },
    teamSequenceCount: {
      [TeamI.One]: 0,
      [TeamI.Two]: 0,
      [TeamI.Three]: 0,
    },
  };

  return true;
}

export function updateMatchPlayerConnected(
  matchCode: string,
  playerId: string,
  isConnected: boolean
) {
  const match = getMatchByCode(matchCode);

  if (!match) {
    return null;
  }

  const matchPlayer = getMatchPlayer(matchCode, playerId);

  if (!matchPlayer) {
    return null;
  }

  if (!match.started && !matchPlayer.isOwner && !isConnected) {
    // Remove player if match hasn't started yet and player is not the owner
    match.players = match.players.filter((p) => p.id !== playerId);
  } else {
    matchPlayer.isConnected = isConnected;
  }
}

export function getMatchPlayer(matchCode: string, playerId: string) {
  const match = getMatchByCode(matchCode);

  if (!match) {
    return null;
  }

  return match.players.find((p) => p.id === playerId) ?? null;
}

export function joinMatch(matchCode: string, player: Player): MatchJoinStatus {
  const match = getMatchByCode(matchCode);

  if (!match) {
    return MatchJoinStatus.MATCH_NOT_FOUND;
  }

  const matchPlayer = getMatchPlayer(matchCode, player.id);

  // Re-join
  if (matchPlayer) {
    return MatchJoinStatus.SUCCESS;
  }

  if (match.started && !matchPlayer) {
    return MatchJoinStatus.MATCH_STARTED;
  }

  if (Object.keys(match.players).length < 12 - 1) {
    match.players.push(newMatchPlayerObj(player, match));
    return MatchJoinStatus.SUCCESS;
  }

  return MatchJoinStatus.MATCH_FULL;
}

/**
 * Creates a new match player object.
 * If match is provided, it will assign the player to the team with the fewest players.
 * When match is not provided, the player is taken as the owner and assigned to `TeamI.One`.
 */
export function newMatchPlayerObj(player: Player, match?: Match): MatchPlayer {
  const matchPlayer = {
    ...player,
    isOwner: false,
    isConnected: false,
    team: TeamI.One,
  };

  if (!match) {
    matchPlayer.isOwner = true;
    return matchPlayer;
  }

  const teams = getMatchTeamsPlayers(match.players);

  for (let i = 0; i < teams.length; i++) {
    const team = teams[i];
    const fewestPlayersTeam = teams[matchPlayer.team];

    if (team.length < fewestPlayersTeam.length) {
      matchPlayer.team = i;
    }
  }

  return matchPlayer;
}

// Utilities below 👇

function generateMatchCode() {
  const rand = Math.random() + 1; // to avoid 0

  return "P-" + rand.toString(36).substring(2, 6).toLocaleUpperCase(); // e.g P-PZB2
}
