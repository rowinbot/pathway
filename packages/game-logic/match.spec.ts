import { describe, expect, it } from "vitest";
import { buildBoard } from "./board";
import { TeamI } from "./team";
import {
  testNewSequencesForMovement,
  updateBoardStateFromNewSequences,
} from "./match";

const FriendTeam = TeamI.One;
const FoeTeam = TeamI.Two;

describe("finds new sequences from movement", () => {
  it("horizontal - top-left corner", async () => {
    const boardState = buildBoard();
    const team = FriendTeam;

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

  it("4 tokens on each side build two sequences", async () => {
    const boardState = buildBoard();
    const team = FriendTeam;

    const row = 1;
    boardState[row][0] = { team, isPartOfASequence: false };
    boardState[row][1] = { team, isPartOfASequence: false };
    boardState[row][2] = { team, isPartOfASequence: false };
    boardState[row][3] = { team, isPartOfASequence: false };

    boardState[row][5] = { team, isPartOfASequence: false };
    boardState[row][6] = { team, isPartOfASequence: false };
    boardState[row][7] = { team, isPartOfASequence: false };
    boardState[row][8] = { team, isPartOfASequence: false };

    const newSequenceBounds = testNewSequencesForMovement(
      boardState,
      row,
      4,
      team
    );

    expect(newSequenceBounds).toHaveLength(1);
    expect(newSequenceBounds[0].sequencesCount).toEqual(2);
  });

  it("only highlights 5 positions when creating a sequence with 6 valid positions", async () => {
    const boardState = buildBoard();
    const team = FriendTeam;

    const row = 1;
    boardState[row][0] = { team, isPartOfASequence: false };
    boardState[row][1] = { team, isPartOfASequence: false };
    boardState[row][2] = { team, isPartOfASequence: false };
    boardState[row][3] = { team, isPartOfASequence: false };

    boardState[row][5] = { team, isPartOfASequence: false };

    const newSequenceBounds = testNewSequencesForMovement(
      boardState,
      row,
      4,
      team
    );

    expect(newSequenceBounds[0].endCol - newSequenceBounds[0].startCol).toEqual(
      4
    );
  });
});

describe("finds new sequences from movement - edge cases", () => {
  it("does not add new sequences with 3 cards, empty spaces and existing 4 cards sequence", async () => {
    const boardState = buildBoard();
    const team = FriendTeam;

    boardState[1][1] = { team, isPartOfASequence: true };
    boardState[2][2] = { team, isPartOfASequence: true };
    boardState[3][3] = { team, isPartOfASequence: true };
    boardState[4][4] = { team, isPartOfASequence: true };
    boardState[5][5] = { team, isPartOfASequence: false };
    boardState[6][6] = { team, isPartOfASequence: false };

    const newSequenceBounds = testNewSequencesForMovement(
      boardState,
      7,
      7,
      team
    );

    expect(newSequenceBounds).toHaveLength(0);
  });

  it("adds new sequences with 3 cards, empty spaces and existing in the middle sequence", async () => {
    const boardState = buildBoard();
    const team = FriendTeam;

    const col = 0;

    boardState[1][col] = { team, isPartOfASequence: false };
    boardState[2][col] = { team, isPartOfASequence: false };
    boardState[3][col] = { team, isPartOfASequence: true };
    boardState[4][col] = { team, isPartOfASequence: true };
    boardState[5][col] = { team, isPartOfASequence: true };
    boardState[6][col] = { team, isPartOfASequence: true };
    boardState[7][col] = { team, isPartOfASequence: true };

    const newSequenceBounds = testNewSequencesForMovement(
      boardState,
      8,
      col,
      team
    );

    expect(newSequenceBounds).toHaveLength(1);
  });

  it("does not add new sequences from another team's sequences", async () => {
    const boardState = buildBoard();
    const row = 2;

    boardState[row][0] = { team: FriendTeam, isPartOfASequence: false };

    boardState[row][1] = { team: FoeTeam, isPartOfASequence: true };
    boardState[row][2] = { team: FoeTeam, isPartOfASequence: true };
    boardState[row][3] = { team: FoeTeam, isPartOfASequence: true };
    boardState[row][4] = { team: FoeTeam, isPartOfASequence: true };
    boardState[row][5] = { team: FoeTeam, isPartOfASequence: true };

    boardState[row][6] = { team: FriendTeam, isPartOfASequence: false };
    boardState[row][7] = { team: FriendTeam, isPartOfASequence: false };

    const newSequenceBounds = testNewSequencesForMovement(
      boardState,
      row,
      8,
      FriendTeam
    );

    expect(newSequenceBounds).toHaveLength(0);
  });

  it("adds new sequences with empty spaces and existing sequence", async () => {
    const boardState = buildBoard();
    const team = FriendTeam;

    boardState[1][1] = { team, isPartOfASequence: true };
    boardState[2][2] = { team, isPartOfASequence: true };
    boardState[3][3] = { team, isPartOfASequence: true };
    boardState[4][4] = { team, isPartOfASequence: true };
    boardState[5][5] = { team, isPartOfASequence: false };
    boardState[6][6] = { team, isPartOfASequence: false };
    boardState[7][7] = { team, isPartOfASequence: false };

    const newSequenceBounds = testNewSequencesForMovement(
      boardState,
      8,
      8,
      team
    );

    expect(newSequenceBounds).toHaveLength(1);
  });

  it("adds new sequences with empty spaces", async () => {
    const boardState = buildBoard();
    const team = FriendTeam;

    boardState[1][1] = { team, isPartOfASequence: false };
    boardState[2][2] = { team, isPartOfASequence: false };
    boardState[3][3] = { team, isPartOfASequence: false };

    const newSequenceBounds = testNewSequencesForMovement(
      boardState,
      4,
      4,
      team
    );

    expect(newSequenceBounds).toHaveLength(1);
  });

  it("unable to create sequence when other teams play in the middle", async () => {
    const boardState = buildBoard();

    const row = 3;
    boardState[row][0] = { team: FriendTeam, isPartOfASequence: false };
    boardState[row][1] = { team: FriendTeam, isPartOfASequence: false };
    boardState[row][2] = { team: FriendTeam, isPartOfASequence: false };
    boardState[row][3] = { team: FriendTeam, isPartOfASequence: false };
    boardState[row][4] = { team: FoeTeam, isPartOfASequence: true };

    const newSequenceBounds = testNewSequencesForMovement(
      boardState,
      row,
      5,
      FriendTeam
    );

    expect(newSequenceBounds).toHaveLength(0);
  });

  it("backwards - uses empty spaces to create new sequences and keeps one card", async () => {
    const boardState = buildBoard();
    const team = FriendTeam;

    boardState[2][2] = { team, isPartOfASequence: false };
    boardState[3][3] = { team, isPartOfASequence: false };
    boardState[4][4] = { team, isPartOfASequence: false };
    boardState[5][5] = { team, isPartOfASequence: false };

    const newSequenceBounds = testNewSequencesForMovement(
      boardState,
      1,
      1,
      team
    );

    expect(newSequenceBounds[0].endRow).toEqual(4);
    expect(newSequenceBounds[0].endCol).toEqual(4);
  });

  it("frontward - uses empty spaces to create new sequences and keeps one card", async () => {
    const boardState = buildBoard();
    const team = FriendTeam;

    const row = 9;
    boardState[row][4] = { team, isPartOfASequence: false };
    boardState[row][5] = { team, isPartOfASequence: false };
    boardState[row][6] = { team, isPartOfASequence: false };
    boardState[row][7] = { team, isPartOfASequence: false };

    const newSequenceBounds = testNewSequencesForMovement(
      boardState,
      row,
      8,
      team
    );

    expect(newSequenceBounds[0].startCol).toEqual(5);
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
