import { Match, MatchPlayer, MatchJoinStatus } from "@/interfaces/match";
import { Player, PlayerHand, buildBoard } from "game-logic";

const codeToMatch = {} as Record<Match["code"], Match>;

export const createMatch = (owner: MatchPlayer) => {
  const match: Match = {
    code: generateMatchCode(),
    started: false,
    owner: owner,
    players: [owner],
    matchState: null,
  };

  return match;
};

export const getMatchByCode = (code: string) => {
  return codeToMatch[code] ?? null;
};

export const startMatch = (matchCode: string) => {
  const match = getMatchByCode(matchCode);

  if (!match) {
    return null;
  }

  const playersHands = {} as Record<string, PlayerHand>;
  for (const player of match.players) {
    playersHands[player.id] = {
      cards: [],
    };
  }

  match.started = true;
  match.matchState = {
    boardState: buildBoard(),
    playerHands: playersHands,
    nextCard: null,
    cardsDeck: [],
  };

  return match;
};

export const getMatchPlayer = (matchCode: string, playerId: string) => {
  const match = getMatchByCode(matchCode);

  if (!match) {
    return null;
  }

  return match.players.find((p) => p.id === playerId) ?? null;
};

export const joinMatch = (matchCode: string, player: Player) => {
  const match = getMatchByCode(matchCode);

  if (!match) {
    return MatchJoinStatus.MATCH_NOT_FOUND;
  }

  if (match.started) {
    const matchPlayer = getMatchPlayer(matchCode, player.id);

    if (!matchPlayer) {
      return MatchJoinStatus.MATCH_STARTED;
    }
  }

  if (Object.keys(match.players).length < 12 - 1) {
    match.players.push({ ...player, isOwner: false });
    return MatchJoinStatus.SUCCESS;
  }

  return MatchJoinStatus.MATCH_FULL;
};

// Utilities below 👇

const generateMatchCode = () => {
  const rand = Math.random() + 1; // to avoid 0

  return "P-" + rand.toString(36).substring(2, 6).toLocaleUpperCase(); // e.g P-PZB2
};
