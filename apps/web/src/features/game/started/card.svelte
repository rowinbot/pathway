<script lang="ts">
  import type { Card, BoardPosition } from "game-logic";
  import {
    BlackCardKind,
    RedCardKind,
    cardKind,
    cardNumber,
    TeamI,
  } from "game-logic";
  import CardContainer from "./cards/card-container.svelte";
  import Clover from "./cards/clover.svelte";
  import Diamond from "./cards/diamond.svelte";
  import Heart from "./cards/heart.svelte";
  import Spade from "./cards/spade.svelte";
  import { createEventDispatcher } from "svelte";
  import PlayerCoin from "./cards/player-coin.svelte";
  import { teamCardHighlightColor, teamTokenColor } from "@/utils/match-team";

  export let card: Card;
  export let row: number;
  export let col: number;
  export let disabled: boolean;
  export let occupiedByTeam: TeamI | null;
  export let isPartOfASequence = false;

  $: cardKindOpacity = disabled ? 0.25 : 1;

  const dispatch = createEventDispatcher<{
    "pick-card": BoardPosition & { card: Card };
  }>();

  const width = 240;
  const height = 280;

  const marginX = 15;
  const marginY = 20;

  const redCardKindColor = "#e00000";
  const blackCardKindColor = "#222222";

  function cardColor(card: Card) {
    switch (cardKind(card)) {
      case BlackCardKind.Clover:
      case BlackCardKind.Spades:
        return blackCardKindColor;
      case RedCardKind.Diamonds:
      case RedCardKind.Hearts:
        return redCardKindColor;
    }
  }

  function onPlaceCard() {
    dispatch("pick-card", { card, row, col });
  }
</script>

<CardContainer
  borderColor={isPartOfASequence ? "#000" : null}
  bgColor={teamCardHighlightColor(occupiedByTeam)}
  on:click={onPlaceCard}
  on:keydown={onPlaceCard}
>
  <g
    style="transform: translateX(calc({marginX}px)) translateY(calc({marginY}px - 0.25em))"
  >
    <text
      text-anchor="start"
      class="font-mono"
      fill={blackCardKindColor}
      dy="1em">{cardNumber(card)}</text
    >
  </g>

  <g
    style="transform: translateX(calc({width - marginX}px)) translateY({height -
      marginY}px)"
  >
    <text
      style="transform: scaleX(-1) scaleY(-1)"
      text-anchor="start"
      class="font-mono"
      fill={blackCardKindColor}
      dy="0.75em">{cardNumber(card)}</text
    >
  </g>

  {#if cardKind(card) === RedCardKind.Diamonds}
    <Diamond opacity={cardKindOpacity} color={cardColor(card)} />
  {:else if cardKind(card) === RedCardKind.Hearts}
    <Heart opacity={cardKindOpacity} color={cardColor(card)} />
  {:else if cardKind(card) === BlackCardKind.Clover}
    <Clover opacity={cardKindOpacity} color={cardColor(card)} />
  {:else if cardKind(card) === BlackCardKind.Spades}
    <Spade opacity={cardKindOpacity} color={cardColor(card)} />
  {/if}

  {#if occupiedByTeam !== null}
    <PlayerCoin color={teamTokenColor(occupiedByTeam)} opacity={1} />
  {/if}
</CardContainer>
