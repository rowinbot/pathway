/** @jsxImportSource solid-js */

import { createResource } from "solid-js";
import { loadPlayer } from "@/utils/services/player.service";
import type { Match, Player } from "game-logic";
import { JoinOrCreateMatch } from "./join-or-create-match";
import EditableNickname from "./editable-nickname";

export default function Lobby() {
  const [player, { refetch }] = createResource<Player | null>(loadPlayer, {
    initialValue: null,
  });

  const goToGame = async (match: Match) => {
    window.location.assign(`/game/${match.code}`);
  };

  return (
    <section class="space-y-6">
      <header class="space-y-2">
        <h1 class="font-base text-5xl">Lobby</h1>

        <div>
          <p class="inline text-2xl font-light">
            {"Join or create a new match - "}
          </p>

          <EditableNickname
            nickname={player()?.nickname ?? ""}
            submitting={player.loading}
            onUpdate={refetch}
          />
        </div>
      </header>

      <JoinOrCreateMatch
        player={player() ?? null}
        onMatchCreated={goToGame}
        onMatchJoined={goToGame}
      />
    </section>
  );
}
