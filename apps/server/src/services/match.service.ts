import { Match, MatchPlayer, MatchJoinStatus } from "@/interfaces/match";
import {
  type Movement,
  type Player,
  type MatchPlayerHand,
  buildBoard,
  getMatchPlayerCardIndexForPositionInBoard,
  CardNumber,
  DEFAULT_ROOM_CONFIG,
  getNextMatchTurnPlayerId,
  getMatchTeams,
  MatchTeamI,
  Card,
  CARDS_PER_PLAYER,
  getCardsShuffled,
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

export function testAndApplyMatchPlayerMovement(
  matchCode: string,
  playerId: string,
  movement: Movement
): {
  isMovementValid: boolean;
  card: Card | null;
  nextCard: Card | null;
} {
  const matchState = getMatchByCode(matchCode)?.matchState;
  if (!matchState)
    return {
      isMovementValid: false,
      card: null,
      nextCard: null,
    };

  const matchPlayer = getMatchPlayer(matchCode, playerId)!;
  const playerHand = matchState.playerHands[playerId];

  const matchingCardI = getMatchPlayerCardIndexForPositionInBoard(
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
      card: null,
      nextCard: null,
    };

  const card = playerHand.cards[matchingCardI];

  // Remove card from player's hand
  playerHand.cards.splice(matchingCardI, 1);

  // Add another card to player's hand
  const nextCard = matchState.cardsDeck.pop() ?? null;

  if (nextCard) {
    playerHand.cards.push(nextCard);
  }

  // Add card to board
  matchState.boardState[movement.row][movement.col] =
    card.number === CardNumber.SingleJack ? null : matchPlayer.team;

  return {
    isMovementValid: true,
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
  const playersHands = {} as Record<string, MatchPlayerHand>;

  for (const player of match.players) {
    const cards: Card[] = [];

    for (let i = 0; i < CARDS_PER_PLAYER; i++) {
      cards.push(cardsDeck.pop()!);
    }

    console.log(player.id, cardsDeck[cardsDeck.length - 1]);

    playersHands[player.id] = {
      cards,
    };
  }

  match.started = true;
  match.matchState = {
    boardState: buildBoard(),
    playerHands: playersHands,
    cardsDeck,
    currentTurn: {
      turnStartTime: Date.now(),
      turnPlayerId: match.players[0].id,
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
    console.log(match.players);
    return MatchJoinStatus.SUCCESS;
  }

  return MatchJoinStatus.MATCH_FULL;
}

/**
 * Creates a new match player object.
 * If match is provided, it will assign the player to the team with the fewest players.
 * When match is not provided, the player is taken as the owner and assigned to `MatchTeamI.One`.
 */
export function newMatchPlayerObj(player: Player, match?: Match): MatchPlayer {
  const matchPlayer = {
    ...player,
    isOwner: false,
    isConnected: false,
    team: MatchTeamI.One,
  };

  console.log(player, match);

  if (!match) {
    matchPlayer.isOwner = true;
    return matchPlayer;
  }

  const teams = getMatchTeams(match.players);

  for (let i = 0; i < teams.length; i++) {
    const team = teams[i];
    const fewestPlayersTeam = teams[matchPlayer.team];

    console.log(team.length, fewestPlayersTeam.length);

    if (team.length < fewestPlayersTeam.length) {
      matchPlayer.team = i;
    }
  }

  console.log(matchPlayer);

  return matchPlayer;
}

// Utilities below 👇

function generateMatchCode() {
  const rand = Math.random() + 1; // to avoid 0

  return "P-" + rand.toString(36).substring(2, 6).toLocaleUpperCase(); // e.g P-PZB2
}
