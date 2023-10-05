import { Match, MatchPlayer, PartyJoinStatus, Player, TeamI } from "game-logic";
import { Party, PartyNewMatchMode } from "game-logic/party";
import {
  createMatch,
  getMatchByCode,
  getMatchPlayer,
  newMatchPlayerObj,
} from "./match.service";
import { getPlayer } from "./player.service";

const codeToParty = {} as Record<Party["code"], Party>;

export function createParty(owner: Player): Party {
  const match = createMatch({
    ...owner,
    team: TeamI.One,
    isOwner: true,
    isConnected: true,
  });

  const party: Party = {
    code: generatePartyCode(),
    matchesCodes: [match.code],
    ownerPlayerId: owner.id,
    players: [owner],
  };

  codeToParty[party.code] = party;

  return party;
}

export function getPartyByCode(partyCode: string): Party | null {
  return codeToParty[partyCode] ?? null;
}

export function getPartyLastMatchCode(party: Party) {
  return party.matchesCodes[party.matchesCodes.length - 1];
}

export function getPartyLastMatch(partyCode: string): Match | null {
  const party = getPartyByCode(partyCode);
  if (!party) return null;

  return getMatchByCode(getPartyLastMatchCode(party));
}

export function getPartyActiveMatch(partyCode: string): Match | null {
  const lastMatch = getPartyLastMatch(partyCode);

  if (!lastMatch || lastMatch?.winner) return null;

  return lastMatch;
}

export function createNewPartyMatch(
  partyCode: string,
  owner: MatchPlayer,
  mode: PartyNewMatchMode
): Match | null {
  const party = getPartyByCode(partyCode);
  if (!party) return null;

  const activeMatchCode = getPartyLastMatchCode(party);
  const activeMatch = getMatchByCode(activeMatchCode);

  if (!activeMatch) {
    return null;
  }

  const newMatch = createMatch(owner);
  let nextPlayers = [...activeMatch.players];

  if (mode === PartyNewMatchMode.SHUFFLE) {
    nextPlayers = shuffleMatchPlayerTeams(nextPlayers);
  }

  newMatch.players = nextPlayers;
  newMatch.config = { ...activeMatch.config };

  party.matchesCodes.push(newMatch.code);

  return newMatch;
}

export function shuffleMatchPlayerTeams(original: MatchPlayer[]) {
  const array = original.slice();
  let currentIndex = array.length,
    randomIndex;

  // While there remain elements to shuffle.
  while (currentIndex > 0) {
    // Pick a remaining element.
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex--;

    // And swap it with the current element.
    [array[currentIndex].team, array[randomIndex].team] = [
      array[randomIndex].team,
      array[currentIndex].team,
    ];
  }

  return array;
}

export function joinParty(partyCode: string, player: Player): PartyJoinStatus {
  const party = getPartyByCode(partyCode);
  if (!party) return PartyJoinStatus.NOT_FOUND;

  const matchCode = getPartyLastMatchCode(party);
  const match = getMatchByCode(matchCode);

  if (!match) {
    return PartyJoinStatus.NOT_FOUND;
  }

  const matchPlayer = getMatchPlayer(matchCode, player.id);

  // Re-join
  if (matchPlayer) {
    return PartyJoinStatus.SUCCESS;
  }

  if (match.started && !matchPlayer) {
    return PartyJoinStatus.BUSY;
  }

  if (Object.keys(match.players).length < 12 - 1) {
    match.players.push(newMatchPlayerObj(player, match));
    return PartyJoinStatus.SUCCESS;
  }

  return PartyJoinStatus.FULL;
}

export function updatePartyPlayerConnected(
  partyCode: string,
  playerId: string,
  isConnected: boolean
) {
  const player = getPlayer(playerId);
  const party = getPartyByCode(partyCode);
  if (!player || !party) return null;

  party.players = party.players.filter((p) => p.id !== playerId);
  party.players.push(player);

  const activeMatchCode = getPartyLastMatchCode(party);
  const match = getMatchByCode(activeMatchCode);
  if (!match) return null;

  const matchPlayer = getMatchPlayer(activeMatchCode, playerId);

  if (!matchPlayer) return null;

  if (!match.started && !matchPlayer.isOwner && !isConnected) {
    // Remove player if match hasn't started yet and player is not the owner
    match.players = match.players.filter((p) => p.id !== playerId);
  } else {
    matchPlayer.isConnected = isConnected;
  }
}

// Utilities below 👇

function generatePartyCode() {
  const rand = Math.random() + 1; // to avoid 0

  return "P-" + rand.toString(36).substring(2, 6).toLocaleUpperCase(); // e.g P-PZB2
}
