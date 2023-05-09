<script lang="ts">
  import Card from "./card.svelte";
  import {
    type BoardState,
    type MatchPlayer,
    type MatchPlayerHand,
    staticBoardRows,
    isEmptyCard,
    getMatchPlayerCardIndexForPositionInBoard,
  } from "game-logic";
  import CardContainer from "./cards/card-container.svelte";
  import Coin from "./cards/coin.svelte";

  export let boardState: BoardState;
  export let playerHand: MatchPlayerHand;
  export let currentMatchPlayer: MatchPlayer | null = null;
</script>

<div class="overflow-x-auto w-full flex flex-row">
  <ul class="grid grid-cols-10 gap-2 flex-1 max-w-5xl mx-auto min-w-[500px]">
    {#each staticBoardRows as row, rowI}
      {#each row as card, colI}
        {#if !isEmptyCard(card)}
          <li>
            <Card
              occupiedByTeam={boardState[rowI][colI]}
              row={rowI}
              col={colI}
              disabled={currentMatchPlayer
                ? getMatchPlayerCardIndexForPositionInBoard(
                    boardState,
                    currentMatchPlayer.team,
                    playerHand,
                    rowI,
                    colI
                  ) === null
                : false}
              {card}
              on:place-card
            />
          </li>
        {:else}
          <li>
            <CardContainer>
              <Coin color="#383838" />
            </CardContainer>
          </li>
        {/if}
      {/each}
    {/each}
  </ul>
</div>
