<script lang="ts">
  import { PartyNewMatchMode } from "game-logic";

  import type {
    MatchPlayerHand,
    MatchConfig,
    MatchCurrentTurn,
    MatchPlayer,
    Card as CardObject,
    BoardState,
    TeamI,
  } from "game-logic";
  import Board from "./board.svelte";
  import { createEventDispatcher } from "svelte";
  import PlayerHand from "./player-hand.svelte";
  import TurnTimer from "./turn-timer.svelte";
  import Teams from "./teams.svelte";
  import { getMatchTeamName } from "@/utils/match-team";

  export let boardState: BoardState;
  export let matchCurrentTurn: MatchCurrentTurn | null = null;
  export let matchCurrentTurnPlayer: MatchPlayer | null = null;
  export let currentMatchPlayer: MatchPlayer | null = null;
  export let matchPlayers: MatchPlayer[];
  export let matchWinner: TeamI | null = null;
  export let matchConfig: MatchConfig;
  export let playerHand: MatchPlayerHand | null = null;
  export let lastPlayedCard: CardObject | null = null;

  const dispatch = createEventDispatcher<{
    "pick-card": { card: CardObject; row: number; col: number };
    "start-new-game": { mode: PartyNewMatchMode };
  }>();

  let showHintsForCard: CardObject | null = null;
  let showAllHints = false;

  $: isCurrentPlayerTurn =
    matchCurrentTurnPlayer?.id === currentMatchPlayer?.id;

  $: {
    console.log(matchWinner);
  }

  function onPickCard(
    e: CustomEvent<{ card: CardObject; row: number; col: number }>
  ) {
    showHintsForCard = null;
    dispatch("pick-card", e.detail);
  }

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

<div class="space-y-4">
  {#if matchWinner === null}
    <TurnTimer
      {matchConfig}
      {currentMatchPlayer}
      {matchCurrentTurn}
      {matchCurrentTurnPlayer}
    />
  {/if}

  {#if matchWinner !== null && currentMatchPlayer?.isOwner}
    <section class="max-w-xl mx-auto space-y-2 px-2">
      <p class="text-2xl">
        Winner team: <span class="font-bold"
          >{getMatchTeamName(matchWinner)}</span
        >
      </p>

      <div class="flex flex-row flex-wrap gap-4">
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
    </section>
  {/if}

  <section
    class="py-6 transition-colors duration-75"
    class:bg-orange-100={!isCurrentPlayerTurn}
    class:bg-green-100={isCurrentPlayerTurn}
  >
    <div class="max-w-xl mx-auto space-y-2 px-2">
      <h2 class="text-2xl font-bold">Board</h2>

      <Board
        {playerHand}
        {currentMatchPlayer}
        {boardState}
        {showHintsForCard}
        {showAllHints}
        on:pick-card={onPickCard}
      />
    </div>
  </section>

  {#if currentMatchPlayer && playerHand}
    <PlayerHand
      {playerHand}
      {lastPlayedCard}
      playerTeam={currentMatchPlayer.team}
      bind:showHintsForCard
      bind:showAllHints
    />
  {/if}

  <Teams {matchPlayers} {currentMatchPlayer} {matchCurrentTurnPlayer} />
</div>
