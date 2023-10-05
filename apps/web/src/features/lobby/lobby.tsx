/** @jsxImportSource solid-js */

import { createResource } from "solid-js";
import { loadPlayer } from "@/utils/services/player.service";
import type { Party, Player } from "game-logic";
import { JoinOrCreateParty } from "./join-or-create-party";
import EditableNickname from "./editable-nickname";

export default function Lobby() {
  const [player, { refetch }] = createResource<Player | null>(loadPlayer, {
    initialValue: null,
  });

  const goToGame = async (party: Party) => {
    window.location.assign(`/game/${party.code}`);
  };

  return (
    <section class="space-y-6">
      <header class="space-y-2">
        <h1 class="font-base text-5xl">Lobby</h1>

        <div>
          <p class="inline text-2xl font-light">
            {"Join or create a new game - "}
          </p>

          <EditableNickname
            nickname={player()?.nickname ?? ""}
            submitting={player.loading}
            onUpdate={refetch}
          />
        </div>
      </header>

      <JoinOrCreateParty
        player={player() ?? null}
        onPartyCreated={goToGame}
        onPartyJoined={goToGame}
      />
    </section>
  );
}
