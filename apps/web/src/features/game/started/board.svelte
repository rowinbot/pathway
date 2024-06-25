<script lang="ts">
  import type {
    BoardState,
    MatchPlayer,
    MatchPlayerHand,
    Card as CardObject,
  } from "game-logic";
  import {
    staticBoardRows,
    isEmptyCard,
    getMatchingHandCardIndexToPositionInBoard,
    testHandCardToPositionInBoard,
  } from "game-logic";
  import Card from "./card.svelte";
  import CardContainer from "./cards/card-container.svelte";
  import Coin from "./cards/coin.svelte";
  import { fly } from "svelte/transition";

  export let boardState: BoardState;
  export let playerHand: MatchPlayerHand | null = null;
  export let currentMatchPlayer: MatchPlayer | null = null;
  export let showHintsForCard: CardObject | null = null;
  export let showAllHints: boolean = false;
</script>

<ul class="grid grid-cols-10 gap-1 md:gap-1 flex-1 max-w-5xl w-full mx-auto">
  {#each staticBoardRows as row, rowI}
    {#each row as card, colI}
      {#if !isEmptyCard(card)}
        {@const isDisabled = currentMatchPlayer
          ? showAllHints
            ? getMatchingHandCardIndexToPositionInBoard(
                boardState,
                currentMatchPlayer.team,
                playerHand,
                rowI,
                colI,
                true,
              ) === null
            : showHintsForCard
              ? testHandCardToPositionInBoard(
                  boardState,
                  currentMatchPlayer.team,
                  showHintsForCard,
                  rowI,
                  colI,
                ) === false
              : false
          : false}

        <li in:fly={{ y: -5 }}>
          <Card
            occupiedByTeam={boardState[rowI][colI].team}
            isPartOfASequence={boardState[rowI][colI].isPartOfASequence}
            row={rowI}
            col={colI}
            disabled={isDisabled}
            {card}
            on:pick-card
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
