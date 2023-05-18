<script lang="ts">
  import { CARD_HEIGHT, CARD_WIDTH } from "@/utils/svg";

  const width = CARD_WIDTH;
  const height = CARD_HEIGHT;

  export let color: string;
</script>

<svg
  width="100%"
  viewBox="0 0 {width} {height}"
  fill="none"
  xmlns="http://www.w3.org/2000/svg"
>
  <g class="translate-y-4">
    <circle
      cx="93.5"
      cy="96.5"
      r="46.5"
      fill="white"
      stroke="black"
      stroke-width="2"
    />
    <circle cx="93.5" cy="96.5" r="41.5" fill={color} />
    <circle
      cx="148.5"
      cy="100.5"
      r="46.5"
      fill="white"
      stroke="black"
      stroke-width="2"
    />
    <circle cx="148.5" cy="100.5" r="41.5" fill={color} />
    <circle
      cx="134.5"
      cy="142.5"
      r="46.5"
      fill="white"
      stroke="black"
      stroke-width="2"
    />
    <circle cx="134.5" cy="142.5" r="41.5" fill={color} />
  </g>
</svg>
