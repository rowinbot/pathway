<script lang="ts">
  import {
    BlackCardKind,
    type Card,
    RedCardKind,
    cardKind,
    cardNumber,
    MatchTeamI,
  } from "game-logic";
  import CardContainer from "./cards/card-container.svelte";
  import Clover from "./cards/clover.svelte";
  import Diamond from "./cards/diamond.svelte";
  import Heart from "./cards/heart.svelte";
  import Spade from "./cards/spade.svelte";
  import { createEventDispatcher } from "svelte";
  import PlayerCoin from "./cards/player-coin.svelte";

  export let card: Card;
  export let row: number;
  export let col: number;
  export let disabled: boolean;
  export let occupiedByTeam: MatchTeamI | null;

  $: cardKindOpacity = disabled ? 0.25 : 1;

  const dispatch = createEventDispatcher<{
    "place-card": { card: Card; row: number; col: number };
  }>();

  const cardColor = (card: Card) => {
    switch (card.kind) {
      case BlackCardKind.Clover:
      case BlackCardKind.Spades:
        return blackColor;
      case RedCardKind.Diamonds:
      case RedCardKind.Hearts:
        return redColor;
    }
  };

  const width = 240;
  const height = 336;

  const marginX = 15;
  const marginY = 20;

  const redColor = "#FF0000";
  const blackColor = "#222222";

  function onPlaceCard() {
    dispatch("place-card", { card, row, col });
  }

  function highlightColor(team: MatchTeamI | null) {
    switch (team) {
      case MatchTeamI.One:
        return "#fff";
      case MatchTeamI.Two:
        return "#fff";
      case MatchTeamI.Three:
        return "#fff";
      default:
        return "#fff";
    }
  }

  function tokenColor(team: MatchTeamI) {
    switch (team) {
      case MatchTeamI.One:
        return "#f80";
      case MatchTeamI.Two:
        return "#00f";
      case MatchTeamI.Three:
        return "#0f0";
    }
  }
</script>

<CardContainer
  bgColor={highlightColor(occupiedByTeam)}
  {disabled}
  on:click={onPlaceCard}
  on:keydown={onPlaceCard}
>
  <g
    style="transform: translateX(calc({marginX}px)) translateY(calc({marginY}px - 0.25em))"
  >
    <text text-anchor="start" class="font-mono" fill={blackColor} dy="1em"
      >{cardNumber(card)}</text
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
      fill={blackColor}
      dy="0.75em">{cardNumber(card)}</text
    >
  </g>

  <g opacity={cardKindOpacity}>
    {#if cardKind(card) === RedCardKind.Diamonds}
      <Diamond color={cardColor(card)} />
    {:else if cardKind(card) === RedCardKind.Hearts}
      <Heart color={cardColor(card)} />
    {:else if cardKind(card) === BlackCardKind.Clover}
      <Clover color={cardColor(card)} />
    {:else if cardKind(card) === BlackCardKind.Spades}
      <Spade color={cardColor(card)} />
    {/if}
  </g>

  {#if occupiedByTeam !== null}
    <PlayerCoin color={tokenColor(occupiedByTeam)} />
  {/if}
</CardContainer>
