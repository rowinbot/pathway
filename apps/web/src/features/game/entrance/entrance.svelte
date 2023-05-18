<script lang="ts">
  import { type MatchPlayer, getMatchTeamsPlayers, TeamI } from "game-logic";
  import { createEventDispatcher } from "svelte";
  import { getMatchTeamName, teamHeaderColor } from "../../../utils/match-team";
  import { createDroppable } from "../misc/droppable";
  import TeamPlayer from "./team-player.svelte";

  export let currentMatchPlayer: MatchPlayer | null = null;
  export let matchPlayers: MatchPlayer[];

  const dispatch = createEventDispatcher<{
    "start-game": void;
    "drop-player-to-team": {
      playerId: string;
      team: TeamI;
    };
  }>();

  $: matchTeams = getMatchTeamsPlayers(matchPlayers);

  const { onDragOver, onDrop } = createDroppable(
    (playerId: string, target: HTMLDivElement) => {
      const maybeTeam = target.dataset.team;

      if (maybeTeam !== undefined && maybeTeam !== null) {
        dispatch("drop-player-to-team", {
          playerId,
          team: +maybeTeam,
        });
      }
    },
    (playerId) => matchPlayers.some((p) => p.id === playerId)
  );

  function startGame() {
    dispatch("start-game");
  }
</script>

<div class="max-w-5xl px-2 mx-auto space-y-6">
  <section class="space-y-2">
    <h2 class="text-lg font-bold">Teams</h2>

    <div class="w-full grid md:grid-cols-3 gap-4">
      {#each Object.entries(matchTeams) as [team, players]}
        {@const droppableArea = "team" + team}

        <div
          id={droppableArea}
          data-team={team}
          class="bg-gray-100 rounded-xl"
          on:dragover={onDragOver}
          on:drop={onDrop}
        >
          <h3
            class="rounded-t-xl px-4 py-2 text-white"
            style="background-color: {teamHeaderColor(+team)}"
          >
            {getMatchTeamName(+team)}
          </h3>

          <ul class="px-4 pt-2 pb-4 space-y-2 overflow-x-auto">
            {#each players as player}
              <li>
                <TeamPlayer {droppableArea} {player} {currentMatchPlayer} />
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
