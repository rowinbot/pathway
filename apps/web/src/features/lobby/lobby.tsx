/** @jsxImportSource solid-js */

import { Show, createResource } from "solid-js";
import { loadPlayer } from "@/utils/services/player.service";
import type { Match } from "game-logic";
import { JoinOrCreateMatch } from "./join-or-create-match";

export default function Lobby() {
  const [player] = createResource(loadPlayer);

  const goToGame = async (match: Match) => {
    window.location.assign(`/game/${match.code}`);
  };

  return (
    <section class="space-y-6">
      <header class="space-y-2">
        <h1 class="font-base text-5xl">Lobby</h1>
        <p class="text-2xl font-light">
          Join or create a new match
          <Show when={player() !== null}>
            <span class="ml-2 text-slate-500">- @{player()?.nickname}</span>
          </Show>
        </p>
      </header>

      <JoinOrCreateMatch
        player={player() ?? null}
        onMatchCreated={goToGame}
        onMatchJoined={goToGame}
      />
    </section>
  );
}
