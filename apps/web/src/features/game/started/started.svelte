<script lang="ts">
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
  import { teamWinnerBoardColor } from "@/utils/match-team";
  import Winner from "./winner.svelte";

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
  }>();

  let showHintsForCard: CardObject | null = null;
  let showAllHints = false;

  $: isCurrentPlayerTurn =
    matchCurrentTurnPlayer?.id === currentMatchPlayer?.id;

  function onPickCard(
    e: CustomEvent<{ card: CardObject; row: number; col: number }>
  ) {
    showHintsForCard = null;
    dispatch("pick-card", e.detail);
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

  <Winner
    on:start-new-game
    {matchWinner}
    isOwner={currentMatchPlayer?.isOwner ?? false}
  />

  <section
    class="py-6 transition-colors duration-75 relative"
    style={matchWinner === null
      ? ""
      : `background: ${teamWinnerBoardColor(matchWinner)}`}
    class:bg-orange-100={matchWinner === null && !isCurrentPlayerTurn}
    class:bg-green-100={matchWinner === null && isCurrentPlayerTurn}
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
