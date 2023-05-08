import { Match, MatchPlayer, MatchJoinStatus } from "@/interfaces/match";
import {
  type Movement,
  type Player,
  type MatchPlayerHand,
  buildBoard,
  testMovementWithMatchPlayerHand,
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

export function testAndApplyMatchPlayerMovement(
  matchCode: string,
  playerId: string,
  movement: Movement
): [boolean, Card | null] {
  let nextCard: Card | null = null;

  const matchState = getMatchByCode(matchCode)?.matchState;
  if (!matchState) return [false, nextCard];

  const isMovementValid = testMovementWithMatchPlayerHand(
    matchState.boardState,
    matchState.playerHands[playerId],
    movement.card,
    movement.row,
    movement.col
  );

  if (!isMovementValid) return [false, nextCard];

  const matchPlayer = getMatchPlayer(matchCode, playerId)!;

  // Remove card from player's hand
  const playerHand = matchState.playerHands[playerId];
  playerHand.cards = playerHand.cards.filter(
    (card) => card.id !== movement.card.id
  );

  // Add another card to player's hand
  if (matchState.cardsDeck.length > 0) {
    let nextCard = matchState.cardsDeck.pop()!;

    if (nextCard) {
      playerHand.cards.push(nextCard);
    }
  }

  // Add card to board
  matchState.boardState[movement.row][movement.col] =
    movement.card.number === CardNumber.SingleJack ? null : matchPlayer.team;

  return [true, nextCard];
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
