<script lang="ts">
  import type { MatchConfig, MatchCurrentTurn, MatchPlayer } from "game-logic";
  import CountdownTimer from "./misc/countdown-timer.svelte";

  export let matchCurrentTurn: MatchCurrentTurn | null = null;
  export let matchCurrentTurnPlayer: MatchPlayer | null = null;
  export let currentMatchPlayer: MatchPlayer | null = null;
  export let matchConfig: MatchConfig;
</script>

{#if matchCurrentTurn && matchCurrentTurnPlayer}
  <section class="flex-1 max-w-xl mx-auto space-y-2 px-2">
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
