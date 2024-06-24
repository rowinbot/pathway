<script lang="ts">
  import type {
    MatchConfig,
    MatchCurrentTurn,
    MatchPlayer,
    MatchPlayerHand,
    Card as CardObject,
  } from "game-logic";
  import Icon from "@iconify/svelte";
  import PlayerHand from "./player-hand.svelte";
  import CountdownTimer from "./misc/countdown-timer.svelte";

  export let matchCurrentTurn: MatchCurrentTurn | null = null;
  export let currentMatchPlayer: MatchPlayer | null = null;
  export let matchConfig: MatchConfig;
  export let playerHand: MatchPlayerHand | null = null;
  export let lastPlayedCard: CardObject | null = null;
  export let matchCurrentTurnPlayer: MatchPlayer | null = null;
  export let showHintsForCard: CardObject | null = null;
  export let showAllHints = false;

  function onClickShowAllHints() {
    showAllHints = !showAllHints;
    showHintsForCard = null;
  }
</script>

<section
  class="py-2 flex-shrink-0 mx-auto sticky bottom-0 inset-x-0 bg-blue-900 bg-opacity-20 backdrop-blur-2xl items-center flex flex-col"
>
  <div class="space-y-2 max-w-xl px-2">
    <div class="flex flex-row justify-between items-center">
      {#if matchCurrentTurnPlayer}
        <h2 class="text-xl font-bold">
          {matchCurrentTurnPlayer.nickname}

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
      {/if}

      <button
        class="px-4 py-2 flex flex-row gap-2 items-center bg-white rounded-full"
        on:click={onClickShowAllHints}
      >
        {#if showAllHints}
          <Icon icon="mdi:lightbulb-on" aria-hidden />
        {:else}
          <Icon icon="mdi:lightbulb-off" aria-hidden />
        {/if}

        {showAllHints ? "Hide hints" : "Show hints"}
      </button>
    </div>

    {#if currentMatchPlayer && playerHand}
      <PlayerHand
        {playerHand}
        {lastPlayedCard}
        bind:showHintsForCard
        bind:showAllHints
        on:pick-card
      >
        {#if matchCurrentTurn !== null}
          {#key matchCurrentTurn.turnStartTime}
            <CountdownTimer
              durationInSeconds={matchConfig.turnTimeLimitSeconds}
              startTimeUTC={matchCurrentTurn.turnStartTime}
            />
          {/key}
        {/if}
      </PlayerHand>
    {/if}
  </div>
</section>
