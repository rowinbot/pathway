import { TeamI } from "game-logic";

export function getMatchTeamName(teamI: TeamI) {
  switch (teamI) {
    case TeamI.One:
      return "Team Red";
    case TeamI.Two:
      return "Team Blue";
    case TeamI.Three:
      return "Team Green";
  }
}

export function teamCardHighlightColor(team: TeamI | null) {
  switch (team) {
    case TeamI.One:
      return "#fff";
    case TeamI.Two:
      return "#fff";
    case TeamI.Three:
      return "#fff";
    default:
      return "#fff";
  }
}

export function teamTurnHighlightColor(team: TeamI | null) {
  switch (team) {
    case TeamI.One:
      return "#f09999";
    case TeamI.Two:
      return "#9999f0";
    case TeamI.Three:
      return "#99f099";
    default:
      return "#fff";
  }
}

export function teamWinnerBoardColor(team: TeamI | null) {
  switch (team) {
    case TeamI.One:
      return "#ffd9d9";
    case TeamI.Two:
      return "#d9d9ff";
    case TeamI.Three:
      return "#d9ffd9";
    default:
      return "#fff";
  }
}

export function teamHeaderColor(team: TeamI) {
  switch (team) {
    case TeamI.One:
      return "#ff2277";
    case TeamI.Two:
      return "#00f";
    case TeamI.Three:
      return "#080";
  }
}

export function teamTokenColor(team: TeamI) {
  switch (team) {
    case TeamI.One:
      return "#ff2277";
    case TeamI.Two:
      return "#00f";
    case TeamI.Three:
      return "#0f0";
  }
}
