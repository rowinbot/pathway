import { describe, expect, it } from "vitest";
import { buildBoard } from "./board";
import { TeamI } from "./team";
import {
  testNewSequencesForMovement,
  updateBoardStateFromNewSequences,
} from "./match";

describe("finds new sequences from movement", () => {
  it("horizontal - top-left corner", async () => {
    const boardState = buildBoard();
    const team = TeamI.One;

    boardState[0][4] = { team, isPartOfASequence: false };
    boardState[1][4] = { team, isPartOfASequence: false };
    boardState[2][4] = { team, isPartOfASequence: false };
    boardState[3][4] = { team, isPartOfASequence: false };

    boardState[5][4] = { team, isPartOfASequence: false };
    boardState[6][4] = { team, isPartOfASequence: false };
    boardState[7][4] = { team, isPartOfASequence: false };
    boardState[8][4] = { team, isPartOfASequence: false };

    boardState[4][0] = { team, isPartOfASequence: false };
    boardState[4][1] = { team, isPartOfASequence: false };
    boardState[4][2] = { team, isPartOfASequence: false };
    boardState[4][3] = { team, isPartOfASequence: false };

    boardState[4][5] = { team, isPartOfASequence: false };
    boardState[4][6] = { team, isPartOfASequence: false };
    boardState[4][7] = { team, isPartOfASequence: false };
    boardState[4][8] = { team, isPartOfASequence: false };

    const newSequenceBounds = testNewSequencesForMovement(
      boardState,
      4,
      4,
      team
    );

    expect(newSequenceBounds).toHaveLength(2);
  });
});

describe("updates board state from new sequence bounds", () => {
  it("horizontal - bottom-left corner", async () => {
    const boardState = buildBoard();
    const row = 9;
    updateBoardStateFromNewSequences(boardState, [
      {
        sequencesCount: 1,
        startCol: 0,
        startRow: row,
        endCol: 4,
        endRow: row,
      },
    ]);

    expect(boardState[row][0].isPartOfASequence).toBe(true);
    expect(boardState[row][1].isPartOfASequence).toBe(true);
    expect(boardState[row][2].isPartOfASequence).toBe(true);
    expect(boardState[row][3].isPartOfASequence).toBe(true);
    expect(boardState[row][4].isPartOfASequence).toBe(true);
    expect(boardState[row][5].isPartOfASequence).toBe(false);
  });

  it("vertical - bottom-left corner", async () => {
    const boardState = buildBoard();
    const col = 9;
    updateBoardStateFromNewSequences(boardState, [
      {
        sequencesCount: 1,
        startCol: col,
        startRow: 9,
        endCol: col,
        endRow: 5,
      },
    ]);

    expect(boardState[9][col].isPartOfASequence).toBe(true);
    expect(boardState[8][col].isPartOfASequence).toBe(true);
    expect(boardState[7][col].isPartOfASequence).toBe(true);
    expect(boardState[6][col].isPartOfASequence).toBe(true);
    expect(boardState[5][col].isPartOfASequence).toBe(true);
    expect(boardState[4][col].isPartOfASequence).toBe(false);
  });
});
