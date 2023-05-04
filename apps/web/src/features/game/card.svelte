<script lang="ts">
  import {
    BlackCardKind,
    type Card,
    RedCardKind,
    cardKind,
    cardNumber,
  } from "game-logic";
  import CardContainer from "./cards/card-container.svelte";
  import Clover from "./cards/clover.svelte";
  import Diamond from "./cards/diamond.svelte";
  import Heart from "./cards/heart.svelte";
  import Spade from "./cards/spade.svelte";

  export let card: Card;

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

  const marginX = 30;
  const marginY = 20;

  const redColor = "#F24E1E";
  const blackColor = "#222222";
</script>

<CardContainer>
  <g
    style="transform: translateX(calc({width - marginX}px)) translateY({height -
      marginY}px)"
  >
    <text text-anchor="middle" class="font-mono" fill={blackColor}
      >{cardNumber(card)}</text
    >
  </g>

  <g
    style="transform: translateX(calc({marginX}px)) translateY(calc({marginY}px - 0.25em))"
  >
    <text text-anchor="middle" class="font-mono" fill={blackColor} dy="1em"
      >{cardNumber(card)}</text
    >
  </g>

  {#if cardKind(card) === RedCardKind.Diamonds}
    <Diamond color={cardColor(card)} />
  {:else if cardKind(card) === RedCardKind.Hearts}
    <Heart color={cardColor(card)} />
  {:else if cardKind(card) === BlackCardKind.Clover}
    <Clover color={cardColor(card)} />
  {:else if cardKind(card) === BlackCardKind.Spades}
    <Spade color={cardColor(card)} />
  {/if}
</CardContainer>
