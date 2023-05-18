/** @jsxImportSource solid-js */

import { createInputMask, maskArrayToFn } from "@solid-primitives/input-mask";
import { Show, createSignal } from "solid-js";
import { createMatch, joinMatch } from "@/utils/services/match.service";
import { Match, MatchJoinStatus, Player } from "game-logic";

const MATCH_CODE_LENGTH = 6;

interface JoinOrCreateMatchProps {
  player: Player | null;
  onMatchCreated: (match: Match) => void;
  onMatchJoined: (match: Match) => void;
}
export function JoinOrCreateMatch(props: JoinOrCreateMatchProps) {
  const [matchCode, setMatchCode] = createSignal("");

  const matchCodeMask = maskArrayToFn(["P", "-", /[0-9a-zA-Z]{0,4}/i]);
  const matchCodeHandler = createInputMask((v, selection) => {
    const value = matchCodeMask(v.toLocaleUpperCase(), selection);
    setMatchCode(value[0]);

    return value;
  });

  const onSubmit = async () => {
    const joiningMatchCode = matchCode();

    if (joiningMatchCode.length < MATCH_CODE_LENGTH) {
      const match = await createMatch();

      if (!match) {
        alert("Could not create match");
        return;
      }

      props.onMatchCreated(match);
    } else {
      const { match, matchJoinStatus } = await joinMatch(joiningMatchCode);

      if (matchJoinStatus !== MatchJoinStatus.SUCCESS) {
        // NOTE: Improve error messaging
        alert("Could not join match with error: " + matchJoinStatus);
        return;
      }

      props.onMatchJoined(match);
    }
  };

  return (
    <>
      <div class="flex flex-col space-y-2">
        <label for="matchCode">Match Code</label>
        <input
          type="text"
          name="matchCode"
          class="bg-white border-[1px] rounded-lg px-4 py-2"
          placeholder="P-XXXX"
          onInput={matchCodeHandler}
          onPaste={matchCodeHandler}
        />
      </div>

      <Show
        when={matchCode().length > 0}
        fallback={
          <button
            class="px-4 py-2 text-base bg-teal-700 border-[1px] border-teal-700 text-white rounded-lg uppercase"
            onClick={onSubmit}
          >
            Create Match
          </button>
        }
      >
        <button
          class="px-4 py-2 text-base bg-blue-800 border-[1px] border-blue-800 text-white rounded-lg uppercase disabled:opacity-50"
          disabled={matchCode().length < MATCH_CODE_LENGTH}
          onClick={onSubmit}
        >
          Join Match
        </button>
      </Show>
    </>
  );
}
