<script lang="ts">
  import {
    type MatchPlayer,
    getMatchTeamName,
    getMatchTeams,
  } from "game-logic";
  import { createEventDispatcher } from "svelte";

  export let matchPlayers: MatchPlayer[];

  const dispatch = createEventDispatcher<{
    "start-game": void;
  }>();

  $: matchTeams = getMatchTeams(matchPlayers);

  $: {
    console.log(matchTeams);
  }

  function startGame() {
    dispatch("start-game");
  }
</script>

<section>
  <h2 class="text-lg font-bold">Teams</h2>

  <div class="w-full grid grid-cols-3">
    {#each Object.keys(matchTeams) as team}
      <td>
        {getMatchTeamName(+team)}
      </td>
    {/each}

    {#each matchTeams as players}
      <td>
        <ul>
          {#each players as player}
            <li>
              <p>
                <span
                  class="w-2 h-2 align-middle inline-block rounded-full"
                  class:bg-green-600={player.isConnected}
                  class:bg-yellow-500={!player.isConnected}
                  aria-hidden
                />

                {player.nickname}
              </p>
            </li>
          {/each}
        </ul>
      </td>
    {/each}
  </div>

  <button on:click={startGame}> Start </button>
</section>
