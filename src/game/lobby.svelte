<script lang="ts">
  import Card from "./card.svelte";
  import { fullDeckRows, isEmptyCard } from "./cards";
  import CardContainer from "./cards/card-container.svelte";
  import Coin from "./cards/coin.svelte";
</script>

<ul class="grid grid-cols-10 gap-2 p-8 max-w-5xl mx-auto">
  {#each fullDeckRows as row}
    {#each row as card}
      {#if !isEmptyCard(card)}
        <li><Card {card} /></li>
      {:else}
        <li>
          <CardContainer>
            <Coin color="#383838" />
          </CardContainer>
        </li>
      {/if}
    {/each}
  {/each}
</ul>
