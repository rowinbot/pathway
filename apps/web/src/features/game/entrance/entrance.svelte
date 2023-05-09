<script lang="ts">
  import {
    type MatchPlayer,
    getMatchTeamName,
    getMatchTeams,
    MatchTeamI,
  } from "game-logic";
  import { createEventDispatcher } from "svelte";
  import Icon from "@iconify/svelte";

  export let currentMatchPlayer: MatchPlayer | null = null;
  export let matchPlayers: MatchPlayer[];

  const dispatch = createEventDispatcher<{
    "start-game": void;
  }>();

  $: matchTeams = getMatchTeams(matchPlayers);

  function startGame() {
    dispatch("start-game");
  }

  function teamHeaderColor(team: MatchTeamI) {
    switch (team) {
      case MatchTeamI.One:
        return "#A00";
      case MatchTeamI.Two:
        return "#00f";
      case MatchTeamI.Three:
        return "#080";
    }
  }
</script>

<div class="space-y-6">
  <section>
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
                    class="w-2 h-2 align-middle inline-block rounded-full"
                    class:bg-green-600={player.isConnected}
                    class:bg-yellow-500={!player.isConnected}
                    aria-label="Player is {player.isConnected
                      ? 'connected'
                      : 'disconnected'}"
                  />

                  {player.nickname}

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
