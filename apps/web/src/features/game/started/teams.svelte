<script lang="ts">
  import { getMatchTeamName, teamTokenColor } from "@/utils/match-team";
  import type { MatchPlayer } from "game-logic";
  import { getMatchTeamsPlayers } from "game-logic";
  import TeamCoins from "./cards/team-coins.svelte";

  export let matchPlayers: MatchPlayer[];
  export let currentMatchPlayer: MatchPlayer | null = null;
  export let matchCurrentTurnPlayer: MatchPlayer | null = null;

  $: matchTeams = getMatchTeamsPlayers(matchPlayers).filter(
    (t) => t.length > 0 // Filter out teams without players
  );
</script>

<section class="flex-1 max-w-xl mx-auto space-y-2 px-2">
  <h2 class="text-2xl font-bold">Teams</h2>

  <ul>
    {#each matchTeams as team, i}
      <li>
        <h3 class="text-lg font-semibold">
          Team {getMatchTeamName(i)}

          <span class="inline-block w-5 h-6 align-middle">
            <TeamCoins color={teamTokenColor(i)} />
          </span>
        </h3>

        <ul>
          {#each team as player}
            <li
              class="p-2 border-[1px] border-gray-300 rounded-lg"
              class:bg-green-100={matchCurrentTurnPlayer?.id === player.id}
            >
              <span>
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
            </li>
          {/each}
        </ul>
      </li>
    {/each}
  </ul>
</section>
