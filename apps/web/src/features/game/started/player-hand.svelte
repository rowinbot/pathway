<script lang="ts">
  import { type MatchPlayerHand, type Card as CardObject } from "game-logic";
  import Card from "./card.svelte";
  import { fly } from "svelte/transition";
  import { flip } from "svelte/animate";

  export let playerHand: MatchPlayerHand;
  export let lastPlayedCard: CardObject | null = null;
  export let showHintsForCard: CardObject | null = null;
  export let showAllHints = false;

  function onPickHandCard(e: CustomEvent<{ card: CardObject }>) {
    const card = e.detail.card;

    showAllHints = false;

    if (card.id === showHintsForCard?.id) {
      showHintsForCard = null;
    } else {
      showHintsForCard = e.detail.card;
    }
  }

  const activeHintBorderColor = "blue";
</script>

<ul class="grid grid-cols-10 gap-1 md:gap-1">
  {#each playerHand.cards as card (card.uid)}
    <li animate:flip in:fly={{ y: -5 }} out:fly={{ y: 100 }}>
      <Card
        {card}
        row={0}
        col={0}
        disabled={false}
        occupiedByTeam={null}
        borderColor={showHintsForCard?.id === card.id
          ? activeHintBorderColor
          : null}
        on:pick-card={onPickHandCard}
      />
    </li>
  {/each}

  <li></li>

  <li class="m-auto">
    <slot />
  </li>

  {#if lastPlayedCard}
    <li>
      <Card
        card={lastPlayedCard}
        row={0}
        col={0}
        disabled={true}
        occupiedByTeam={null}
        on:pick-card={onPickHandCard}
      />
    </li>
  {/if}
</ul>
