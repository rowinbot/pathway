import { TupleMatrix } from "./types";

export type BoardState = TupleMatrix<TupleMatrix<boolean, 10>, 10>;

export function buildBoard() {
  const board: boolean[][] = [];

  for (let i = 0; i < 10; i++) {
    const row: boolean[] = [];

    for (let j = 0; j < 10; j++) {
      row[j] = false;
    }

    board[i] = row;
  }

  return board as BoardState;
}
