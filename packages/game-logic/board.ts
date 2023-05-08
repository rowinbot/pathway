import { MatchTeamI } from "./match";
import { TupleMatrix } from "./types";

type MaybeMatchTeamI = MatchTeamI | null;
export type BoardState = TupleMatrix<TupleMatrix<MaybeMatchTeamI, 10>, 10>;

export function buildBoard() {
  const board: MaybeMatchTeamI[][] = [];

  for (let i = 0; i < 10; i++) {
    const row: MaybeMatchTeamI[] = [];

    for (let j = 0; j < 10; j++) {
      row[j] = null;
    }

    board[i] = row;
  }

  return board as BoardState;
}
