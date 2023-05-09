<script lang="ts">
  import type {
    BoardState,
    MatchConfig,
    MatchCurrentTurn,
    MatchPlayer,
    MatchPlayerHand,
  } from "game-logic";
  import Board from "./board.svelte";
  import Card from "./card.svelte";
  import { fly } from "svelte/transition";
  import { flip } from "svelte/animate";
  import CountdownTimer from "./misc/countdown-timer.svelte";

  export let boardState: BoardState;
  export let matchCurrentTurn: MatchCurrentTurn | null = null;
  export let matchCurrentTurnPlayer: MatchPlayer | null = null;
  export let matchConfig: MatchConfig;
  export let playerHand: MatchPlayerHand;

  $: console.log("matchCurrentTurn", matchCurrentTurn);
</script>

<div class="space-y-4">
  {#if matchCurrentTurn && matchCurrentTurnPlayer}
    <section class="flex-1 max-w-5xl mx-auto min-w-[500px] space-y-2">
      <h2 class="text-2xl font-bold">
        Turn: {matchCurrentTurnPlayer.nickname}
        <span
          class="w-3 h-3 align-middle inline-block rounded-full"
          class:bg-green-600={matchCurrentTurnPlayer.isConnected}
          class:bg-yellow-500={!matchCurrentTurnPlayer.isConnected}
          aria-hidden
        />
      </h2>

      {#key matchCurrentTurn.turnStartTime}
        <CountdownTimer
          durationInSeconds={matchConfig.turnTimeLimitSeconds}
          startTimeUTC={matchCurrentTurn.turnStartTime}
        />
      {/key}
    </section>
  {/if}

  <section class="flex-1 max-w-5xl mx-auto min-w-[500px] space-y-2">
    <h2 class="text-2xl font-bold">Your hand</h2>

    <ul class="grid grid-cols-10 gap-2">
      {#each playerHand.cards as card (card.uid)}
        <li animate:flip in:fly={{ y: -5 }} out:fly={{ y: 100 }}>
          <Card {card} row={0} col={0} occupiedByTeam={null} />
        </li>
      {/each}
    </ul>
  </section>

  <section class="max-w-5xl mx-auto space-y-2">
    <h2 class="text-2xl font-bold">Board</h2>

    <Board {boardState} on:place-card />
  </section>
</div>
