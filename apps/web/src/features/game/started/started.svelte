<script lang="ts">
  import type { BoardState, MatchPlayerHand } from "game-logic";
  import Board from "./board.svelte";
  import Card from "./card.svelte";

  export let boardState: BoardState;
  export let playerHand: MatchPlayerHand;
</script>

<Board {boardState} on:place-card />

<section class="p-8 flex-1 max-w-5xl mx-auto min-w-[500px]">
  <h2 class="text-2xl font-bold">Your hand</h2>

  <ul class="grid grid-cols-10 gap-2">
    {#each playerHand.cards as card}
      <li>
        <Card {card} row={0} col={0} occupiedByTeam={null} />
      </li>
    {/each}
  </ul>
</section>
