import { TeamI } from "./team";
import { TupleMatrix } from "./types";

type MaybeTeamI = TeamI | null;
type BoardPositionState = { team: MaybeTeamI; isPartOfASequence: boolean };
export type BoardState = TupleMatrix<TupleMatrix<BoardPositionState, 10>, 10>;

export const BOARD_SIZE = 10;
export const HALF_BOARD = BOARD_SIZE / 2;

export interface BoardPosition {
  row: number;
  col: number;
}

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
