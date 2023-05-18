<script lang="ts">
  import type {
    MatchPlayerHand,
    Card as CardObject,
    MatchTeamI,
  } from "game-logic";
  import Card from "./card.svelte";
  import { fly } from "svelte/transition";
  import { flip } from "svelte/animate";
  import CardContainer from "./cards/card-container.svelte";
  import Coin from "./cards/coin.svelte";
  import TeamCoins from "./cards/team-coins.svelte";
  import { teamTokenColor } from "@/utils/match-team";

  export let playerTeam: MatchTeamI;
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

  function onClickShowAllHints() {
    showAllHints = !showAllHints;
    showHintsForCard = null;
  }
</script>

<section class="flex-1 max-w-xl mx-auto space-y-2 px-2">
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

    <li>
      <TeamCoins color={teamTokenColor(playerTeam)} />
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
</section>
