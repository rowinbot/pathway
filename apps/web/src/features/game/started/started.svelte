<script lang="ts">
  import type { BoardState, MatchPlayerHand } from "game-logic";
  import Board from "./board.svelte";
  import Card from "./card.svelte";
  import { fade, fly } from "svelte/transition";
  import { flip } from "svelte/animate";

  export let boardState: BoardState;
  export let playerHand: MatchPlayerHand;
</script>

<section class="p-8 flex-1 max-w-5xl mx-auto min-w-[500px]">
  <h2 class="text-2xl font-bold">Your hand</h2>

  <ul class="grid grid-cols-10 gap-2">
    {#each playerHand.cards as card (card.uid)}
      <li animate:flip in:fly={{ y: -100 }} out:fly={{ y: 100 }}>
        <Card {card} row={0} col={0} occupiedByTeam={null} />
      </li>
    {/each}
  </ul>
</section>

<Board {boardState} on:place-card />
