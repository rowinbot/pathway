<script lang="ts">
  import { type MatchPlayer, getMatchTeamsPlayers } from "game-logic";
  import { createEventDispatcher } from "svelte";
  import Icon from "@iconify/svelte";
  import { getMatchTeamName, teamHeaderColor } from "../../../utils/match-team";

  export let currentMatchPlayer: MatchPlayer | null = null;
  export let matchPlayers: MatchPlayer[];

  const dispatch = createEventDispatcher<{
    "start-game": void;
  }>();

  $: matchTeams = getMatchTeamsPlayers(matchPlayers);

  function startGame() {
    dispatch("start-game");
  }
</script>

<div class="max-w-5xl px-2 mx-auto space-y-6">
  <section class="space-y-2">
    <h2 class="text-lg font-bold">Teams</h2>

    <div class="w-full grid md:grid-cols-3 gap-4">
      {#each Object.entries(matchTeams) as [team, players]}
        <div class="bg-gray-100 rounded-xl">
          <h3
            class="rounded-t-xl px-4 py-2 text-white"
            style="background-color: {teamHeaderColor(+team)}"
          >
            {getMatchTeamName(+team)}
          </h3>

          <ul class="px-4 pt-2 pb-4 space-y-2 overflow-x-auto">
            {#each players as player}
              <li>
                <p class="whitespace-nowrap">
                  <span
                    class:text-blue-700={currentMatchPlayer &&
                      player.id === currentMatchPlayer.id}
                  >
                    @{player.nickname}

                    {#if player.id === currentMatchPlayer?.id}
                      (you)
                    {/if}
                  </span>

                  <span
                    class="w-2 h-2 align-middle inline-block rounded-full"
                    class:bg-green-600={player.isConnected}
                    class:bg-yellow-500={!player.isConnected}
                    aria-label="Player is {player.isConnected
                      ? 'connected'
                      : 'disconnected'}"
                  />

                  {#if player.isOwner}
                    <Icon
                      aria-label="Owner of the match"
                      icon="mdi:shield-crown"
                      class="inline text-xl text-yellow-700"
                    />
                  {/if}
                </p>
              </li>
            {/each}
          </ul>
        </div>
      {/each}
    </div>
  </section>

  {#if currentMatchPlayer?.isOwner}
    <button
      on:click={startGame}
      class="px-4 py-2 text-base bg-teal-700 border-[1px] border-teal-700 text-white rounded-lg uppercase"
    >
      Start
    </button>
  {/if}
</div>
