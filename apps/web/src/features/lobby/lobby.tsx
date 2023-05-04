/** @jsxImportSource solid-js */

import { createInputMask, maskArrayToFn } from "@solid-primitives/input-mask";
import { Show, createSignal } from "solid-js";

export default function Lobby() {
  const [matchCode, setMatchCode] = createSignal("");
  const matchCodeMask = maskArrayToFn(["P", "-", /[0-9a-zA-Z]{0,4}/i]);
  const matchCodeHandler = createInputMask((v, selection) => {
    const value = matchCodeMask(v.toLocaleUpperCase(), selection);
    setMatchCode(value[0]);

    return value;
  });

  return (
    <form class="space-y-6" method="post">
      <header class="space-y-2">
        <h1 class="font-base text-5xl">Lobby</h1>
        <p class="text-2xl font-light">Join or create a new match.</p>
      </header>

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
            type="submit"
          >
            Create Match
          </button>
        }
      >
        <button
          class="px-4 py-2 text-base bg-blue-800 border-[1px] border-blue-800 text-white rounded-lg uppercase disabled:opacity-50"
          disabled={matchCode().length < 6}
          type="submit"
        >
          Join Match
        </button>
      </Show>
    </form>
  );
}
