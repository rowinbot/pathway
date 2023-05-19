<script lang="ts">
  import { type MatchPlayer } from "game-logic";
  import { createEventDispatcher } from "svelte";
  import Icon from "@iconify/svelte";
  import { createDraggable } from "../misc/droppable";

  export let player: MatchPlayer;
  export let droppableArea: string;
  export let currentMatchPlayer: MatchPlayer | null = null;
  export let draggable = false;

  const dispatch = createEventDispatcher<{
    "start-game": void;
  }>();

  const { onDragStart, onDragEnd, onKeyDown } = createDraggable(
    droppableArea,
    player.id,
    () => null
  );

  function startGame() {
    dispatch("start-game");
  }
</script>

<p
  class="whitespace-nowrap select-none"
  {draggable}
  on:dragstart={onDragStart}
  on:dragend={onDragEnd}
  on:keydown={onKeyDown}
>
  <span
    class:text-blue-700={currentMatchPlayer &&
      player.id === currentMatchPlayer.id}
  >
    @{player.nickname}

    {#if player.id === currentMatchPlayer?.id}
      (you)
    {/if}
  </span>

  <span
    class="w-2 h-2 align-middle inline-block rounded-full"
    class:bg-green-600={player.isConnected}
    class:bg-yellow-500={!player.isConnected}
    aria-label="Player is {player.isConnected ? 'connected' : 'disconnected'}"
  />

  {#if player.isOwner}
    <Icon
      aria-label="Owner of the match"
      icon="mdi:shield-crown"
      class="inline text-xl text-yellow-700"
    />
  {/if}
</p>
