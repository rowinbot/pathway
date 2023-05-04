<script lang="ts">
  import Card from "./card.svelte";
  import { fullDeckRows, isEmptyCard } from "game-logic";
  import CardContainer from "./cards/card-container.svelte";
  import Coin from "./cards/coin.svelte";
</script>

<div class="overflow-x-auto w-full flex flex-row">
  <ul
    class="grid grid-cols-10 gap-2 p-8 flex-1 max-w-5xl mx-auto min-w-[500px]"
  >
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
</div>
