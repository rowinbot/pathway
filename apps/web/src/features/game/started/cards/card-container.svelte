<script lang="ts">
  import { CARD_HEIGHT, CARD_WIDTH } from "@/utils/svg";

  const width = CARD_WIDTH;
  const height = CARD_HEIGHT;

  export let bgColor: string = "#fff";
  export let borderColor: string | null = null;
</script>

<button
  class="h-full rounded-lg border-[1px]"
  style="border-color: {borderColor ?? '#ddd'}; background-color: {bgColor};"
  on:click
>
  <svg
    width="100%"
    viewBox="0 0 {width} {height}"
    fill="none"
    class="text-5xl"
    xmlns="http://www.w3.org/2000/svg"
  >
    <slot />
  </svg>
</button>
