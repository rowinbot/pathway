import { MatchCouldNotStartReason } from "game-logic/realtime";

export const matchCouldNotStartReasonText: Record<
  MatchCouldNotStartReason,
  string
> = {
  [MatchCouldNotStartReason.invalidLayout]:
    "You need at least 2 players to play and every team must have the same number of players.",
  [MatchCouldNotStartReason.notOwner]: "You are not the owner of this match.",
};
