<script lang="ts">
  import { CARD_HEIGHT, CARD_WIDTH } from "../../../../utils/svg";

  const width = CARD_WIDTH;
  const height = CARD_HEIGHT;

  export let bgColor: string = "#fff";
</script>

<button on:click>
  <svg
    width="100%"
    viewBox="0 0 {width} {height}"
    fill="none"
    class="text-5xl rounded-lg border-[1px] border-gray-300"
    xmlns="http://www.w3.org/2000/svg"
  >
    <rect {width} {height} rx="11" fill={bgColor} />
    <rect {width} {height} rx="11" fill={bgColor} />

    <slot />
  </svg>
</button>
