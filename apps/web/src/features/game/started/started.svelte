<script lang="ts">
  import type {
    BoardState,
    MatchConfig,
    MatchCurrentTurn,
    MatchPlayer,
    MatchPlayerHand,
    Card as CardObject,
  } from "game-logic";
  import Board from "./board.svelte";
  import Card from "./card.svelte";
  import { fly } from "svelte/transition";
  import { flip } from "svelte/animate";
  import CountdownTimer from "./misc/countdown-timer.svelte";
  import CardContainer from "./cards/card-container.svelte";
  import Coin from "./cards/coin.svelte";
  import { createEventDispatcher } from "svelte";

  export let boardState: BoardState;
  export let matchCurrentTurn: MatchCurrentTurn | null = null;
  export let matchCurrentTurnPlayer: MatchPlayer | null = null;
  export let currentMatchPlayer: MatchPlayer | null = null;
  export let matchConfig: MatchConfig;
  export let playerHand: MatchPlayerHand;

  const dispatch = createEventDispatcher<{
    "pick-card": { card: CardObject; row: number; col: number };
  }>();

  let showHintsForCard: CardObject | null = null;
  let showAllHints = false;

  function onPickHandCard(e: CustomEvent<{ card: CardObject }>) {
    const card = e.detail.card;

    showAllHints = false;

    if (card.id === showHintsForCard?.id) {
      showHintsForCard = null;
    } else {
      showHintsForCard = e.detail.card;
    }
  }

  function onPickCard(
    e: CustomEvent<{ card: CardObject; row: number; col: number }>
  ) {
    showHintsForCard = null;
    dispatch("pick-card", e.detail);
  }

  function onClickShowAllHints() {
    showAllHints = !showAllHints;
    showHintsForCard = null;
  }
</script>

<div class="space-y-4">
  {#if matchCurrentTurn && matchCurrentTurnPlayer}
    <section class="flex-1 max-w-5xl mx-auto space-y-2">
      <h2 class="text-2xl font-bold">
        Turn: {matchCurrentTurnPlayer.nickname}

        {#if matchCurrentTurnPlayer.id === currentMatchPlayer?.id}
          (you)
        {/if}
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

  <section class="max-w-5xl mx-auto space-y-2">
    <h2 class="text-2xl font-bold">Board</h2>

    <Board
      {playerHand}
      {currentMatchPlayer}
      {boardState}
      {showHintsForCard}
      {showAllHints}
      on:pick-card={onPickCard}
    />
  </section>

  <section class="flex-1 max-w-5xl mx-auto space-y-2">
    <h2 class="text-2xl font-bold">Your hand</h2>

    <ul class="grid grid-cols-10 gap-1 md:gap-2">
      {#each playerHand.cards as card (card.uid)}
        <li animate:flip in:fly={{ y: -5 }} out:fly={{ y: 100 }}>
          <Card
            {card}
            row={0}
            col={0}
            disabled={false}
            occupiedByTeam={null}
            on:pick-card={onPickHandCard}
          />
        </li>
      {/each}

      <li>
        <CardContainer on:click={onClickShowAllHints}>
          <Coin color="#383838" />
        </CardContainer>
      </li>
    </ul>
  </section>
</div>
