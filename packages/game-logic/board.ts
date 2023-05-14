import { MatchTeamI } from "./match";
import { TupleMatrix } from "./types";

type MaybeMatchTeamI = MatchTeamI | null;
type BoardPositionState = { team: MaybeMatchTeamI; isPartOfASequence: boolean };
export type BoardState = TupleMatrix<TupleMatrix<BoardPositionState, 10>, 10>;

export function buildBoard() {
  const board: BoardPositionState[][] = [];

  for (let i = 0; i < 10; i++) {
    const row: BoardPositionState[] = [];

    for (let j = 0; j < 10; j++) {
      row[j] = { team: null, isPartOfASequence: false };
    }

    board[i] = row;
  }

  return board as BoardState;
}
