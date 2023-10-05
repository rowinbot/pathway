<script lang="ts">
  import { getMatchTeamName, teamTokenColor } from "@/utils/match-team";
  import { PartyNewMatchMode, type TeamI } from "game-logic";
  import TeamCoins from "./cards/team-coins.svelte";
  import { createEventDispatcher } from "svelte";

  export let matchWinner: TeamI | null = null;
  export let isOwner: boolean;

  const dispatch = createEventDispatcher<{
    "start-new-game": { mode: PartyNewMatchMode };
  }>();

  function onShuffle() {
    dispatch("start-new-game", { mode: PartyNewMatchMode.SHUFFLE });
  }

  function onFastRematch() {
    dispatch("start-new-game", { mode: PartyNewMatchMode.FAST_REMATCH });
  }

  function onRematch() {
    dispatch("start-new-game", { mode: PartyNewMatchMode.NORMAL });
  }
</script>

{#if matchWinner !== null}
  <div class="bg-white/80 backdrop-blur-sm flex">
    <section class="max-w-xl mx-auto space-y-2 px-2">
      <h2 class="text-2xl font-bold">
        Winner:
        <div class="inline-block w-8 align-middle">
          <TeamCoins color={teamTokenColor(matchWinner)} />
        </div>
        {getMatchTeamName(matchWinner)}
      </h2>
    </section>
  </div>

  {#if isOwner}
    <div class="flex flex-row justify-center flex-wrap gap-4">
      <button
        on:click={onShuffle}
        class="px-4 py-2 text-base bg-teal-700 border-[1px] border-teal-700 text-white rounded-lg uppercase"
      >
        Shuffle Rematch
      </button>

      <button
        on:click={onFastRematch}
        class="px-4 py-2 text-base bg-teal-700 border-[1px] border-teal-700 text-white rounded-lg uppercase"
      >
        Fast Rematch
      </button>

      <button
        on:click={onRematch}
        class="px-4 py-2 text-base bg-teal-700 border-[1px] border-teal-700 text-white rounded-lg uppercase"
      >
        Rematch
      </button>
    </div>
  {/if}
{/if}
