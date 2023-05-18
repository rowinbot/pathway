import { Player } from "./player";

/**
 * The teams are represented by a number, which is the index of the team in the teams array.
 */
export enum TeamI {
  One = 0,
  Two = 1,
  Three = 2,
}

export interface TeamPlayer extends Player {
  team: TeamI;
}

export function getTeamsPlayers<T extends TeamPlayer>(players: T[]) {
  const teams: T[][] = [[], [], []];

  for (const player of players) {
    teams[player.team].push(player);
  }

  return teams;
}
/**
 * Tests if the teams layout is valid based on the number of players per team.
 */
export function testTeamsLayout(players: TeamPlayer[]) {
  const teams = getTeamsPlayers(players);

  let teamsWithPlayers = 0;

  for (const team of Object.values(teams)) {
    if (team.length > 0) {
      teamsWithPlayers++;
    }
  }

  // The game requires at least two teams with players
  if (teamsWithPlayers < 2) return false;

  // Two teams combinations
  if (
    teamsWithPlayers === 2 &&
    teams[TeamI.One].length >= 1 &&
    teams[TeamI.One].length <= 4 &&
    teams[TeamI.One].length === teams[TeamI.Two].length
  ) {
    return true;
  }

  // Three teams combinations
  if (
    teamsWithPlayers === 3 &&
    teams[TeamI.One].length >= 1 &&
    teams[TeamI.One].length <= 4 &&
    teams[TeamI.One].length === teams[TeamI.Two].length &&
    teams[TeamI.One].length === teams[TeamI.Three].length
  ) {
    return true;
  }
}
