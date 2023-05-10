import { MatchTeamI } from "game-logic";

export function getMatchTeamName(teamI: MatchTeamI) {
  switch (teamI) {
    case MatchTeamI.One:
      return "Team Red";
    case MatchTeamI.Two:
      return "Team Blue";
    case MatchTeamI.Three:
      return "Team Green";
  }
}

export function teamCardHighlightColor(team: MatchTeamI | null) {
  switch (team) {
    case MatchTeamI.One:
      return "#fff";
    case MatchTeamI.Two:
      return "#fff";
    case MatchTeamI.Three:
      return "#fff";
    default:
      return "#fff";
  }
}

export function teamHeaderColor(team: MatchTeamI) {
  switch (team) {
    case MatchTeamI.One:
      return "#A00";
    case MatchTeamI.Two:
      return "#00f";
    case MatchTeamI.Three:
      return "#080";
  }
}

export function teamTokenColor(team: MatchTeamI) {
  switch (team) {
    case MatchTeamI.One:
      return "#A00";
    case MatchTeamI.Two:
      return "#00f";
    case MatchTeamI.Three:
      return "#0f0";
  }
}
