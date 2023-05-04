/** @jsxImportSource solid-js */

import { createInputMask, maskArrayToFn } from "@solid-primitives/input-mask";
import { Show, createSignal } from "solid-js";

export default function Lobby() {
  const [gameCode, setGameCode] = createSignal("");
  const gameCodeMask = maskArrayToFn(["P", "-", /[0-9a-zA-Z]{0,4}/i]);
  const gameCodeHandler = createInputMask((v, selection) => {
    const value = gameCodeMask(v.toLocaleUpperCase(), selection);
    setGameCode(value[0]);

    return value;
  });

  return (
    <form class="space-y-6" method="post">
      <header class="space-y-2">
        <h1 class="font-black text-5xl">Lobby</h1>
        <p class="text-2xl font-light">Join or create a new game.</p>
      </header>

      <div class="flex flex-col space-y-2">
        <label for="gameCode">Game Code</label>
        <input
          type="text"
          name="gameCode"
          class="bg-white border-[1px] rounded-lg px-4 py-2"
          placeholder="P-XXXX"
          onInput={gameCodeHandler}
          onPaste={gameCodeHandler}
        />
      </div>

      <Show
        when={gameCode().length > 0}
        fallback={
          <button
            class="px-4 py-2 text-base bg-teal-700 border-[1px] border-teal-700 text-white rounded-lg uppercase"
            type="submit"
          >
            Create Game
          </button>
        }
      >
        <button
          class="px-4 py-2 text-base bg-blue-800 border-[1px] border-blue-800 text-white rounded-lg uppercase disabled:opacity-50"
          disabled={gameCode().length < 6}
          type="submit"
        >
          Join Game
        </button>
      </Show>
    </form>
  );
}
