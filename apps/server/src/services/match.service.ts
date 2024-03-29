import { Match, MatchPlayer, partyJoinStatus } from "@/interfaces/match";
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
  updateTeamSequencesCountFromNewSequenceBounds,
  updatePlayersPositionsBasedOnTeams,
} from "game-logic";
import { getPlayer } from "./player.service";

const codeToMatch = {} as Record<Match["code"], Match>;

export function createMatch(owner: MatchPlayer) {
  const match: Match = {
    code: generateMatchCode(),
    started: false,
    owner: owner,
    players: [owner],
    matchState: null,
    winner: null,
    config: { ...DEFAULT_ROOM_CONFIG },
  };

  codeToMatch[match.code] = match;

  return match;
}

export function setMatchWinner(matchCode: string, winner: TeamI | null) {
  const match = getMatchByCode(matchCode);
  if (!match) return;

  match.winner = winner;
  return match;
}

export function deleteMatch(code: string) {
  delete codeToMatch[code];
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
  const match = getMatchByCode(matchCode);
  const matchState = match?.matchState;

  if (!matchState || match.winner !== null)
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

  const oneEyedJack = cardNumber(card) === CardNumber.SingleJack;
  const newSequences = oneEyedJack
    ? []
    : testNewSequencesForMovement(
        matchState.boardState,
        movement.row,
        movement.col,
        matchPlayer.team
      );

  const formedANewSequence = newSequences.length > 0;

  // Add card to board
  matchState.boardState[movement.row][movement.col] = {
    team: oneEyedJack ? null : matchPlayer.team,
    isPartOfASequence: formedANewSequence,
  };

  updateBoardStateFromNewSequences(matchState.boardState, newSequences);
  updateTeamSequencesCountFromNewSequenceBounds(
    matchState.teamSequenceCount,
    matchPlayer.team,
    newSequences
  );

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

  match.players = updatePlayersPositionsBasedOnTeams(match.players);
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

export function getMatchPlayer(matchCode: string, playerId: string) {
  const match = getMatchByCode(matchCode);

  if (!match) {
    return null;
  }

  const player = getPlayer(playerId);

  for (let i = 0; i < match.players.length; i++) {
    // Make sure that the nickname is up-to-date
    if (match.players[i].id === playerId) {
      match.players[i] = {
        ...match.players[i],
        nickname: player?.nickname ?? match.players[i].nickname,
      };

      return match.players[i];
    }
  }

  return null;
}

export function movePlayerToTeam(
  matchCode: string,
  playerId: string,
  team: TeamI
) {
  const match = getMatchByCode(matchCode);

  if (!match) {
    return null;
  }

  const matchPlayer = getMatchPlayer(matchCode, playerId);

  if (!matchPlayer) {
    return null;
  }

  matchPlayer.team = team;
}

// Utilities below 👇

function generateMatchCode() {
  const rand = Math.random() + 1; // to avoid 0

  return "M-" + rand.toString(36).substring(2, 6).toLocaleUpperCase(); // e.g P-PZB2
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
